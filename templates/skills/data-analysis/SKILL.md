---
name: data-analysis
description: Expert guidance for data analysis, data science, and machine learning projects. Covers Python data tools, SQL/databases, visualization, statistics, ML/AI, data engineering, and MLOps. Use when working on data analysis tasks, choosing data tools, building data pipelines, creating visualizations, performing statistical analysis, or building ML models.
---

# Data Analysis

Expert guidance for data analysis and data science workflows. Provides tool selection, workflow patterns, and curated resources across the full data stack.

## Tool Selection Quick Reference

### Data Manipulation

| Need | Recommended Tool | Alternative |
|------|-----------------|-------------|
| General tabular data | Pandas | Polars (faster, multithreaded) |
| Large datasets (out-of-core) | Polars, Dask | Vaex, Modin |
| GPU-accelerated DataFrames | cuDF (RAPIDS) | CuPy (NumPy on GPU) |
| Parallel pandas operations | Pandarallel | Modin |
| Cross-engine portability | Fugue (Pandas/Spark/Dask) | - |
| Fuzzy string matching | TheFuzz | - |
| Date/time handling | Pendulum, Arrow | DateUtil |

### Automated EDA

| Need | Recommended Tool |
|------|-----------------|
| One-line auto visualization | AutoViz |
| EDA with dataset comparison | Sweetviz |
| Data quality profiling | YData Profiling |
| Missing data patterns | Missingno |
| Interactive GUI analysis | D-Tale, PyGWalker |
| Conversational analysis (LLM) | PandasAI |

### Data Quality & Validation

| Need | Recommended Tool |
|------|-----------------|
| Outlier/anomaly detection | PyOD, Alibi Detect |
| Schema validation (DataFrames) | Pandera |
| Schema validation (general) | Pydantic, Cerberus |
| Data pipeline testing | Great Expectations |

### Feature Engineering

| Need | Recommended Tool |
|------|-----------------|
| Automated feature engineering | FeatureTools |
| Scikit-learn compatible FE | Feature Engine |
| Dimensionality reduction (PCA/MCA) | Prince |
| Categorical encoding | Category Encoders |
| Imbalanced datasets | Imbalanced Learn |
| Distribution fitting | Fitter |

### Visualization

| Need | Recommended Tool | Alternative |
|------|-----------------|-------------|
| Static plots | Matplotlib | Plotnine (ggplot2-style) |
| Statistical visualization | Seaborn | - |
| Interactive plots | Plotly | Bokeh, Altair |
| Geographic/maps | Folium, GeoPandas | QGIS, OSMnx |
| Large dataset rendering | Datashader | Deck.gl |
| 3D/scientific | VisPy | Glumpy |
| No-code visualization | Flourish | - |
| Chart selection guide | From Data to Viz | Data Viz Catalogue |

### Dashboards & BI

| Need | Recommended Tool |
|------|-----------------|
| Quick data apps | Streamlit |
| Production dashboards | Dash (Plotly) |
| ML demo interfaces | Gradio |
| Notebook to web app | Voila |
| Full-stack Python web | Reflex, Taipy |
| Enterprise BI | Tableau, Power BI |
| Open-source BI | Apache Superset, Metabase |
| Monitoring dashboards | Grafana |

### SQL & Databases

| Need | Recommended Tool |
|------|-----------------|
| In-process analytics | DuckDB |
| Python ORM | SQLAlchemy |
| PostgreSQL adapter | Psycopg2 |
| SQL linting/formatting | SQLFluff |
| SQL transpilation | SQLGlot |
| Natural language to SQL | Vanna.AI |
| Time-series database | TimescaleDB, TDengine |
| Database GUI | DBeaver, Beekeeper Studio |

### Statistics & Probability

| Need | Recommended Tool |
|------|-----------------|
| General scientific computing | SciPy |
| Statistical modeling | Statsmodels |
| Bayesian modeling | PyMC, NumPyro |
| User-friendly stats | Pingouin |
| Survival analysis | Lifelines, scikit-survival |
| Causal inference | DoWhy, CausalImpact |
| Bayesian visualization | ArviZ |
| GAMs | PyGAM |

### Time Series

| Need | Recommended Tool |
|------|-----------------|
| General forecasting | Facebook Prophet |
| Bayesian forecasting | Uber Orbit |
| ML time series framework | sktime |
| Deep learning forecasting | PyTorch Forecasting, GluonTS |
| Zero-shot forecasting | TimesFM (Google) |
| Feature extraction | TSFresh |
| ARIMA modeling | pmdarima |

### Machine Learning

| Need | Recommended Tool |
|------|-----------------|
| Classical ML | Scikit-learn |
| Gradient boosting | XGBoost, LightGBM, CatBoost |
| AutoML | H2O |
| GPU-accelerated ML | cuML (RAPIDS) |
| Model explainability | SHAP, InterpretML |
| Hyperparameter tuning | Optuna |

### Deep Learning

| Need | Recommended Tool |
|------|-----------------|
| Research & production | PyTorch |
| High-level API | Keras |
| Fast prototyping | Fast.ai |
| Transformers/NLP | HuggingFace Transformers |
| Object detection | Ultralytics (YOLOv8) |
| Model interoperability | ONNX |
| Efficient fine-tuning | PEFT, Unsloth |
| Graph neural networks | PyTorch Geometric |

### Data Engineering

