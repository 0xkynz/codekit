# pgvector Quickstart

## Installation

### Linux and Mac (Postgres 13+)

```sh
cd /tmp
git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
make install  # may need sudo
```

If multiple Postgres installations exist:
```sh
export PG_CONFIG=/Library/PostgreSQL/18/bin/pg_config
```

### Windows

Run `x64 Native Tools Command Prompt for VS` as administrator:
```cmd
set "PGROOT=C:\Program Files\PostgreSQL\18"
cd %TEMP%
git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
cd pgvector
nmake /F Makefile.win
nmake /F Makefile.win install
```

### Other Methods

```sh
# Docker
docker pull pgvector/pgvector:pg18-trixie

# Homebrew (only postgresql@18 and @17)
brew install pgvector

# PGXN
pgxn install vector

# APT (Debian/Ubuntu) — replace 18 with your version
sudo apt install postgresql-18-pgvector

# Yum/DNF (RHEL/Fedora)
sudo yum install pgvector_18

# conda-forge
conda install -c conda-forge pgvector

# Alpine
apk add postgresql-pgvector

# FreeBSD
pkg install postgresql17-pgvector
```

Also comes preinstalled with Postgres.app (v15+) and many hosted providers.

## Enable Extension

Run once per database:
```sql
CREATE EXTENSION vector;
```

## Basic Operations

### Create Table

```sql
CREATE TABLE items (id bigserial PRIMARY KEY, embedding vector(3));
```

Or add to existing table:
```sql
ALTER TABLE items ADD COLUMN embedding vector(3);
```

### Insert

```sql
INSERT INTO items (embedding) VALUES ('[1,2,3]'), ('[4,5,6]');
```

### Bulk Load

```sql
COPY items (embedding) FROM STDIN WITH (FORMAT BINARY);
```

### Upsert

```sql
INSERT INTO items (id, embedding) VALUES (1, '[1,2,3]'), (2, '[4,5,6]')
    ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding;
```

### Update

```sql
UPDATE items SET embedding = '[1,2,3]' WHERE id = 1;
```

### Delete

```sql
DELETE FROM items WHERE id = 1;
```

### Query — Nearest Neighbors

```sql
SELECT * FROM items ORDER BY embedding <-> '[3,1,2]' LIMIT 5;
```

### Upgrading

Install latest version, then:
```sql
ALTER EXTENSION vector UPDATE;

-- Check version
SELECT extversion FROM pg_extension WHERE extname = 'vector';
```
