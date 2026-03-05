# Data Engineering & MLOps

## Table of Contents
- [Data Engineering Resources](#data-engineering-resources)
- [Data Pipeline Tools](#data-pipeline-tools)
- [MLOps Resources](#mlops-resources)
- [MLOps Tools](#mlops-tools)
- [Web Scraping Resources](#web-scraping-resources)
- [Web Scraping Tools](#web-scraping-tools)
- [Cloud & Infrastructure Resources](#cloud--infrastructure-resources)
- [Containerization & Orchestration](#containerization--orchestration)
- [Infrastructure as Code](#infrastructure-as-code)
- [CI/CD & GitOps](#cicd--gitops)
- [Kubernetes Ecosystem](#kubernetes-ecosystem)

## Data Engineering Resources

- [Data Engineer Handbook](https://github.com/DataExpert-io/data-engineer-handbook) - Comprehensive data engineering guide
- [Data Engineering Zoomcamp](https://github.com/DataTalksClub/data-engineering-zoomcamp) - Free data engineering course
- [Awesome Data Engineering](https://github.com/igorbarinov/awesome-data-engineering) - Data engineering tools and resources
- [Data Engineering Cookbook](https://github.com/andkret/Cookbook) - Techniques for reliable data platforms
- [Awesome Pipeline](https://github.com/pditommaso/awesome-pipeline) - Pipeline toolkits
- [Awesome DB Tools](https://github.com/mgramin/awesome-db-tools) - Database tools

## Data Pipeline Tools

### Workflow Orchestration
- [Apache Airflow](https://github.com/apache/airflow) - Programmatically author, schedule, monitor workflows
- [Dagster](https://github.com/dagster-io/dagster) - Data orchestrator for ML, analytics, ETL
- [Prefect](https://github.com/PrefectHQ/prefect) - Resilient data pipeline orchestration
- [Luigi](https://github.com/spotify/luigi) - Complex batch-oriented data pipelines
- [Kedro](https://github.com/kedro-org/kedro) - Reproducible, maintainable data science code
- [Kestra](https://github.com/kestra-io/kestra) - Event-driven orchestrator
- [Conductor](https://github.com/conductor-oss/conductor) - Multi-step workflow orchestration

### Processing & Transformation
- [dbt-core](https://github.com/dbt-labs/dbt-core) - Data transformations in warehouse using SQL + Jinja
- [Apache Spark](https://github.com/apache/spark) - Unified large-scale data processing
- [Apache Flink](https://github.com/apache/flink) - Stateful stream processing
- [Apache Beam](https://github.com/apache/beam) - Unified batch and streaming pipelines
- [Apache Arrow](https://github.com/apache/arrow) - Universal columnar format for fast data interchange
- [Apache Calcite](https://github.com/apache/calcite) - SQL parsing, optimization, federation

### Streaming & Messaging
- [Apache Kafka](https://github.com/apache/kafka) - Distributed event streaming platform
- [Apache Pulsar](https://github.com/apache/pulsar) - Cloud-native distributed messaging

### Storage & Table Formats
- [Apache Iceberg](https://github.com/apache/iceberg) - High-performance table format
- [Delta Lake](https://github.com/delta-io/delta) - ACID transactions for Spark
- [Apache Hudi](https://github.com/apache/hudi) - Open data lakehouse platform
- [Apache Hive](https://github.com/apache/hive) - Data warehouse for large distributed datasets
- [Apache Cassandra](https://github.com/apache/cassandra) - Highly scalable distributed NoSQL database
- [Apache Hadoop](https://github.com/apache/hadoop) - Distributed processing framework

### Query Engines & Metadata
- [Trino](https://github.com/trinodb/trino) - Distributed SQL query engine
- [DataHub](https://github.com/datahub-project/datahub) - Metadata platform
- [OpenLineage](https://github.com/OpenLineage/OpenLineage) - Data lineage framework

## MLOps Resources

- [MLOps Zoomcamp](https://github.com/DataTalksClub/mlops-zoomcamp) - Free MLOps course
- [Awesome MLOps](https://github.com/visenger/awesome-mlops) - MLOps references
- [Awesome LLMOps](https://github.com/tensorchord/Awesome-LLMOps) - LLMOps tools
- [LLM Zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp) - LLM architecture and applications
- [ML Engineering Guide](https://github.com/stas00/ml-engineering) - ML engineering and MLOps best practices
- [Awesome Production ML](https://github.com/EthicalML/awesome-production-machine-learning) - Production ML tools
- [Llama Cookbook](https://github.com/meta-llama/llama-cookbook) - Recipes for Llama models

## MLOps Tools

### Experiment Tracking & Versioning
- [MLflow](https://github.com/mlflow/mlflow) - Complete ML lifecycle platform
- [Wandb](https://github.com/wandb/wandb) - Experiment tracking and model management
- [DVC](https://github.com/iterative/dvc) - Version control for ML projects
- [Comet ML](https://github.com/comet-ml/opik) - ML tracking and optimization

### Model Monitoring & Validation
- [Evidently](https://github.com/evidentlyai/evidently) - Data and model drift monitoring
- [Deepchecks](https://github.com/deepchecks/deepchecks) - ML model and data validation

### Model Serving & Deployment
- [BentoML](https://github.com/bentoml/BentoML) - Build, ship, scale ML applications
- [KServe](https://github.com/kserve/kserve) - Serverless inference on Kubernetes
- [vLLM](https://github.com/vllm-project/vllm) - High-throughput LLM inference
- [LiteLLM](https://github.com/BerriAI/litellm) - Unified LLM API interface
- [OpenLLM](https://github.com/bentoml/OpenLLM) - LLMs in production
- [Seldon Core](https://github.com/SeldonIO/seldon-core) - ML model deployment and monitoring

### Pipeline & Platform
- [Kubeflow](https://github.com/kubeflow/kubeflow) - ML toolkit for Kubernetes
- [Netflix Metaflow](https://github.com/Netflix/metaflow) - Human-friendly data science library
- [Feast](https://github.com/feast-dev/feast) - Feature store for ML
- [Sematic](https://github.com/sematic-ai/sematic) - Build, debug, execute ML pipelines
- [ColossalAI](https://github.com/hpcaitech/ColossalAI) - Distributed training framework
- [haystack](https://github.com/deepset-ai/haystack) - LLM framework for search and QA

## Web Scraping Resources

- [Awesome Web Scraping](https://github.com/lorien/awesome-web-scraping) - Web scraping tools and APIs
- [Python Scraping](https://github.com/REMitchell/python-scraping) - Code from "Web Scraping with Python"
- [Webscraping from 0 to Hero](https://github.com/TheWebScrapingClub/webscraping-from-0-to-hero) - Web scraping with Python

## Web Scraping Tools

- [Requests](https://github.com/psf/requests) - HTTP library for Python
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) - HTML/XML parsing
- [Scrapy](https://scrapy.org/) - Web crawling framework
- [Playwright](https://github.com/microsoft/playwright-python) - Browser automation
- [Selenium](https://github.com/SeleniumHQ/selenium) - Web application testing/automation
- [Crawl4AI](https://github.com/unclecode/crawl4ai) - AI-powered web crawling
- [ScrapeGraph AI](https://github.com/ScrapeGraphAI/Scrapegraph-ai) - AI-powered scraper
- [AutoScraper](https://github.com/alirezamika/autoscraper) - Smart, automatic web scraper
- [Trafilatura](https://github.com/adbar/trafilatura) - Text and metadata extraction from web
- [Browser Use](https://github.com/browser-use/browser-use) - Browser automation and scraping
- [Helium](https://github.com/mherrmann/helium) - High-level Selenium wrapper
- [MechanicalSoup](https://github.com/MechanicalSoup/MechanicalSoup) - Automating website interaction
- [Feedparser](https://github.com/kurtmckee/feedparser) - Feed parsing

## Cloud & Infrastructure Resources

- [Awesome Cloud Native](https://github.com/rootsongjc/awesome-cloud-native) - Cloud native resources
- [Awesome Kubernetes](https://github.com/ramitsurana/awesome-kubernetes) - Kubernetes resources
- [Awesome Docker](https://github.com/veggiemonk/awesome-docker) - Docker resources
- [Kubernetes The Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way) - Bootstrap K8s manually
- [DevOps Exercises](https://github.com/bregman-arie/devops-exercises) - DevOps practice exercises

## Containerization & Orchestration

- [Docker](https://github.com/docker) - Container platform
- [Docker Compose](https://github.com/docker/compose) - Multi-container applications
- [Kubernetes](https://github.com/kubernetes/kubernetes) - Container orchestration
- [Kompose](https://github.com/kubernetes/kompose) - Docker Compose to K8s conversion

## Infrastructure as Code

- [Terraform](https://github.com/hashicorp/terraform) - Infrastructure as Code
- [OpenTofu](https://github.com/opentofu/opentofu) - Open source Terraform fork
- [Pulumi](https://github.com/pulumi/pulumi) - IaC with familiar languages
- [CDK8s](https://github.com/cdk8s-team/cdk8s) - Define K8s apps with familiar languages

## CI/CD & GitOps

- [Jenkins](https://github.com/jenkinsci/jenkins) - Automation server
- [Argo CD](https://github.com/argoproj/argo-cd) - GitOps continuous delivery
- [Argo Workflows](https://github.com/argoproj/argo-workflows) - Container-native workflows
- [Tekton](https://github.com/tektoncd/pipeline) - K8s-native CI/CD
- [Dagger](https://github.com/dagger/dagger) - Portable CI/CD devkit

## Kubernetes Ecosystem

- [Helm](https://github.com/helm/helm) - K8s package manager
- [Kustomize](https://github.com/kubernetes-sigs/kustomize) - K8s configuration customization
- [Skaffold](https://github.com/GoogleContainerTools/skaffold) - Continuous development for K8s
- [Tilt](https://github.com/tilt-dev/tilt) - Local development for K8s
- [Crossplane](https://github.com/crossplane/crossplane) - Cloud native control plane
