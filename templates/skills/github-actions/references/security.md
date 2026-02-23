# GitHub Actions Security Best Practices

## Secret Management

- Store sensitive data in GitHub Secrets (encrypted at rest, decrypted only on runner)
- Access via `secrets.<SECRET_NAME>` — never hardcode
- Use **environment-specific secrets** for deployment stages with manual approvals
- Never print secrets to logs even if masked
- Minimize scope: only grant access to workflows/jobs that need them

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://prod.example.com
    steps:
      - name: Deploy to production
        env:
          PROD_API_KEY: ${{ secrets.PROD_API_KEY }}
        run: ./deploy-script.sh
```

## OpenID Connect (OIDC) for Cloud Auth

Use OIDC for credential-less authentication with AWS, Azure, GCP — eliminates long-lived static credentials.

- Exchanges JWT token for temporary cloud credentials
- Requires configuring identity providers and trust policies in cloud environment
- Significantly reduces attack surface

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::role/deploy
    aws-region: us-east-1
```

## Least Privilege for GITHUB_TOKEN

Default `GITHUB_TOKEN` permissions are too broad. Explicitly restrict:

```yaml
permissions:
  contents: read       # Default to read-only
  pull-requests: write # Only if workflow updates PRs
  checks: write        # For updating checks

jobs:
  lint:
    permissions:
      contents: read   # Override: this job only reads code
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint
```

Start with `contents: read` and add write permissions only when strictly necessary.

## Dependency Review / SCA

Scan dependencies for known vulnerabilities and licensing issues:
- Integrate `dependency-review-action`, Snyk, Trivy, or Mend
- Run early in CI pipeline to catch issues before deployment
- Set up alerts for new vulnerability findings
- Understand transitive dependencies

## Static Application Security Testing (SAST)

Identify vulnerabilities in source code before runtime:
- Use CodeQL (GitHub Advanced Security), SonarQube, Bandit (Python), ESLint security plugins
- Configure as blocking step for critical vulnerabilities
- Add security linters to pre-commit hooks for earlier feedback

## Secret Scanning & Leak Prevention

- Enable GitHub's built-in secret scanning
- Implement pre-commit hooks with `git-secrets`
- Secrets should only be passed at runtime, never in build artifacts
- Review workflow logs for accidental exposure

## Immutable Infrastructure & Image Signing

- Ensure reproducible builds (same code → same image)
- Sign container images with Notary or Cosign
- Enforce that only signed images deploy to production
