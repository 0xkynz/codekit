# GitHub Actions Testing Strategies

## Unit Tests

Run on every push — fastest feedback loop.

- Use language-specific runners: Jest, Vitest, Pytest, Go testing, JUnit, RSpec
- Integrate code coverage: Istanbul (JS), Coverage.py, JaCoCo (Java)
- Enforce minimum coverage thresholds
- Parallelize unit tests to reduce execution time
- Publish results via `actions/upload-artifact` (JUnit XML) or test reporter actions

## Integration Tests

Verify component interactions with real dependencies.

Use `services` to spin up databases, queues, caches:

```yaml
jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
```

- Run after unit tests, before E2E
- Plan test data management — ensure cleanup between runs
- Balance mocking vs real service instances

## End-to-End (E2E) Tests

Simulate full user behavior with Cypress, Playwright, or Selenium.

- Run against a deployed staging environment for maximum fidelity
- Mitigate flakiness: explicit waits, robust selectors (`data-testid`), retries
- Capture screenshots and video on failure
- Consider visual regression testing (Applitools, Percy)

## Performance & Load Testing

Assess behavior under load with k6, JMeter, Locust, Gatling, Artillery.

- Run less frequently (nightly, weekly, or on feature merges)
- Define clear thresholds: response time, throughput, error rates
- Fail builds if performance degrades beyond baseline
- Run in a dedicated environment simulating production load

## Test Reporting & Visibility

- Use GitHub Checks/Annotations for inline PR feedback
- Upload reports as artifacts (JUnit XML, HTML, coverage, screenshots)
- Push results to external dashboards (SonarQube, Allure, TestRail)
- Add workflow status badges to README
