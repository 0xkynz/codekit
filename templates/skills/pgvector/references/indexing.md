# pgvector Indexing

By default, pgvector performs exact nearest neighbor search (perfect recall). Add an index for approximate nearest neighbor search, which trades some recall for speed.

## HNSW

Creates a multilayer graph. Better speed-recall tradeoff than IVFFlat, but slower builds and more memory. Can be created on an empty table (no training step).

### Create Index

Add an index for each distance function you use:

```sql
-- L2 distance
CREATE INDEX ON items USING hnsw (embedding vector_l2_ops);

-- Inner product
CREATE INDEX ON items USING hnsw (embedding vector_ip_ops);

-- Cosine distance
CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops);

-- L1 distance
CREATE INDEX ON items USING hnsw (embedding vector_l1_ops);

-- Hamming distance (binary)
CREATE INDEX ON items USING hnsw (embedding bit_hamming_ops);

-- Jaccard distance (binary)
CREATE INDEX ON items USING hnsw (embedding bit_jaccard_ops);
```

Supported types and max dimensions:
- `vector` — up to 2,000 dimensions
- `halfvec` — up to 4,000 dimensions (use `halfvec_l2_ops`, etc.)
- `bit` — up to 64,000 dimensions
- `sparsevec` — up to 1,000 non-zero elements (use `sparsevec_l2_ops`, etc.)

### Index Options

```sql
CREATE INDEX ON items USING hnsw (embedding vector_l2_ops)
    WITH (m = 16, ef_construction = 64);
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `m` | 16 | Max connections per layer |
| `ef_construction` | 64 | Build-time candidate list size |

Higher `ef_construction` = better recall, slower build/insert.

### Query Options

```sql
SET hnsw.ef_search = 100;  -- default 40
```

Higher value = better recall, slower queries.

Use `SET LOCAL` for a single query:
```sql
BEGIN;
SET LOCAL hnsw.ef_search = 100;
SELECT ...
COMMIT;
```

### Build Time Optimization

```sql
-- Ensure graph fits in memory
SET maintenance_work_mem = '8GB';

-- Increase parallel workers (default 2)
SET max_parallel_maintenance_workers = 7;  -- plus leader
```

- Create index **after** loading initial data
- Use `CREATE INDEX CONCURRENTLY` in production to avoid blocking writes

### Build Progress

```sql
SELECT phase, round(100.0 * blocks_done / nullif(blocks_total, 0), 1) AS "%"
FROM pg_stat_progress_create_index;
```

Phases: `initializing` → `loading tuples`

### Vacuuming

Speed up vacuuming by reindexing first:
```sql
REINDEX INDEX CONCURRENTLY index_name;
VACUUM table_name;
```

## IVFFlat

Divides vectors into lists, searches nearest lists. Faster builds and less memory than HNSW, but lower speed-recall tradeoff.

### Three Keys to Good Recall

1. Create the index **after** the table has data
2. Choose appropriate number of lists:
   - Up to 1M rows: `rows / 1000`
   - Over 1M rows: `sqrt(rows)`
3. Set appropriate number of probes: start with `sqrt(lists)`

### Create Index

```sql
-- L2 distance
CREATE INDEX ON items USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Inner product
CREATE INDEX ON items USING ivfflat (embedding vector_ip_ops) WITH (lists = 100);

-- Cosine distance
CREATE INDEX ON items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Hamming distance (binary)
CREATE INDEX ON items USING ivfflat (embedding bit_hamming_ops) WITH (lists = 100);
```

Supported types: `vector` (2,000 dims), `halfvec` (4,000 dims), `bit` (64,000 dims).

### Query Options

```sql
SET ivfflat.probes = 10;  -- default 1
```

Higher value = better recall, slower. Set to number of lists for exact search (planner won't use index).

### Build Time Optimization

```sql
SET max_parallel_maintenance_workers = 7;
```

### Build Progress

```sql
SELECT phase, round(100.0 * tuples_done / nullif(tuples_total, 0), 1) AS "%"
FROM pg_stat_progress_create_index;
```

Phases: `initializing` → `performing k-means` → `assigning tuples` → `loading tuples`

Note: `%` only populated during `loading tuples`.

## Filtering

Several strategies for `WHERE` clauses with vector search:

```sql
SELECT * FROM items WHERE category_id = 123 ORDER BY embedding <-> '[3,1,2]' LIMIT 5;
```

### Strategy 1: Index the Filter Column

```sql
CREATE INDEX ON items (category_id);
-- Or multicolumn
CREATE INDEX ON items (location_id, category_id);
```

Best when conditions match a low percentage of rows.

### Strategy 2: Approximate Index + Higher ef_search

```sql
CREATE INDEX ON items USING hnsw (embedding vector_l2_ops);
SET hnsw.ef_search = 200;
```

Filtering is applied **after** the index scan. With default `ef_search = 40` and 10% match rate, only ~4 rows match on average.

### Strategy 3: Iterative Index Scans (v0.8.0+)

Automatically scans more of the index until enough results are found:

```sql
-- Strict ordering (exact distance order)
SET hnsw.iterative_scan = strict_order;

-- Relaxed ordering (better recall, slightly out of order)
SET hnsw.iterative_scan = relaxed_order;
SET ivfflat.iterative_scan = relaxed_order;
```

Re-sort relaxed results with a materialized CTE:
```sql
WITH relaxed_results AS MATERIALIZED (
    SELECT id, embedding <-> '[1,2,3]' AS distance FROM items
    WHERE category_id = 123 ORDER BY distance LIMIT 5
) SELECT * FROM relaxed_results ORDER BY distance + 0;
```

For distance filtering, place the distance filter outside the CTE:
```sql
WITH nearest_results AS MATERIALIZED (
    SELECT id, embedding <-> '[1,2,3]' AS distance FROM items ORDER BY distance LIMIT 5
) SELECT * FROM nearest_results WHERE distance < 5 ORDER BY distance;
```

#### Iterative Scan Limits

**HNSW:**
```sql
SET hnsw.max_scan_tuples = 20000;    -- default, approximate
SET hnsw.scan_mem_multiplier = 2;    -- multiple of work_mem
```

**IVFFlat:**
```sql
SET ivfflat.max_probes = 100;
```

### Strategy 4: Partial Indexes

For few distinct filter values:
```sql
CREATE INDEX ON items USING hnsw (embedding vector_l2_ops) WHERE (category_id = 123);
```

### Strategy 5: Partitioning

For many distinct filter values:
```sql
CREATE TABLE items (embedding vector(3), category_id int) PARTITION BY LIST(category_id);
```
