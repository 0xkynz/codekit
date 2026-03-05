# Python Data Ecosystem

## Table of Contents
- [Data Processing & Transformation](#data-processing--transformation)
- [Automated EDA & Visualization](#automated-eda--visualization)
- [Data Quality & Validation](#data-quality--validation)
- [Feature Engineering & Selection](#feature-engineering--selection)
- [Specialized Data Tools](#specialized-data-tools)
- [Code Quality & Development](#code-quality--development)
- [Documentation & File Processing](#documentation--file-processing)
- [Web & APIs](#web--apis)
- [Utilities](#utilities)

## Data Processing & Transformation

- [Polars](https://github.com/pola-rs/polars) - Multithreaded, vectorized query engine for DataFrames
- [Dask](https://github.com/dask/dask) - Parallel computing for arrays and DataFrames
- [Vaex](https://github.com/vaexio/vaex) - High-performance lazy Out-of-Core DataFrames
- [Modin](https://github.com/modin-project/modin) - Speeds up Pandas by distributing computations
- [Pandarallel](https://github.com/nalepae/pandarallel) - Parallel operations for pandas DataFrames
- [CuPy](https://github.com/cupy/cupy) - NumPy-compatible array library accelerated by NVIDIA CUDA
- [Numba](https://github.com/numba/numba) - JIT compiler for Python and NumPy code
- [Fugue](https://github.com/fugue-project/fugue) - Unified interface for Pandas, Spark, and Dask
- [Pandas DQ](https://github.com/AutoViML/pandas_dq) - Data type correction and automatic DataFrame cleaning
- [TheFuzz](https://github.com/seatgeek/thefuzz) - Fuzzy string matching (Levenshtein distance)
- [Pendulum](https://github.com/sdispater/pendulum) - Alternative to datetime with timezone support
- [Arrow](https://github.com/arrow-py/arrow) - Enhanced work with dates and times
- [DateUtil](https://github.com/dateutil/dateutil) - Extensions for standard Python datetime
- [DataCleaner](https://github.com/rhiever/datacleaner) - Automatically cleaning and preparing datasets
- [Pandas Flavor](https://github.com/Zsailer/pandas_flavor) - Add custom methods to Pandas
- [Pandas DataReader](https://github.com/pydata/pandas-datareader) - Read data from various online sources into DataFrames
- [Sklearn Pandas](https://github.com/scikit-learn-contrib/sklearn-pandas) - Bridge between Pandas and Scikit-learn
- [Pandas Stubs](https://github.com/pandas-dev/pandas-stubs) - Type stubs for Pandas (IDE autocompletion)
- [Petl](https://github.com/petl-developers/petl) - ETL tool for data cleaning and transformation

## Automated EDA & Visualization

- [AutoViz](https://github.com/AutoViML/AutoViz) - Automatic data visualization in 1 line of code
- [Sweetviz](https://github.com/fbdesignpro/sweetviz) - Automatic EDA with dataset comparison
- [Lux](https://github.com/lux-org/lux) - Automatic DataFrame visualization in Jupyter
- [YData Profiling](https://github.com/ydataai/ydata-profiling) - Data quality profiling & exploratory data analysis
- [Missingno](https://github.com/ResidentMario/missingno) - Visualize missing data patterns
- [Vizro](https://github.com/mckinsey/vizro) - Low-code toolkit for data visualization apps
- [Yellowbrick](https://github.com/DistrictDataLabs/yellowbrick) - Visual diagnostic tools for ML
- [Great Tables](https://github.com/posit-dev/great-tables) - Create display tables using Python
- [DataMapPlot](https://github.com/TutteInstitute/datamapplot) - Beautiful plots of data maps
- [Datashader](https://github.com/holoviz/datashader) - Render even the largest data quickly
- [PandasAI](https://github.com/sinaptik-ai/pandas-ai) - Conversational data analysis using LLMs and RAG
- [Mito](https://github.com/mito-ds/mito) - Jupyter extensions for faster code writing
- [D-Tale](https://github.com/man-group/dtale) - Interactive GUI for data analysis in browser
- [Pandasgui](https://github.com/adamerose/pandasgui) - GUI for viewing and filtering DataFrames
- [PyGWalker](https://github.com/Kanaries/pygwalker) - Interactive UIs for visual analysis of DataFrames

## Data Quality & Validation

- [PyOD](https://github.com/yzhao062/pyod) - Outlier and anomaly detection
- [Alibi Detect](https://github.com/SeldonIO/alibi-detect) - Outlier, adversarial and drift detection
- [Pandera](https://github.com/unionai-oss/pandera) - Data validation through declarative schemas
- [Pydantic](https://github.com/pydantic/pydantic) - Data validation using Python type annotations
- [Cerberus](https://github.com/pyeve/cerberus) - Data validation through schemas
- [Great Expectations](https://github.com/great-expectations/great_expectations) - Data validation and testing
- [Dora](https://github.com/NathanEpstein/Dora) - Automate EDA: preprocessing, feature engineering, visualization

## Feature Engineering & Selection

- [FeatureTools](https://github.com/alteryx/featuretools) - Automated feature engineering
- [Feature Engine](https://github.com/feature-engine/feature_engine) - Feature engineering with Scikit-Learn compatibility
- [Prince](https://github.com/MaxHalford/prince) - Multivariate exploratory data analysis (PCA, CA, MCA)
- [Fitter](https://github.com/cokelaer/fitter) - Determine the distribution your data comes from
- [Feature Selector](https://github.com/WillKoehrsen/feature-selector) - Dimensionality reduction tool
- [Category Encoders](https://github.com/scikit-learn-contrib/category_encoders) - Categorical variable encoders
- [Imbalanced Learn](https://github.com/scikit-learn-contrib/imbalanced-learn) - Handling imbalanced datasets

## Specialized Data Tools

- [cuDF](https://github.com/rapidsai/cudf) - GPU DataFrame library (RAPIDS)
- [Faker](https://github.com/joke2k/faker) - Generate fake data for testing
- [Mimesis](https://github.com/lk-geimfari/mimesis) - Generate realistic test data
- [Geopy](https://github.com/geopy/geopy) - Geocoding addresses and calculating distances
- [Geopandas](https://github.com/geopandas/geopandas) - Geographic data operations with Pandas
- [PySAL](https://github.com/pysal/pysal) - Spatial analysis functions
- [NetworkX](https://github.com/networkx/networkx) - Network analysis and graph theory
- [IGraph](https://github.com/igraph/igraph) - Graph and network library
- [Texthero](https://github.com/jbesomi/texthero) - Text preprocessing, representation and visualization
- [Scattertext](https://github.com/JasonKessler/scattertext) - Language difference visualizations
- [Joblib](https://github.com/joblib/joblib) - Lightweight pipelining, useful for large NumPy arrays
- [ImageIO](https://github.com/imageio/imageio) - Read and write image data
- [Chardet](https://github.com/chardet/chardet) - Detect character encoding of text and files

## Code Quality & Development

- [Black](https://github.com/psf/black) - Python code formatter
- [Pre-commit](https://github.com/pre-commit/pre-commit) - Pre-commit hooks framework
- [Pylint](https://github.com/pylint-dev/pylint) - Python code static analysis
- [Mypy](https://github.com/python/mypy) - Optional static typing for Python
- [Rich](https://github.com/Textualize/rich) - Rich text and beautiful formatting in terminal
- [Icecream](https://github.com/gruns/icecream) - Debugging without print
- [Pandas-log](https://github.com/eyaltrabelsi/pandas-log) - Log pandas operations for tracking
- [PandasVet](https://github.com/deppen8/pandas-vet) - Code style validator for Pandas
- [PyForest](https://github.com/8080labs/pyforest) - Automated Python imports for data science

## Documentation & File Processing

- [OpenPyXL](https://openpyxl.readthedocs.io/en/stable/) - Read/write Excel files
- [Xlwings](https://github.com/xlwings/xlwings) - Python-Excel integration
- [PyPDF2](https://github.com/py-pdf/PyPDF2) - Read and write PDF files
- [PyMuPDF](https://github.com/pymupdf/PyMuPDF) - Advanced PDF manipulation
- [Camelot](https://github.com/camelot-dev/camelot) - PDF table extraction
- [Marker](https://github.com/datalab-to/marker) - Fast PDF/document conversion with layout preservation
- [Python-docx](https://github.com/python-openxml/python-docx) - Read and write Word documents
- [CleverCSV](https://github.com/alan-turing-institute/CleverCSV) - Smart CSV reader for messy data
- [Tablib](https://github.com/jazzband/tablib) - Export data to XLSX, JSON, CSV
- [Xmltodict](https://github.com/martinblech/xmltodict) - Convert XML to Python dictionaries
- [MarkItDown](https://github.com/microsoft/markitdown) - Convert files and office documents to Markdown
- [Python-markdownify](https://github.com/matthewwithanm/python-markdownify) - Convert HTML to Markdown
- [WeasyPrint](https://github.com/Kozea/WeasyPrint) - Convert HTML to PDF
- [Jupyter-book](https://github.com/executablebooks/jupyter-book) - Build publication-quality books from notebooks

## Web & APIs

- [HTTPX](https://github.com/encode/httpx) - Next-generation HTTP client
- [FastAPI](https://github.com/fastapi/fastapi) - Modern web framework for building APIs
- [Flask](https://github.com/pallets/flask) - Lightweight Python web framework
- [Typer](https://github.com/fastapi/typer) - Library for building CLI applications
- [Requests-cache](https://github.com/reclosedev/requests-cache) - Persistent caching for requests
- [Aiohttp](https://github.com/aio-libs/aiohttp) - Async HTTP client/server framework

## Utilities

- [UV](https://github.com/astral-sh/uv) - Extremely fast Python package installer
- [Poetry](https://github.com/python-poetry/poetry) - Dependency management and packaging
- [TQDM](https://github.com/tqdm/tqdm) - Progress bars for loops
- [Loguru](https://github.com/Delgan/loguru) - Python logging made simple
- [Click](https://github.com/pallets/click) - Command line interfaces
- [Hydra](https://github.com/facebookresearch/hydra) - Configuration management
- [Papermill](https://github.com/nteract/papermill) - Parameterize and execute Jupyter notebooks
- [Pytest](https://github.com/pytest-dev/pytest) - Testing framework
- [Diagrams](https://github.com/mingrammer/diagrams) - Diagrams as code for cloud architecture
- [GitPython](https://github.com/gitpython-developers/GitPython) - Interact with Git repositories
- [Pillow](https://github.com/python-pillow/Pillow) - Image processing library
- [JmesPath](https://github.com/jmespath/jmespath.py) - Query JSON data
- [Glom](https://github.com/mahmoud/glom) - Transform nested data structures
