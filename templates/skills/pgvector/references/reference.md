# pgvector Reference

## Vector Type

Storage: `4 * dimensions + 8` bytes. Up to 16,000 dimensions. All elements must be finite.

### Operators

| Operator | Description |
|----------|-------------|
| `+` | Element-wise addition |
| `-` | Element-wise subtraction |
| `*` | Element-wise multiplication |
| `\|\|` | Concatenate |
| `<->` | L2 (Euclidean) distance |
| `<#>` | Negative inner product |
| `<=>` | Cosine distance |
| `<+>` | L1 (taxicab) distance |

### Functions

| Function | Description |
|----------|-------------|
| `binary_quantize(vector) → bit` | Binary quantize |
| `cosine_distance(vector, vector) → double precision` | Cosine distance |
| `inner_product(vector, vector) → double precision` | Inner product |
| `l1_distance(vector, vector) → double precision` | Taxicab distance |
| `l2_distance(vector, vector) → double precision` | Euclidean distance |
| `l2_normalize(vector) → vector` | Normalize with Euclidean norm |
| `subvector(vector, integer, integer) → vector` | Extract subvector |
| `vector_dims(vector) → integer` | Number of dimensions |
| `vector_norm(vector) → double precision` | Euclidean norm |

### Aggregates

| Function | Description |
|----------|-------------|
| `avg(vector) → vector` | Average |
| `sum(vector) → vector` | Sum |

## Halfvec Type

Storage: `2 * dimensions + 8` bytes. Up to 16,000 dimensions. All elements must be finite.

### Operators

| Operator | Description |
|----------|-------------|
| `+` | Element-wise addition |
| `-` | Element-wise subtraction |
| `*` | Element-wise multiplication |
| `\|\|` | Concatenate |
| `<->` | L2 distance |
| `<#>` | Negative inner product |
| `<=>` | Cosine distance |
| `<+>` | L1 distance |

### Functions

| Function | Description |
|----------|-------------|
| `binary_quantize(halfvec) → bit` | Binary quantize |
| `cosine_distance(halfvec, halfvec) → double precision` | Cosine distance |
| `inner_product(halfvec, halfvec) → double precision` | Inner product |
| `l1_distance(halfvec, halfvec) → double precision` | Taxicab distance |
| `l2_distance(halfvec, halfvec) → double precision` | Euclidean distance |
| `l2_norm(halfvec) → double precision` | Euclidean norm |
| `l2_normalize(halfvec) → halfvec` | Normalize with Euclidean norm |
| `subvector(halfvec, integer, integer) → halfvec` | Extract subvector |
| `vector_dims(halfvec) → integer` | Number of dimensions |

### Aggregates

| Function | Description |
|----------|-------------|
| `avg(halfvec) → halfvec` | Average |
| `sum(halfvec) → halfvec` | Sum |

## Bit Type

Storage: `dimensions / 8 + 8` bytes.

### Operators

| Operator | Description |
|----------|-------------|
| `<~>` | Hamming distance |
| `<%>` | Jaccard distance |

### Functions

| Function | Description |
|----------|-------------|
| `hamming_distance(bit, bit) → double precision` | Hamming distance |
| `jaccard_distance(bit, bit) → double precision` | Jaccard distance |

## Sparsevec Type

Storage: `8 * non-zero elements + 16` bytes. Up to 16,000 non-zero elements. Format: `{index1:value1,index2:value2}/dimensions` (1-indexed).

### Operators

| Operator | Description |
|----------|-------------|
| `<->` | L2 distance |
| `<#>` | Negative inner product |
| `<=>` | Cosine distance |
| `<+>` | L1 distance |

### Functions

| Function | Description |
|----------|-------------|
| `cosine_distance(sparsevec, sparsevec) → double precision` | Cosine distance |
| `inner_product(sparsevec, sparsevec) → double precision` | Inner product |
| `l1_distance(sparsevec, sparsevec) → double precision` | Taxicab distance |
| `l2_distance(sparsevec, sparsevec) → double precision` | Euclidean distance |
| `l2_norm(sparsevec) → double precision` | Euclidean norm |
| `l2_normalize(sparsevec) → sparsevec` | Normalize with Euclidean norm |

## Index Operator Classes

### HNSW

| Type | L2 | Inner Product | Cosine | L1 | Hamming | Jaccard |
|------|-----|---------------|--------|-----|---------|---------|
| `vector` | `vector_l2_ops` | `vector_ip_ops` | `vector_cosine_ops` | `vector_l1_ops` | — | — |
| `halfvec` | `halfvec_l2_ops` | `halfvec_ip_ops` | `halfvec_cosine_ops` | `halfvec_l1_ops` | — | — |
| `bit` | — | — | — | — | `bit_hamming_ops` | `bit_jaccard_ops` |
| `sparsevec` | `sparsevec_l2_ops` | `sparsevec_ip_ops` | `sparsevec_cosine_ops` | — | — | — |

### IVFFlat

| Type | L2 | Inner Product | Cosine | Hamming |
|------|-----|---------------|--------|---------|
| `vector` | `vector_l2_ops` | `vector_ip_ops` | `vector_cosine_ops` | — |
| `halfvec` | `halfvec_l2_ops` | `halfvec_ip_ops` | `halfvec_cosine_ops` | — |
| `bit` | — | — | — | `bit_hamming_ops` |

## Language Libraries

pgvector works with any language that has a Postgres client. Official libraries exist for Python, Node.js/TypeScript, Ruby, Go, Rust, Java/Kotlin, C#/.NET, Elixir, C/C++, PHP, Swift, Dart, and many more at `github.com/pgvector/pgvector-<language>`.
