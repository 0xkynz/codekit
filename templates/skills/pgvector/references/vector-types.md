# pgvector Vector Types

## Standard Vectors (`vector`)

```sql
CREATE TABLE items (id bigserial PRIMARY KEY, embedding vector(3));
INSERT INTO items (embedding) VALUES ('[1,2,3]'), ('[4,5,6]');
```

Storage: `4 * dimensions + 8` bytes. Up to 16,000 dimensions. All elements must be finite.

Use `vector` without dimensions to store variable-dimension vectors:
```sql
CREATE TABLE embeddings (model_id bigint, item_id bigint, embedding vector, PRIMARY KEY (model_id, item_id));

-- Index specific dimensions with partial index
CREATE INDEX ON embeddings USING hnsw ((embedding::vector(3)) vector_l2_ops) WHERE (model_id = 123);

-- Query
SELECT * FROM embeddings WHERE model_id = 123 ORDER BY embedding::vector(3) <-> '[3,1,2]' LIMIT 5;
```

For more precision, use `double precision[]` or `numeric[]`:
```sql
CREATE TABLE items (id bigserial PRIMARY KEY, embedding double precision[]);
INSERT INTO items (embedding) VALUES ('{1,2,3}'), ('{4,5,6}');  -- use {} not []

-- Optional dimension check
ALTER TABLE items ADD CHECK (vector_dims(embedding::vector) = 3);

-- Index at lower precision
CREATE INDEX ON items USING hnsw ((embedding::vector(3)) vector_l2_ops);
```

## Half-Precision Vectors (`halfvec`)

2 bytes per element (vs 4 for vector). Up to 16,000 dimensions.

```sql
CREATE TABLE items (id bigserial PRIMARY KEY, embedding halfvec(3));
```

### Half-Precision Indexing

Index full-precision vectors at half precision for smaller indexes:
```sql
CREATE INDEX ON items USING hnsw ((embedding::halfvec(3)) halfvec_l2_ops);
SELECT * FROM items ORDER BY embedding::halfvec(3) <-> '[1,2,3]' LIMIT 5;
```

HNSW supports up to 4,000 dimensions with halfvec.

## Binary Vectors (`bit`)

Storage: `dimensions / 8 + 8` bytes. Supports Hamming and Jaccard distance.

```sql
CREATE TABLE items (id bigserial PRIMARY KEY, embedding bit(3));
INSERT INTO items (embedding) VALUES ('000'), ('111');

-- Hamming distance
SELECT * FROM items ORDER BY embedding <~> '101' LIMIT 5;

-- Jaccard distance
SELECT * FROM items ORDER BY embedding <%> '101' LIMIT 5;
```

HNSW supports up to 64,000 dimensions with bit vectors.

### Binary Quantization

Index with binary quantization for compact representation:
```sql
CREATE INDEX ON items USING hnsw ((binary_quantize(embedding)::bit(3)) bit_hamming_ops);

-- Query
SELECT * FROM items ORDER BY binary_quantize(embedding)::bit(3) <~> binary_quantize('[1,-2,3]') LIMIT 5;

-- Re-rank for better recall
SELECT * FROM (
    SELECT * FROM items ORDER BY binary_quantize(embedding)::bit(3) <~> binary_quantize('[1,-2,3]') LIMIT 20
) ORDER BY embedding <=> '[1,-2,3]' LIMIT 5;
```

Enables indexing up to 64,000 dimensions.

## Sparse Vectors (`sparsevec`)

Storage: `8 * non-zero elements + 16` bytes. Up to 16,000 non-zero elements.

Format: `{index1:value1,index2:value2}/dimensions` (indices start at 1).

```sql
CREATE TABLE items (id bigserial PRIMARY KEY, embedding sparsevec(5));
INSERT INTO items (embedding) VALUES ('{1:1,3:2,5:3}/5'), ('{1:4,3:5,5:6}/5');

-- L2 distance
SELECT * FROM items ORDER BY embedding <-> '{1:3,3:1,5:2}/5' LIMIT 5;
```

HNSW supports up to 1,000 non-zero elements with sparsevec.

## Indexing Subvectors

Index a portion of a vector:
```sql
CREATE INDEX ON items USING hnsw ((subvector(embedding, 1, 3)::vector(3)) vector_cosine_ops);

-- Query
SELECT * FROM items ORDER BY subvector(embedding, 1, 3)::vector(3) <=> subvector('[1,2,3,4,5]'::vector, 1, 3) LIMIT 5;

-- Re-rank by full vectors
SELECT * FROM (
    SELECT * FROM items ORDER BY subvector(embedding, 1, 3)::vector(3) <=> subvector('[1,2,3,4,5]'::vector, 1, 3) LIMIT 20
) ORDER BY embedding <=> '[1,2,3,4,5]' LIMIT 5;
```

## Hybrid Search

Combine vector search with Postgres full-text search:

```sql
SELECT id, content FROM items, plainto_tsquery('hello search') query
    WHERE textsearch @@ query ORDER BY ts_rank_cd(textsearch, query) DESC LIMIT 5;
```

Combine results using Reciprocal Rank Fusion or a cross-encoder reranker.

## Querying Patterns

### Get Distance

```sql
SELECT embedding <-> '[3,1,2]' AS distance FROM items;

-- Inner product (multiply by -1 since <#> returns negative)
SELECT (embedding <#> '[3,1,2]') * -1 AS inner_product FROM items;

-- Cosine similarity (1 - cosine distance)
SELECT 1 - (embedding <=> '[3,1,2]') AS cosine_similarity FROM items;
```

### Nearest Neighbor to a Row

```sql
SELECT * FROM items WHERE id != 1
    ORDER BY embedding <-> (SELECT embedding FROM items WHERE id = 1) LIMIT 5;
```

### Rows Within Distance

```sql
SELECT * FROM items WHERE embedding <-> '[3,1,2]' < 5;
```

Combine with `ORDER BY` and `LIMIT` to use an index.

### Aggregates

```sql
-- Average all vectors
SELECT AVG(embedding) FROM items;

-- Average by group
SELECT category_id, AVG(embedding) FROM items GROUP BY category_id;
```
