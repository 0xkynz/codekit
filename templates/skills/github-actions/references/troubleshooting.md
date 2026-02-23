# GitHub Actions Troubleshooting

## Workflow Not Triggering

**Symptoms**: Workflow doesn't run, jobs/steps skip unexpectedly.

**Check triggers**:
- Verify `on` block matches the event (`push`, `pull_request`, `workflow_dispatch`)
- Check `branches`, `tags`, `paths` filters — `paths-ignore`/`branches-ignore` take precedence
- For `workflow_dispatch`: file must be on default branch, required `inputs` must be provided

**Check `if` conditions**:
- Review all `if` conditions at workflow, job, and step levels
- Debug with `always()` step that prints context:
  ```yaml
  - if: always()
    run: echo '${{ toJson(github) }}'
  ```

**Check `concurrency`**:
- Previous run may be blocking for the same group
- Check the "Concurrency" tab in workflow run

**Branch protection**: Rules may prevent workflows on certain branches.

## Permission Errors

**Symptoms**: `Resource not accessible by integration`, `Permission denied`.

**GITHUB_TOKEN**:
- Review `permissions` at workflow and job levels
- Default to `contents: read`, add write only where needed

**Secret access**:
- Verify secrets exist in repository/organization/environment settings
- Check if environment requires manual approval (may be pending)
- Confirm exact name match: `secrets.MY_API_KEY`

**OIDC**:
- Verify trust policy in cloud provider matches GitHub's OIDC issuer
- Confirm the role/identity has correct cloud resource permissions

## Caching Issues

**Symptoms**: `Cache not found`, `Cache miss`, `Cache creation failed`.

**Validate keys**:
- Ensure `key` changes only when dependencies change
- Overly dynamic keys (e.g., including `github.run_id` in primary key) cause constant misses
- Use `restore-keys` for fallback to older compatible caches

**Check path**:
- `path` must match exactly where dependencies are installed
- Verify path exists before caching

**Debug**:
- Use `actions/cache/restore` with `lookup-only: true` to inspect key resolution
- Look for `Cache hit`/`Cache miss` in workflow logs

**Limits**: Be aware of per-repository cache size limits — large caches may be evicted.

## Long Running Workflows

**Symptoms**: Workflows take too long, hit timeouts.

**Profile**:
- Use workflow run summary to identify slowest jobs and steps

**Optimize**:
- Combine `run` commands with `&&`
- Clean up temp files in same step
- Install only necessary dependencies

**Leverage caching**: Ensure `actions/cache` covers all significant dependencies.

**Parallelize**: Use `strategy.matrix` for concurrent test/build runs.

**Runners**: Consider larger runners or self-hosted for resource-intensive tasks.

**Break down**: Split complex workflows into smaller, focused workflows.

## Flaky Tests

**Symptoms**: Random failures, passes locally but fails in CI.

**Ensure isolation**:
- Each test independent, no shared state
- Clean up resources after each test/suite

**Eliminate race conditions**:
- Use explicit waits (wait for element, API response) not `sleep`
- Add retries for transient external service failures

**Standardize environments**:
- Match CI env to local (Node.js version, packages, DB versions)
- Use Docker `services` for consistent dependencies

**Robust selectors (E2E)**:
- Use `data-testid` attributes, not CSS classes or XPath

**Debug**: Capture screenshots and video on failure in CI.

## Deployment Failures

**Symptoms**: Application not working after deploy.

**Review logs**: Check deployment logs, application logs, server logs.

**Validate config**: Verify environment variables, ConfigMaps, Secrets match target environment.

**Check dependencies**: Confirm runtime dependencies are bundled/installed.

**Health checks**: Run automated smoke tests after deployment — trigger rollback if failed.

**Network**: Check connectivity between components, review firewall rules and security groups.

**Rollback**: If production deployment fails, rollback immediately. Diagnose in non-prod.