| Need | Recommended Tool |
|------|-----------------|
| SQL transformations | dbt-core |
| Workflow orchestration | Apache Airflow, Dagster, Prefect |
| Distributed processing | Apache Spark |
| Event streaming | Apache Kafka |
| Table format (lakehouse) | Apache Iceberg, Delta Lake |
| Distributed SQL queries | Trino |
| Data lineage | OpenLineage, DataHub |
| Reproducible pipelines | Kedro |

### MLOps

| Need | Recommended Tool |
|------|-----------------|
| Experiment tracking | MLflow, Wandb |
| Data/model versioning | DVC |
| Model/data drift monitoring | Evidently |
| Model serving | BentoML, KServe |
| LLM inference (high-throughput) | vLLM |
| Unified LLM API | LiteLLM |
| ML on Kubernetes | Kubeflow |
| Feature store | Feast |

### Web Scraping

| Need | Recommended Tool |
|------|-----------------|
| Simple HTTP requests | Requests, HTTPX |
| HTML parsing | BeautifulSoup |
| Browser automation | Playwright, Selenium |
| Full crawling framework | Scrapy |
| AI-powered scraping | ScrapeGraph AI, Crawl4AI |
| Auto-detect patterns | AutoScraper |
| Text extraction from web | Trafilatura |

### NLP

| Need | Recommended Tool |
|------|-----------------|
| Production NLP pipeline | SpaCy |
| Text preprocessing | NLTK, TextBlob |
| Sentence embeddings | SentenceTransformers |
| Topic modeling | Gensim |
| Transformer models | HuggingFace Transformers |
| Conversational AI | Rasa |
| Adversarial NLP testing | TextAttack |

## Data Analysis Workflow

### 1. Data Acquisition
- **Files**: OpenPyXL (Excel), PyPDF2/Camelot (PDF), CleverCSV (messy CSV)
- **Web**: Requests/HTTPX + BeautifulSoup, or Scrapy/Crawl4AI for large-scale
- **Databases**: SQLAlchemy + DuckDB for analytics, Psycopg2 for PostgreSQL
- **APIs**: HTTPX (async), Requests-cache (with caching)
- **Synthetic**: Faker, Mimesis for test data generation

### 2. Exploration & Profiling
- Run YData Profiling or Sweetviz for automated EDA
- Use Missingno to visualize missing data patterns
- Use D-Tale or PyGWalker for interactive exploration
- For quick auto-visualization: AutoViz

### 3. Cleaning & Validation
- Pandera for DataFrame schema validation
- Great Expectations for data pipeline testing
- PyOD for outlier detection
- Pandas DQ for automatic type correction and cleaning

### 4. Feature Engineering
- FeatureTools for automated feature engineering
- Category Encoders for categorical variables
- Prince for dimensionality reduction (PCA/MCA)
- Imbalanced Learn for handling class imbalance

### 5. Analysis & Modeling
- **Statistical**: SciPy, Statsmodels, Pingouin
- **Classical ML**: Scikit-learn, XGBoost/LightGBM/CatBoost
- **Deep Learning**: PyTorch + relevant framework
- **Time Series**: Prophet, sktime, pmdarima
- **NLP**: SpaCy, HuggingFace Transformers
- **Hyperparameter tuning**: Optuna

### 6. Visualization & Reporting
- Matplotlib/Seaborn for static publication plots
- Plotly/Altair for interactive visualizations
- Streamlit/Dash for data apps and dashboards
- Gradio for ML model demos

### 7. Deployment & Monitoring
- MLflow/Wandb for experiment tracking
- DVC for data versioning
- BentoML/KServe for model serving
- Evidently for drift monitoring

## Reference Files

Read these for detailed tool lists and learning resources:

| File | Contents | Read when... |
|------|----------|-------------|
| `references/python-ecosystem.md` | Python tools: data processing, EDA, validation, feature engineering, specialized tools | Working with Python data libraries |
| `references/sql-databases.md` | SQL resources, database tools, drivers, learning materials | Working with SQL or databases |
| `references/visualization-dashboards.md` | Visualization tools, dashboard frameworks, BI software | Building charts, dashboards, or data apps |
| `references/statistics-ml.md` | Statistics, ML, deep learning, NLP, time series, AI tools | Doing statistical analysis or building models |
| `references/data-engineering.md` | Data pipelines, MLOps, cloud infrastructure, web scraping | Building data pipelines or deploying models |
| `references/learning-resources.md` | Courses, datasets, cheatsheets, interview prep, career | Looking for learning materials or datasets |

## File Processing Quick Reference

| Format | Library |
|--------|---------|
| Excel (.xlsx) | OpenPyXL, Xlwings |
| CSV (messy) | CleverCSV |
| PDF (text) | PyPDF2, PyMuPDF |
| PDF (tables) | Camelot |
| Word (.docx) | Python-docx |
| HTML to Markdown | Python-markdownify, MarkItDown |
| XML | Xmltodict |
| JSON querying | JmesPath, jq (CLI) |
| YAML | yq (CLI) |
| Tabular export | Tablib (XLSX/JSON/CSV) |

## Command-Line Data Tools

| Tool | Purpose |
|------|---------|
| jq | JSON processor |
| yq | YAML/XML processor |
| q | Run SQL on CSV/TSV files |
| VisiData | Interactive tabular data explorer |
| csvkit | CSV manipulation suite |
| Miller | Multi-format data processor (CSV/JSON/etc.) |
| DuckDB CLI | SQL analytics on files |
| hyperfine | Benchmarking |
| termgraph | Terminal-based graphs |
