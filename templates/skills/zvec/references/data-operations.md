# Zvec Data Operations

All write operations (insert, upsert, update, delete) are immediately visible for querying — enabling real-time streaming workloads.

## Document Structure

```python
zvec.Doc(
    id="unique_id",                          # Required: unique string identifier
    vectors={"field_name": [0.1, 0.2, ...]}, # Vector embeddings
    fields={"field_name": "value"},           # Scalar fields
)
```

- `id` is immutable after insertion
- Dense vectors: `list[float]` — must match schema dimension
- Sparse vectors: `dict[int, float]` — dimension index to weight mapping
- Nullable scalar fields can be omitted

## Insert

Adds new documents. **Fails** if document ID already exists.

```python
# Single document
result = collection.insert(
    zvec.Doc(
        id="text_1",
        vectors={"text_embedding": [0.1, 0.2, 0.3, 0.4]},
        fields={"text": "Sample text."},
    )
)
print(result)  # {"code": 0} = success

# Batch insert
result = collection.insert([
    zvec.Doc(id="text_1", vectors={...}, fields={...}),
    zvec.Doc(id="text_2", vectors={...}, fields={...}),
    zvec.Doc(id="text_3", vectors={...}, fields={...}),
])
print(result)  # [{"code":0}, {"code":0}, {"code":0}]
```

- Batch: individual failures don't prevent others from inserting
- Always verify each `Status` in the result list

### Sparse vector insertion

```python
collection.insert(
    zvec.Doc(
        id="text_1",
        vectors={"sparse_embedding": {42: 1.25, 1337: 0.8, 2999: 0.63}},
    )
)
```

### Multiple fields and vectors

```python
doc = zvec.Doc(
    id="book_1",
    vectors={
        "dense_embedding": [0.1] * 768,
        "sparse_embedding": {42: 1.25, 1337: 0.8, 1999: 0.64},
    },
    fields={
        "book_title": "Gone with the Wind",
        "category": ["Romance", "Classic Literature"],
        "publish_year": 1936,
    },
)
collection.insert(doc)
```

## Upsert

Adds new documents or **replaces** existing ones by ID (unlike insert which fails on duplicates).

```python
# Single
result = collection.upsert(
    zvec.Doc(id="text_1", vectors={...}, fields={...})
)

# Batch
result = collection.upsert([doc1, doc2, doc3])
```

Call `optimize()` after upserting large batches.

## Update

Modifies **specific fields/vectors** of existing documents. Unchanged content remains intact. Fails if document ID doesn't exist.

```python
# Single — update only specified fields
result = collection.update(
    zvec.Doc(
        id="book_1",
        vectors={"sparse_embedding": {35: 0.25, 237: 0.1, 369: 0.44}},
        fields={"category": ["Romance", "Classic Literature", "American Civil War"]},
    )
)

# Batch
results = collection.update([
    zvec.Doc(id="book_1", fields={"category": ["Romance"]}),
    zvec.Doc(id="book_2", fields={"book_title": "The Great Gatsby"}),
    zvec.Doc(id="book_3", fields={"book_title": "A Tale of Two Cities", "publish_year": 1859}),
])
```

## Delete

### By ID

```python
# Single
result = collection.delete(ids="doc_id_1")

# Multiple
result = collection.delete(ids=["doc_id_2", "doc_id_3"])
```

Non-zero status codes indicate failure (e.g., document doesn't exist).

### By Filter

```python
collection.delete_by_filter(filter="publish_year < 1900")

collection.delete_by_filter(
    filter='publish_year < 1900 AND (language = "English" OR language = "Chinese")'
)
```

Delete operations are **immediate and irreversible**.

## Fetch

Retrieves documents by ID — no searching, scoring, or filtering.

```python
# Single
result = collection.fetch(ids="book_1")
print(result)  # {"book_1": Doc(...)}

# Multiple
result = collection.fetch(ids=["book_1", "book_2", "book_3"])
```

- Missing IDs are silently omitted (no error)
- Dictionary does not guarantee input order — access by ID
