# Zvec Collections

A **collection** is a named container for documents — similar to a table in relational databases. Each collection has its own schema defining scalar fields and vectors.

## Create a Collection

Use `create_and_open()` to create on disk and return a ready-to-use handle. Raises an error if the collection already exists.

### Schema Components

**Scalar Fields** (`FieldSchema`):
- `name` — unique string identifier
- `data_type` — STRING, INT32, INT64, FLOAT, DOUBLE, BOOL, ARRAY_STRING, etc.
- `nullable` (optional) — allows no value (default `False`)
- `index_param` (optional) — `InvertIndexParam()` for fast filtering

Index options:
- `enable_range_optimization=True` — faster range queries
- `enable_extended_wildcard=True` — complex pattern matching

**Vector Fields** (`VectorSchema`):
- `name` — unique vector identifier
- `data_type` — VECTOR_FP32, VECTOR_FP16, VECTOR_INT8, SPARSE_VECTOR_FP32, SPARSE_VECTOR_FP16
- `dimension` — required for dense vectors
- `index_param` — `FlatIndexParam()`, `HnswIndexParam()`, or `IVFIndexParam()`

Index parameters:
- `metric_type` — COSINE, L2, or IP (inner product)
- `quantize_type` (optional) — compress vectors to reduce index size

### Collection Options

```python
option = zvec.CollectionOption(
    read_only=False,     # Must be False for create_and_open()
    enable_mmap=True,    # Memory-mapped I/O (default True)
)
```

### Full Example — Multi-Modal Product Search

```python
import zvec

schema = zvec.CollectionSchema(
    name="product_search",
    fields=[
        zvec.FieldSchema(name="category", data_type=zvec.DataType.ARRAY_STRING,
                         index_param=zvec.InvertIndexParam()),
        zvec.FieldSchema(name="price", data_type=zvec.DataType.INT32,
                         index_param=zvec.InvertIndexParam(enable_range_optimization=True)),
        zvec.FieldSchema(name="in_stock", data_type=zvec.DataType.BOOL,
                         index_param=zvec.InvertIndexParam()),
        zvec.FieldSchema(name="image_url", data_type=zvec.DataType.STRING),
        zvec.FieldSchema(name="description", data_type=zvec.DataType.STRING),
    ],
    vectors=[
        zvec.VectorSchema(name="image_vec", dimension=512,
                          index_param=zvec.HnswIndexParam(metric_type=zvec.MetricType.COSINE)),
        zvec.VectorSchema(name="description_vec", dimension=768,
                          index_param=zvec.HnswIndexParam(metric_type=zvec.MetricType.COSINE,
                                                          quantize_type=zvec.QuantizeType.INT8)),
        zvec.VectorSchema(name="keywords_sparse", data_type=zvec.DataType.SPARSE_VECTOR_FP32,
                          index_param=zvec.FlatIndexParam(metric_type=zvec.MetricType.IP)),
    ],
)

collection = zvec.create_and_open(
    path="/data/product_search",
    schema=schema,
    option=zvec.CollectionOption(read_only=False, enable_mmap=True),
)
```

## Open an Existing Collection

```python
collection = zvec.open(
    path="/path/to/collection",
    option=zvec.CollectionOption(read_only=False, enable_mmap=True),
)
```

- `read_only=True` — safe concurrent access across multiple processes, write attempts trigger errors
- `enable_mmap=True` — memory-mapped I/O for faster retrieval (default)

## Inspect a Collection

```python
print(collection.schema)   # Field definitions, types, dimensions, index params
print(collection.stats)    # doc_count, index_completeness (0.0–1.0)
print(collection.option)   # enable_mmap, read_only
print(collection.path)     # Filesystem path
```

## Optimize a Collection

Merges vectors from the flat buffer into the configured index. Non-blocking — allows concurrent reads, writes, and queries.

```python
collection.optimize()
```

- Newly inserted vectors go to a flat (brute-force) buffer first for max write throughput
- Search performance degrades as the flat buffer grows
- Call `optimize()` when ~100k+ unindexed documents accumulate
- Monitor with `collection.stats.index_completeness` (1.0 = fully indexed)

## Destroy a Collection

**Permanent and irreversible.** Deletes the collection directory and all contents.

```python
collection.destroy()
# Do NOT use the collection object after this
```

## Schema Evolution

Modify collection structure post-creation without downtime or data re-ingestion.

### Column DDL

**Add a column:**
```python
new_field = zvec.FieldSchema(name="rating", data_type=zvec.DataType.INT32)
collection.add_column(field_schema=new_field, expression="5")  # Default value for existing docs
```
Currently supports numerical scalar fields only.

**Drop a column (irreversible):**
```python
collection.drop_column(field_name="publish_year")
```

**Alter a column:**
```python
# Rename
collection.alter_column(old_name="publish_year", new_name="release_year")

# Change type (compatible conversions only, e.g., INT32 -> INT64)
updated = zvec.FieldSchema(name="rating", data_type=zvec.DataType.FLOAT)
collection.alter_column(field_schema=updated)
```

### Index DDL

**Create an index:**
```python
# Vector index
collection.create_index(
    field_name="dense_embedding",
    index_param=zvec.FlatIndexParam(metric_type=zvec.MetricType.COSINE),
)

# Scalar inverted index
collection.create_index(
    field_name="publish_year",
    index_param=zvec.InvertIndexParam(),
)
```

**Drop an index:**
```python
collection.drop_index(field_name="publish_year")
```
Cannot drop vector field indexes — every vector field must retain exactly one index.

### Supported Schema Operations

| Operation | Supported |
|-----------|-----------|
| Add/drop scalar fields | Yes |
| Rename fields | Yes |
| Change data types (safe conversions) | Yes |
| Create/drop scalar indexes | Yes |
| Create/replace vector indexes | Yes |
| Add/drop vector fields | Coming soon |
