# GitHub Actions Optimization & Performance

## Caching

Cache dependencies and build outputs to speed up workflows.

**Design effective cache keys** using `hashFiles` to invalidate only when dependencies change:

```yaml
- name: Cache Node.js modules
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ./node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-${{ github.run_id }}
    restore-keys: |
      ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-node-
```

- Use `restore-keys` for fallbacks to older compatible caches
- Caches are scoped to repository and branch
- Aim for high cache hit ratio — overly dynamic keys always miss
- Debug with `actions/cache/restore` and `lookup-only: true`

## Matrix Strategies

Run jobs in parallel across configurations:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [16.x, 18.x, 20.x]
        browser: [chromium, firefox]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npx playwright install ${{ matrix.browser }}
      - run: npm test
```

- Use `include`/`exclude` to fine-tune combinations
- `fail-fast: true` (default) for quick failure feedback
- `fail-fast: false` for comprehensive test reporting

## Self-Hosted Runners

Use when GitHub-hosted runners don't meet needs:
- Custom hardware (GPUs), access to private resources
- Cost optimization for high usage
- **Your responsibility**: securing, maintaining, scaling, patching
- Use runner groups to organize and manage runners

## Fast Checkout

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1    # Shallow clone (default for most CI/CD)
    submodules: false  # Skip unless needed
    lfs: false         # Skip unless large files needed
```

Only use `fetch-depth: 0` when full history is required (release tagging, git blame).

## Artifacts

Pass data between jobs/workflows:

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: app-build
    path: dist.zip
    retention-days: 7

# In downstream job:
- uses: actions/download-artifact@v3
  with:
    name: app-build
```

- Set `retention-days` to manage storage costs
- Upload test reports, coverage, security scan results
- Artifacts are immutable once uploaded
- Use for passing compiled binaries from build to deploy jobs
