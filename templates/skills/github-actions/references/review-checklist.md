# GitHub Actions Workflow Review Checklist

## Structure & Design

- [ ] Workflow `name` is clear, descriptive, and unique
- [ ] `on` triggers are appropriate with effective path/branch filters
- [ ] `concurrency` used for critical workflows or shared resources
- [ ] Global `permissions` set to least privilege (`contents: read` default)
- [ ] Reusable workflows (`workflow_call`) used for common patterns
- [ ] Organized logically with meaningful job and step names

## Jobs & Steps

- [ ] Jobs clearly named, represent distinct phases (build, lint, test, deploy)
- [ ] `needs` dependencies correctly defined
- [ ] `outputs` used for inter-job communication
- [ ] `if` conditions used for conditional execution
- [ ] All `uses` actions pinned to commit SHA or major version tag (`@v4`)
- [ ] `run` commands efficient (combined with `&&`, temp files cleaned up)
- [ ] Environment variables at appropriate scope, no hardcoded secrets
- [ ] `timeout-minutes` set for long-running jobs

## Security

- [ ] Secrets accessed exclusively via `secrets.<NAME>` context
- [ ] OIDC used for cloud authentication where possible
- [ ] `GITHUB_TOKEN` permissions explicitly defined and minimal
- [ ] SCA tools integrated (dependency-review-action, Snyk)
- [ ] SAST tools integrated (CodeQL, SonarQube) with critical findings blocking
- [ ] Secret scanning enabled, pre-commit hooks suggested
- [ ] Container image signing strategy if using containers
- [ ] Self-hosted runners hardened with restricted network access

## Optimization

- [ ] `actions/cache` used for dependencies and build outputs
- [ ] Cache keys use `hashFiles` for optimal hit rates
- [ ] `strategy.matrix` used for parallel testing across environments
- [ ] `fetch-depth: 1` for checkout where full history not needed
- [ ] Artifacts used for inter-job data transfer (not re-building)
- [ ] Git LFS optimized if applicable

## Testing

- [ ] Unit tests configured early in pipeline
- [ ] Integration tests use `services` for dependencies
- [ ] E2E tests included, preferably against staging
- [ ] Performance/load tests for critical applications
- [ ] Test reports collected and published as artifacts
- [ ] Code coverage tracked with minimum threshold

## Deployment

- [ ] Staging and production use `environment` with protections
- [ ] Manual approvals for production deployments
- [ ] Rollback strategy in place and automated where possible
- [ ] Deployment type appropriate for risk tolerance
- [ ] Post-deployment health checks and smoke tests
- [ ] Workflow resilient to temporary failures (retries)

## Observability

- [ ] Adequate logging for debugging failures
- [ ] Metrics collected and exposed
- [ ] Alerts configured for critical failures
- [ ] Distributed tracing if microservices
- [ ] Artifact `retention-days` configured
