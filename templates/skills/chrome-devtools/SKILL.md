---
name: chrome-devtools
description: Chrome DevTools via MCP for browser automation, debugging, performance analysis, network inspection, and accessibility testing. Use when debugging web pages, automating browser interactions, analyzing performance, inspecting network requests, or auditing accessibility.
---

# Chrome DevTools MCP

Control and inspect a live Chrome browser via MCP. Provides 26 tools for reliable automation, debugging, performance analysis, and accessibility testing.

## Quick Reference

| Topic | Reference |
|-------|-----------|
| [Tool Reference](references/tool-reference.md) | All 26 tools with parameters |
| [Configuration](references/configuration.md) | CLI options, MCP client setup, connecting to running Chrome |
| [Troubleshooting](references/troubleshooting.md) | Common errors and debugging |
| [Accessibility](references/accessibility.md) | A11y auditing workflow and scripts |
| [Android Debugging](references/android-debugging.md) | Remote debugging Chrome on Android |

## Setup

MCP client configuration:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

Requirements: Node.js v20.19+, Chrome stable, npm.

## Core Concepts

**Browser lifecycle**: Browser starts automatically on first tool call using a persistent Chrome profile. Configure via CLI args: `npx chrome-devtools-mcp@latest --help`.

**Page selection**: Tools operate on the currently selected page. Use `list_pages` to see available pages, then `select_page` to switch context.

**Element interaction**: Use `take_snapshot` to get page structure with element `uid`s. Each element has a unique `uid` for interaction. If an element isn't found, take a fresh snapshot — the element may have been removed or the page changed.

## Workflow Patterns

### Before interacting with a page

1. **Navigate**: `navigate_page` or `new_page`
2. **Wait**: `wait_for` to ensure content is loaded
3. **Snapshot**: `take_snapshot` to understand page structure
4. **Interact**: Use element `uid`s from snapshot for `click`, `fill`, etc.

### Efficient data retrieval

- Use `filePath` parameter for large outputs (screenshots, snapshots, traces)
- Use pagination (`pageIdx`, `pageSize`) and filtering (`types`) to minimize data
- Set `includeSnapshot: false` on input actions unless you need updated page state

### Tool selection

| Need | Tool | Why |
|------|------|-----|
| Automation/interaction | `take_snapshot` | Text-based, faster, better for automation |
| Visual inspection | `take_screenshot` | When user needs to see visual state |
| Additional details | `evaluate_script` | Data not in accessibility tree |
| Performance analysis | `performance_start_trace` → `performance_stop_trace` | Core Web Vitals, insights |
| Network debugging | `list_network_requests` → `get_network_request` | Request/response inspection |
| Console errors | `list_console_messages` → `get_console_message` | JS errors, warnings, issues |

### Parallel execution

You can send multiple tool calls in parallel, but maintain correct order: navigate → wait → snapshot → interact.

## Tool Categories (26 tools)

### Input Automation (8)
`click`, `drag`, `fill`, `fill_form`, `handle_dialog`, `hover`, `press_key`, `upload_file`

### Navigation (6)
`close_page`, `list_pages`, `navigate_page`, `new_page`, `select_page`, `wait_for`

### Emulation (2)
`emulate` (color scheme, CPU throttle, network, viewport, geolocation, user agent), `resize_page`

### Performance (3)
`performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`

### Network (2)
`list_network_requests`, `get_network_request`

### Debugging (5)
`evaluate_script`, `take_screenshot`, `take_snapshot`, `list_console_messages`, `get_console_message`

## Troubleshooting

If `chrome-devtools-mcp` is insufficient, guide users to Chrome DevTools UI:
- https://developer.chrome.com/docs/devtools
- https://developer.chrome.com/docs/devtools/ai-assistance

For launch/connection errors, see [Troubleshooting](references/troubleshooting.md).
