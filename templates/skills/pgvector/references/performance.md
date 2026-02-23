# pgvector Performance

## Tuning

Use [PgTune](https://pgtune.leopard.in.ua/) for initial Postgres server parameters.

```sql
-- Find config file
SHOW config_file;

-- Check settings
SHOW shared_buffers;  -- should be ~25% of server memory
```

Restart Postgres for changes to take effect.

## Loading Data

Use `COPY` for bulk loading:
```sql
COPY items (embedding) FROM STDIN WITH (FORMAT BINARY);
```

Add indexes **after** loading initial data for best performance.

## Index Build Time

### HNSW

```sql
-- Ensure graph fits in memory
SET maintenance_work_mem = '8GB';

-- Increase parallel workers
SET max_parallel_maintenance_workers = 7;  -- plus leader
-- May also need to increase:
SET max_parallel_workers = 8;  -- default
```

A notice appears when the graph no longer fits in `maintenance_work_mem`. Don't set it so high it exhausts server memory.

For Docker, ensure `--shm-size` is at least `maintenance_work_mem`:
```sh
docker run --shm-size=1g ...
```

### IVFFlat

```sql
SET max_parallel_maintenance_workers = 7;
```

### Production

Always create indexes concurrently:
```sql
CREATE INDEX CONCURRENTLY ...
```

## Querying Performance

### Debug with EXPLAIN

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM items ORDER BY embedding <-> '[3,1,2]' LIMIT 5;
```

### Exact Search Speed

```sql
SET max_parallel_workers_per_gather = 4;
```

For normalized vectors (like OpenAI embeddings), inner product is fastest:
```sql
SELECT * FROM items ORDER BY embedding <#> '[3,1,2]' LIMIT 5;
```

### Approximate Search Speed

Increase IVFFlat lists (at expense of recall):
```sql
CREATE INDEX ON items USING ivfflat (embedding vector_l2_ops) WITH (lists = 1000);
```

## Monitoring

Enable pg_stat_statements:
```sql
CREATE EXTENSION pg_stat_statements;
```

Find slowest queries:
```sql
SELECT query, calls, ROUND((total_plan_time + total_exec_time) / calls) AS avg_time_ms,
    ROUND((total_plan_time + total_exec_time) / 60000) AS total_time_min
FROM pg_stat_statements ORDER BY total_plan_time + total_exec_time DESC LIMIT 20;
```

Monitor recall by comparing approximate vs exact search:
```sql
BEGIN;
SET LOCAL enable_indexscan = off;  -- force exact search
SELECT ...
COMMIT;
```

Check index size:
```sql
SELECT pg_size_pretty(pg_relation_size('index_name'));
```

## Scaling

Scale pgvector like standard Postgres:
- **Vertical:** Increase memory, CPU, storage. Tune parameters.
- **Horizontal:** Replicas for read scaling. Citus or similar for sharding.

pgvector supports WAL for replication and point-in-time recovery.

## Troubleshooting

### Query Not Using Index

The query needs `ORDER BY` + `LIMIT`, with `ORDER BY` being a distance operator (not an expression) in ascending order:

```sql
-- Uses index
ORDER BY embedding <=> '[3,1,2]' LIMIT 5;

-- Does NOT use index
ORDER BY 1 - (embedding <=> '[3,1,2]') DESC LIMIT 5;
```

Force index use:
```sql
BEGIN;
SET LOCAL enable_seqscan = off;
SELECT ...
COMMIT;
```

Small tables may be faster with a sequential scan.

### Query Not Using Parallel Scan

Out-of-line storage skews cost estimates. Fix:
```sql
BEGIN;
SET LOCAL min_parallel_table_scan_size = 1;
SET LOCAL parallel_setup_cost = 1;
SELECT ...
COMMIT;
```

Or store vectors inline:
```sql
ALTER TABLE items ALTER COLUMN embedding SET STORAGE PLAIN;
```

### Fewer Results After Adding HNSW Index

Results limited by `hnsw.ef_search` (default 40), dead tuples, or filter conditions. Enable iterative scans:
```sql
SET hnsw.iterative_scan = strict_order;
```

`NULL` vectors and zero vectors (for cosine) are not indexed.

### Fewer Results After Adding IVFFlat Index

Index likely created with too little data. Drop and recreate after more data loads:
```sql
DROP INDEX index_name;
```

Results also limited by `ivfflat.probes`. Enable iterative scans to help.

### Storage Limits

- Non-partitioned table: 32 TB (Postgres default)
- Partitioned: thousands of 32 TB partitions
- Replication: fully supported via WAL
