# Zvec Quickstart

## Installation

**Python:**
```bash
pip install zvec
```

**Node.js:**
```bash
npm install @zvec/zvec
```

**Build from source:**
```bash
git clone --recurse-submodules https://github.com/alibaba/zvec.git
cd zvec
pip install .
```

Requirements: Python 3.9+, Linux or macOS (ARM64/x86_64), C++17 compiler.

## Optional Global Configuration

Call `init()` once at application startup before any collection operations:

```python
import zvec

zvec.init(
    log_type=zvec.LogType.CONSOLE,
    log_level=zvec.LogLevel.WARN,
    query_threads=4,
)
```

If omitted, Zvec applies sensible defaults tuned to system resources.

## Create a Collection

```python
collection_schema = zvec.CollectionSchema(
    name="my_collection",
    fields=[
        zvec.FieldSchema(name="publish_year", data_type=zvec.DataType.INT32)
    ],
    vectors=[
        zvec.VectorSchema(name="embedding", dimension=768)
    ],
)

collection = zvec.create_and_open(path="/path/to/collection", schema=collection_schema)
```

## Insert Documents

```python
collection.insert(
    zvec.Doc(
        id="book_1",
        vectors={"embedding": [0.1] * 768},
        fields={"publish_year": 1936},
    )
)
```

## Optimize for Search

```python
collection.optimize()
```

## Vector Similarity Search

```python
result = collection.query(
    vectors=zvec.VectorQuery(field_name="embedding", vector=[0.3] * 768),
    topk=10,
)
```

## Filtered Search

```python
result = collection.query(
    vectors=zvec.VectorQuery(field_name="embedding", vector=[0.3] * 768),
    filter="publish_year < 1900",
    topk=10,
)
```

## Inspect Collection

```python
print(collection.schema)   # Field definitions
print(collection.stats)    # doc_count, index_completeness
print(collection.option)   # Runtime settings
print(collection.path)     # Filesystem location
```

## Fetch by ID

```python
result = collection.fetch(ids="book_1")
```

## Delete Documents

```python
collection.delete(ids="book_1")
collection.delete_by_filter(filter="publish_year < 1900")
```
