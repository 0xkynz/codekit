# Zvec Query & Search

The `query()` method supports vector similarity search, conditional filtering, or both combined. Returns a `list[Doc]` with matched documents and relevance scores.

## Single-Vector Search

The most typical search pattern — find documents most similar to a query embedding.

```python
import zvec

result = collection.query(
    vectors=zvec.VectorQuery(
        field_name="dense_embedding",
        vector=[0.1] * 768,
    ),
    topk=10,
)
```

### VectorQuery Parameters

- `field_name` — target vector field
- `vector` — explicit query vector, **OR**
- `id` — document ID to reuse its stored embedding (cannot use both)
- `param` (optional) — index-specific tuning (e.g., `HnswQueryParam(ef=200)`)

### Query Parameters

| Parameter | Purpose |
|-----------|---------|
| `vectors` | VectorQuery or list of VectorQuery objects |
| `topk` | Number of similar documents to return |
| `include_vector` | Return full embeddings when `True` |
| `output_fields` | Restrict scalar fields in results |
| `filter` | SQL-like boolean expression |
| `reranker` | Reranking strategy (multi-vector only) |

### Index-Specific Query Parameters

```python
# HNSW — adjust ef for recall/latency trade-off
zvec.VectorQuery(
    field_name="embedding",
    vector=[...],
    param=zvec.HnswQueryParam(ef=200),
)

# IVF — adjust n_probe for recall/speed trade-off
zvec.VectorQuery(
    field_name="embedding",
    vector=[...],
    param=zvec.IVFQueryParam(n_probe=32),
)
```

## Multi-Vector Search

Combine different embeddings in a single search. Zvec retrieves top candidates from each vector field independently, then uses a reranker to fuse scores.

```python
result = collection.query(
    topk=10,
    vectors=[
        zvec.VectorQuery(field_name="dense_embedding", vector=[0.1] * 768),
        zvec.VectorQuery(field_name="sparse_embedding", vector={1: 0.1, 37: 0.43}),
    ],
    reranker=zvec.WeightedReRanker(
        topn=3,
        metric=zvec.MetricType.IP,
        weights={
            "dense_embedding": 1.2,
            "sparse_embedding": 1.0,
        },
    ),
)
```

- `topk` — candidates retrieved from **each** vector field before reranking
- `topn` — final number of documents returned after fusion

### Reranking Strategies

| Strategy | Mechanism | Best For |
|----------|-----------|----------|
| `WeightedReRanker` | Combines normalized scores using custom weights | Comparable scores, known importance weights |
| `RrfReRanker` | Reciprocal Rank Fusion (position-based, score-agnostic) | Different metrics/scales, tuning-free |

**WeightedReRanker:**
```python
zvec.WeightedReRanker(
    topn=5,
    metric=zvec.MetricType.IP,
    weights={"dense_embedding": 1.2, "sparse_embedding": 1.0},
)
```

**RrfReRanker:**
```python
zvec.RrfReRanker(
    topn=5,
    rank_constant=60,  # Controls how quickly rank influence decreases
)
```

RRF formula: `RRF(r) = 1 / (k + r + 1)`

## Conditional Filtering

Filter documents using scalar field conditions (like SQL WHERE). Results appear in internal storage order.

```python
results = collection.query(filter="publish_year < 1999", topk=50)
```

### Comparison Operators

| Operator | Description |
|----------|-------------|
| `<`, `<=`, `>`, `>=` | Numeric/string comparisons |
| `=`, `!=` | Equality (integers, floats, strings, booleans) |
| `is null`, `is not null` | Null detection |

### Membership Operators

| Operator | Description |
|----------|-------------|
| `in`, `not in` | Value list matching |
| `contain_all`, `contain_any` | Array element checking |
| `array_length()` | Array size evaluation |

### String Operators

| Operator | Description |
|----------|-------------|
| `like` | Pattern matching with `%` wildcards |

Examples: `'Smart%'` (prefix), `'%.log'` (suffix)

### Logical Operators

- `and` — all conditions must be true
- `or` — at least one condition must be true
- `()` — control evaluation order

### Syntax Rules

- String literals: single or double quotes (`'value'` or `"value"`)
- Booleans: `true`/`false` (case-insensitive)
- Membership lists: parentheses `(value1, value2)`
- Range queries perform best with `enable_range_optimization=True`

### Filter Examples

```python
# Simple comparison
filter="publish_year < 1900"

# Membership
filter='category in ("Science", "Math")'

# Array operations
filter='tags contain_any ("ai", "ml")'

# Combined
filter='publish_year > 2000 AND (language = "English" OR language = "Chinese")'

# Null check
filter="description is not null"

# Pattern matching
filter='title like "Machine%"'
```

## Hybrid Search (Vector + Filter)

Combine vector similarity with scalar filtering — only matching documents are considered.

```python
result = collection.query(
    vectors=zvec.VectorQuery(
        field_name="dense_embedding",
        vector=[0.1] * 768,
    ),
    filter="publish_year > 1936",
    topk=10,
)
```

## Grouped Query

**Coming soon** — SQL-like `GROUP BY` semantics for vector search. Will allow grouping results by scalar fields.

## Result Structure

Each returned `Doc` contains:
- `id` — document identifier
- `score` — relevance score
- `vectors` — embeddings (only if `include_vector=True`)
- `fields` — scalar values (all by default, or restricted via `output_fields`)
