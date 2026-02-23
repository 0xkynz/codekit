# GitHub Actions Deployment Strategies

## Staging Environment

- Mirror production: infrastructure, data, configuration, security
- Use GitHub `environment` with approval rules and branch restrictions
- Auto-deploy on merges to `develop` or `release/*`
- Run smoke tests and post-deployment validation
- Refresh staging data from production regularly (anonymized)

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: app-build
      - run: ./deploy.sh staging
```

## Production Environment

- Require manual approvals (multiple reviewers, security sign-off)
- Use strict branch protections and deployment windows
- Monitor closely during and immediately after deployment
- Have expedited pipeline for critical hotfixes

```yaml
jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    needs: [build, test, deploy-staging]
    environment:
      name: production
      url: https://prod.example.com
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: app-build
      - run: ./deploy.sh production
```

## Deployment Types

### Rolling Update (Default)
Gradually replace old instances with new ones.
- Configure `maxSurge` and `maxUnavailable` for rollout control
- Good for stateless applications

### Blue/Green
Deploy new version alongside existing, then switch all traffic.
- Zero-downtime releases
- Instant rollback by switching back to blue environment
- Requires two identical environments and traffic router (load balancer, DNS)

### Canary
Route 5-10% of traffic to new version, monitor, then expand.
- Early issue detection with minimal user impact
- Implement with Service Mesh (Istio, Linkerd) or Ingress controllers
- Metric-based analysis before full rollout

### Dark Launch / Feature Flags
Deploy code but keep features hidden until toggled on.
- Decouples deployment from release
- Enables A/B testing and staged rollouts
- Use LaunchDarkly, Split.io, Unleash, or custom flags

### A/B Testing
Deploy multiple versions to different user segments concurrently.
- Compare based on user behavior and business metrics
- Integrate with specialized A/B testing platforms

## Rollback Strategies

- **Automated rollbacks**: Trigger based on monitoring alerts (error spikes, latency)
- **Versioned artifacts**: Keep previous successful builds readily available
- **Runbooks**: Document clear, executable rollback procedures
- **Post-incident review**: Blameless PIRs to prevent recurrence
- **Communication plan**: Clear stakeholder communication during incidents

Design applications with rollback in mind — changes should be reversible.
