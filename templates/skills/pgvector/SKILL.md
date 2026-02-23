---
name: pgvector
description: pgvector — open-source vector similarity search for Postgres. Covers storing/querying vectors, HNSW and IVFFlat indexing, filtering, half-precision/binary/sparse vectors, hybrid search, performance tuning, and all distance functions. Use when working with vector embeddings in PostgreSQL.
---

# pgvector Expert

Expert in pgvector — open-source vector similarity search extension for PostgreSQL. Supports exact and approximate nearest neighbor search with full Postgres ACID compliance.

## When to Use

- Storing vector embeddings alongside relational data in Postgres
- Creating and tuning HNSW or IVFFlat indexes
- Writing vector similarity queries (L2, inner product, cosine, L1, Hamming, Jaccard)
- Filtering vector search results with WHERE clauses
- Working with half-precision, binary, or sparse vectors
- Implementing hybrid search (vector + full-text)
- Optimizing pgvector query performance and index build times
- Choosing between exact and approximate nearest neighbor search

## Quick Reference

| Topic | Reference |
|-------|-----------|
| [Quickstart](references/quickstart.md) | Installation, enable extension, basic CRUD |
| [Indexing](references/indexing.md) | HNSW, IVFFlat, filtering, iterative scans |
| [Vector Types](references/vector-types.md) | Half-precision, binary, sparse, hybrid search |
| [Performance](references/performance.md) | Tuning, loading, monitoring, scaling |
| [Reference](references/reference.md) | All types, operators, functions |

## Installation

```sh
# Linux/Mac (Postgres 13+)
cd /tmp && git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
cd pgvector && make && make install

# Docker
docker pull pgvector/pgvector:pg18

# Homebrew
brew install pgvector

# APT (Debian/Ubuntu)
sudo apt install postgresql-18-pgvector
```

Enable in each database:
```sql
CREATE EXTENSION vector;
```

## Core Workflow

```sql
-- Create table with vector column
CREATE TABLE items (id bigserial PRIMARY KEY, embedding vector(3));

-- Insert vectors
INSERT INTO items (embedding) VALUES ('[1,2,3]'), ('[4,5,6]');

-- Nearest neighbors by L2 distance
SELECT * FROM items ORDER BY embedding <-> '[3,1,2]' LIMIT 5;

-- Add HNSW index for approximate search
CREATE INDEX ON items USING hnsw (embedding vector_l2_ops);
```

## Distance Operators

| Operator | Distance | Index Ops |
|----------|----------|-----------|
| `<->` | L2 (Euclidean) | `vector_l2_ops` |
| `<#>` | Negative inner product | `vector_ip_ops` |
| `<=>` | Cosine distance | `vector_cosine_ops` |
| `<+>` | L1 (taxicab) | `vector_l1_ops` |
| `<~>` | Hamming (binary) | `bit_hamming_ops` |
| `<%>` | Jaccard (binary) | `bit_jaccard_ops` |

## Index Selection Guide

| Index | Best For | Key Consideration |
|-------|----------|-------------------|
| **None** | Small tables, exact recall needed | Perfect recall, linear scan |
| **HNSW** | Production, best speed-recall tradeoff | Slower builds, more memory |
| **IVFFlat** | Large tables, faster builds, less memory | Needs data before creating, tuning required |

## Key Patterns

- Add indexes **after** loading initial data for best build performance
- Use `CREATE INDEX CONCURRENTLY` in production to avoid blocking writes
- For normalized vectors (like OpenAI embeddings), use inner product (`<#>`) for best performance
- `<#>` returns **negative** inner product — multiply by -1 for actual value
- For cosine similarity: `1 - (embedding <=> '[3,1,2]')`
- Use `EXPLAIN (ANALYZE, BUFFERS)` to debug query performance
- Enable `hnsw.iterative_scan = strict_order` for filtered queries (v0.8.0+)
- Set `maintenance_work_mem = '8GB'` before building HNSW indexes on large tables
- `NULL` and zero vectors (for cosine) are not indexed
