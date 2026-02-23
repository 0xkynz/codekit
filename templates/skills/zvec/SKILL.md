---
name: zvec
description: Zvec vector database development — collection management, vector similarity search, schema design, embedding functions, indexing strategies, and query optimization. Use when working with Zvec collections, vector embeddings, similarity search, hybrid queries, or reranking.
---

# Zvec Vector Database Expert

Expert in Zvec vector database development for storing, indexing, and searching vector embeddings with scalar filtering.

## When to Use

- Creating or managing Zvec collections and schemas
- Inserting, upserting, updating, or deleting documents with vector embeddings
- Performing vector similarity search (single-vector, multi-vector, hybrid)
- Choosing and configuring vector indexes (Flat, HNSW, IVF)
- Setting up embedding functions (dense, sparse, custom)
- Optimizing query performance and collection indexing
- Implementing reranking strategies for search results
- Schema evolution (adding/dropping fields, altering types, managing indexes)

## Quick Reference

| Topic | Reference |
|-------|-----------|
| [Quickstart Guide](references/quickstart.md) | Installation, basic CRUD, and first search |
| [Collections](references/collections.md) | Create, open, inspect, destroy, optimize |
| [Data Operations](references/data-operations.md) | Insert, upsert, update, delete, fetch |
| [Query & Search](references/query-search.md) | Single-vector, multi-vector, filter, hybrid |
| [Concepts & Indexing](references/concepts-indexing.md) | Data modeling, vector types, index strategies |
| [Embedding & Reranking](references/embedding-reranking.md) | Embedding functions, rerankers, custom implementations |

## Installation

**Python:**
```bash
pip install zvec
```

**Node.js:**
```bash
npm install @zvec/zvec
```

## Core Workflow

```python
import zvec

# 1. Optional global config
zvec.init(log_level=zvec.LogLevel.WARN, query_threads=4)

# 2. Define schema
schema = zvec.CollectionSchema(
    name="my_collection",
    fields=[
        zvec.FieldSchema(name="category", data_type=zvec.DataType.ARRAY_STRING,
                         index_param=zvec.InvertIndexParam()),
        zvec.FieldSchema(name="year", data_type=zvec.DataType.INT32,
                         index_param=zvec.InvertIndexParam(enable_range_optimization=True)),
    ],
    vectors=[
        zvec.VectorSchema(name="embedding", dimension=768,
                          index_param=zvec.HnswIndexParam(metric_type=zvec.MetricType.COSINE)),
    ],
)

# 3. Create collection
collection = zvec.create_and_open(path="/path/to/collection", schema=schema)

# 4. Insert documents
collection.insert(zvec.Doc(
    id="doc_1",
    vectors={"embedding": [0.1] * 768},
    fields={"category": ["AI", "ML"], "year": 2024},
))

# 5. Optimize for search performance
collection.optimize()

# 6. Query
results = collection.query(
    vectors=zvec.VectorQuery(field_name="embedding", vector=[0.3] * 768),
    filter="year >= 2020",
    topk=10,
)
```

## Index Selection Guide

| Index | Best For | Trade-off |
|-------|----------|-----------|
| **Flat** | Small datasets, prototyping, exact recall | Linear scan — slow at scale |
| **HNSW** | Production, low-latency, high recall (recommended default) | Higher memory footprint |
| **IVF** | Large datasets with natural clustering | Requires parameter tuning |

## Data Types

**Scalar:** STRING, BOOL, INT32, INT64, UINT32, UINT64, FLOAT, DOUBLE (+ ARRAY_ variants)
**Dense vectors:** VECTOR_FP32, VECTOR_FP16, VECTOR_INT8
**Sparse vectors:** SPARSE_VECTOR_FP32, SPARSE_VECTOR_FP16

## Key Patterns

- Call `optimize()` after batch inserts (~100k+ docs) to merge flat buffer into configured index
- Use `upsert()` instead of `insert()` when document IDs may already exist
- Index scalar fields you plan to filter on; skip indexing display-only fields
- Use `HnswIndexParam` as default index for production workloads
- Combine dense + sparse vectors with `WeightedReRanker` or `RrfReRanker` for hybrid search
- Monitor `collection.stats.index_completeness` to track indexing progress
- Schema is dynamic — add/drop scalar fields without recreating the collection
