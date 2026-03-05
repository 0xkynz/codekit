#!/usr/bin/env bash
# Analyze ESLint errors grouped by directory
# Usage: bash analyze_errors.sh [directory-or-file]

set -euo pipefail

TARGET="${1:-.}"

echo "=== ESLint Error Analysis ==="
echo "Target: $TARGET"
echo ""

# Run ESLint with JSON output, capture even on failure
LINT_OUTPUT=$(npx eslint "$TARGET" --format json 2>/dev/null || true)

if [ -z "$LINT_OUTPUT" ]; then
  echo "No ESLint output. Check that ESLint is configured for this project."
  exit 1
fi

# Total counts
TOTAL_ERRORS=$(echo "$LINT_OUTPUT" | jq '[.[].errorCount] | add // 0')
TOTAL_WARNINGS=$(echo "$LINT_OUTPUT" | jq '[.[].warningCount] | add // 0')
FILES_WITH_ISSUES=$(echo "$LINT_OUTPUT" | jq '[.[] | select(.errorCount > 0 or .warningCount > 0)] | length')

echo "Total errors:   $TOTAL_ERRORS"
echo "Total warnings: $TOTAL_WARNINGS"
echo "Files affected:  $FILES_WITH_ISSUES"
echo ""

# Group by directory
echo "=== By Directory ==="
echo "$LINT_OUTPUT" | jq -r '
  [.[] | select(.errorCount > 0 or .warningCount > 0)]
  | group_by(.filePath | split("/")[:-1] | join("/"))
  | map({
      dir: .[0].filePath | split("/")[:-1] | join("/"),
      errors: [.[].errorCount] | add,
      warnings: [.[].warningCount] | add,
      files: length
    })
  | sort_by(-.errors)
  | .[]
  | "\(.dir) — \(.errors) errors, \(.warnings) warnings (\(.files) files)"
'

echo ""

# Top rules violated
echo "=== Top Rules ==="
echo "$LINT_OUTPUT" | jq -r '
  [.[].messages[]]
  | group_by(.ruleId)
  | map({rule: .[0].ruleId, count: length})
  | sort_by(-.count)
  | .[:15]
  | .[]
  | "\(.count)x \(.rule // "parse-error")"
'
