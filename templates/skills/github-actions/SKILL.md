---
name: github-actions
description: GitHub Actions CI/CD best practices — workflow structure, jobs, steps, security, caching, matrix strategies, testing, deployment strategies, rollback, and troubleshooting. Use when creating or reviewing GitHub Actions workflows.
---

# GitHub Actions CI/CD Best Practices

Build robust, secure, and efficient CI/CD pipelines using GitHub Actions.

## Quick Reference

| Topic | Reference |
|-------|-----------|
| [Security](references/security.md) | Secrets, OIDC, least privilege, SAST, SCA, secret scanning |
| [Optimization](references/optimization.md) | Caching, matrix strategies, self-hosted runners, artifacts |
| [Testing](references/testing.md) | Unit, integration, E2E, performance, test reporting |
| [Deployment](references/deployment.md) | Staging, production, blue/green, canary, rollback |
| [Review Checklist](references/review-checklist.md) | Comprehensive workflow review checklist |
| [Troubleshooting](references/troubleshooting.md) | Common issues and fixes |

## Workflow Structure

**Naming**: Use descriptive file names (`build-and-test.yml`, `deploy-prod.yml`).

**Triggers (`on`)**: `push`, `pull_request`, `workflow_dispatch` (manual), `schedule` (cron), `repository_dispatch` (external), `workflow_call` (reusable).

**Concurrency**: Prevent simultaneous runs for specific branches/groups:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Permissions**: Define at workflow level, override at job level. Default to least privilege:
```yaml
permissions:
  contents: read
```

**Reusable workflows**: Use `workflow_call` to abstract common CI/CD patterns across projects.

## Jobs

- Jobs represent distinct pipeline phases: build, test, lint, deploy
- Use `needs` for dependencies between jobs
- Use `outputs` to pass data between jobs
- Use `if` for conditional execution

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      artifact_path: ${{ steps.package.outputs.path }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci && npm run build
      - id: package
        run: |
          zip -r dist.zip dist
          echo "path=dist.zip" >> "$GITHUB_OUTPUT"
      - uses: actions/upload-artifact@v3
        with:
          name: app-build
          path: dist.zip

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: app-build
      - run: echo "Deploying ${{ needs.build.outputs.artifact_path }}"
```

## Steps and Actions

- **Version pinning**: Pin actions to commit SHA or major version tag (`@v4`). Never use `main` or `latest`.
- **Descriptive names**: Every step needs a clear `name` for log readability.
- **Multi-line scripts**: Use `|` for complex commands, combine with `&&` for efficiency.
- **Audit actions**: Prefer actions from `actions/` org. Use Dependabot for version updates.

## Key Patterns

### Secret management
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```
Never hardcode secrets. Use environment-specific secrets for deployment.

### OIDC cloud authentication
Use short-lived credentials instead of stored access keys:
```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::role/deploy
    aws-region: us-east-1
```

### Caching dependencies
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: ${{ runner.os }}-node-
```

### Matrix testing
```yaml
strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18.x, 20.x]
```

### Fast checkout
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1  # Shallow clone for speed
```

## Deployment Types

| Strategy | When to use |
|----------|-------------|
| **Rolling** | Default, stateless apps. Configure `maxSurge`/`maxUnavailable` |
| **Blue/Green** | Zero-downtime, instant rollback. Two identical environments |
| **Canary** | Controlled blast radius. Route 5-10% traffic to new version |
| **Dark Launch** | Decouple deploy from release. Feature flags control exposure |

## Troubleshooting

Common issues: workflow not triggering (check `on` triggers, `if` conditions, `concurrency`), permission errors (check `permissions` block, secret access), cache misses (validate keys with `hashFiles`), long runtimes (profile steps, add caching, parallelize with matrix).

See [Troubleshooting](references/troubleshooting.md) for detailed fixes.
