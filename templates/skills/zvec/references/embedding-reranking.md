# Zvec Embedding & Reranking

## Embedding Functions

Zvec provides built-in embedding functions and supports custom implementations. Currently text modality only.

### Available Implementations

| Type | Class | Description |
|------|-------|-------------|
| Local Dense | `DefaultLocalDenseEmbedding` | Sentence Transformers `all-MiniLM-L6-v2` (384 dims, ~80MB) |
| Local Sparse | `DefaultLocalSparseEmbedding` | SPLADE model (~100MB) |
| BM25 | `BM25EmbeddingFunction` | Local BM25, no API key needed |
| Qwen Dense | `QwenDenseEmbedding` | Dashscope API |
| Qwen Sparse | `QwenSparseEmbedding` | Dashscope API |
| OpenAI Dense | `OpenAIDenseEmbedding` | OpenAI API |

### Local Dense Embedding

```python
from zvec.extension import DefaultLocalDenseEmbedding

embedding_func = DefaultLocalDenseEmbedding()
vector = embedding_func.embed("Hello, world!")
print(f"Dimensions: {len(vector)}")  # 384

# ModelScope (for China users)
embedding_func = DefaultLocalDenseEmbedding(model_source="modelscope")
```

### Local Sparse Embedding (SPLADE)

```python
from zvec.extension import DefaultLocalSparseEmbedding

query_embedding = DefaultLocalSparseEmbedding(encoding_type="query")
query_vec = query_embedding.embed("machine learning algorithms")

doc_embedding = DefaultLocalSparseEmbedding(encoding_type="document")
doc_vec = doc_embedding.embed("Machine learning is AI's subfield")

DefaultLocalSparseEmbedding.clear_cache()  # Free memory
```

### BM25 Embedding

No API key or network required.

```python
from zvec.extension import BM25EmbeddingFunction

# Built-in encoder
bm25 = BM25EmbeddingFunction(language="zh", encoding_type="query")
vec = bm25.embed("deep learning neural networks")

# Custom corpus
bm25_custom = BM25EmbeddingFunction(
    corpus=["Machine learning is AI", "Deep learning uses neural networks"],
    b=0.75,
    k1=1.2,
)
```

### OpenAI Dense Embedding

```python
from zvec.extension import OpenAIDenseEmbedding

embedding_func = OpenAIDenseEmbedding(
    api_key="your-openai-api-key",
    model="text-embedding-4",
    dimension=256,
)
```

### Qwen Dense Embedding

```python
from zvec.extension import QwenDenseEmbedding

embedding_func = QwenDenseEmbedding(
    api_key="your-dashscope-api-key",
    model="text-embedding-v4",
    dimension=256,
)
```

### Qwen Sparse Embedding

```python
from zvec.extension import QwenSparseEmbedding

embedding_func = QwenSparseEmbedding(
    api_key="your-dashscope-api-key",
    dimension=256,
)
```

### Custom Dense Embedding

```python
from zvec.extension import DenseEmbeddingFunction
from zvec.common.constants import TEXT, DenseVectorType

class MyDenseEmbedding(DenseEmbeddingFunction[TEXT]):
    def __init__(self, model_name: str = "custom-model", **kwargs):
        self._model_name = model_name
        self._dimension = 768
        self._extra_params = kwargs

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def extra_params(self) -> dict:
        return self._extra_params

    def embed(self, input: str) -> DenseVectorType:
        # Your embedding logic here
        pass

    def __call__(self, input: str) -> DenseVectorType:
        return self.embed(input)
```

### Custom Sparse Embedding

```python
from zvec.extension import SparseEmbeddingFunction
from zvec.common.constants import TEXT, SparseVectorType

class MySparseEmbedding(SparseEmbeddingFunction[TEXT]):
    def __init__(self, vocab_size: int = 30000, **kwargs):
        self._vocab_size = vocab_size
        self._extra_params = kwargs

    @property
    def extra_params(self) -> dict:
        return self._extra_params

    def embed(self, input: str) -> SparseVectorType:
        return {100: 0.5, 250: 1.2, 500: 0.8}  # {dimension: weight}

    def __call__(self, input: str) -> SparseVectorType:
        return self.embed(input)
```

### Embedding Best Practices

- Models download on first use — ensure network connectivity
- Local models consume memory; call `clear_cache()` after use
- API-based functions are subject to rate limiting
- All embedding functions are thread-safe
- Install dependencies: `pip install openai dashscope dashtext sentence-transformers`
- For mainland China: `export HF_ENDPOINT=https://hf-mirror.com` or use `model_source="modelscope"`

## Reranking Functions

Rerankers re-order retrieval results to improve relevance accuracy.

### Available Implementations

| Type | Class | Description |
|------|-------|-------------|
| Local | `DefaultLocalReRanker` | Cross-Encoder `ms-marco-MiniLM-L6-v2` (~80MB) |
| Qwen | `QwenReRanker` | Dashscope API |
| RRF | `RrfReRanker` | Reciprocal Rank Fusion (multi-vector) |
| Weighted | `WeightedReRanker` | Weighted score fusion (multi-vector) |

### DefaultLocalReRanker

Local cross-encoder for reranking based on query relevance.

Key parameters:
- `query` — search query text
- `topn` — top results to return
- `rerank_field` — document field to rerank against

### QwenReRanker

```python
from zvec.extension import QwenReRanker

reranker = QwenReRanker(
    query="search query",
    model="gte-rerank-v2",
    api_key="your-dashscope-api-key",
    topn=5,
    rerank_field="description",
)
```

### Fusion Rerankers (for Multi-Vector Search)

**RrfReRanker** — position-based fusion, no scores needed:
```python
zvec.RrfReRanker(topn=5, rank_constant=60)
```

**WeightedReRanker** — weighted score fusion:
```python
zvec.WeightedReRanker(
    topn=5,
    metric=zvec.MetricType.IP,
    weights={"dense_embedding": 1.2, "sparse_embedding": 1.0},
)
```

### Custom Reranker

Inherit from `RerankFunction` (exported as `ReRanker`):
- Implement `topn` property (getter/setter)
- Implement `extra_params` property
- Implement `rerank()` method
- Implement `__call__()` method

### Reranking Best Practices

- **Two-stage retrieval:** Fast recall (dense embedding) + precise reranking
- **Multi-vector fusion:** Use RRF or Weighted rerankers when combining dense + sparse
- Local models download on first use; call `clear_cache()` to free memory
- API-based rerankers are subject to rate limiting
- RRF/Weighted rerankers are designed for multi-vector fusion, not single-vector
