# Chrome DevTools MCP Tool Reference

## Input Automation

### `click`

Clicks on the provided element.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | yes | Element uid from page snapshot |
| `dblClick` | boolean | no | Double click (default false) |
| `includeSnapshot` | boolean | no | Include snapshot in response (default false) |

### `drag`

Drag an element onto another element.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from_uid` | string | yes | Element to drag |
| `to_uid` | string | yes | Element to drop into |
| `includeSnapshot` | boolean | no | Include snapshot in response (default false) |

### `fill`

Type text into input/textarea or select an option from a `<select>` element.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | yes | Element uid from page snapshot |
| `value` | string | yes | Value to fill in |
| `includeSnapshot` | boolean | no | Include snapshot in response (default false) |

### `fill_form`

Fill out multiple form elements at once.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `elements` | array | yes | Elements from snapshot to fill out |
| `includeSnapshot` | boolean | no | Include snapshot in response (default false) |

### `handle_dialog`

Handle a browser dialog (alert, confirm, prompt).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | "accept" \| "dismiss" | yes | Accept or dismiss the dialog |
| `promptText` | string | no | Text to enter into prompt dialog |

### `hover`

Hover over the provided element.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | yes | Element uid from page snapshot |
| `includeSnapshot` | boolean | no | Include snapshot in response (default false) |

### `press_key`

Press a key or key combination. Use when `fill()` can't be used (keyboard shortcuts, navigation keys, special combinations).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | yes | Key or combination (e.g., "Enter", "Control+A", "Control+Shift+R"). Modifiers: Control, Shift, Alt, Meta |
| `includeSnapshot` | boolean | no | Include snapshot in response (default false) |

### `upload_file`

Upload a file through a provided element.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | yes | Local path of file to upload |
| `uid` | string | yes | File input element or element that opens file chooser |
| `includeSnapshot` | boolean | no | Include snapshot in response (default false) |

## Navigation Automation

### `close_page`

Closes a page by its index. The last open page cannot be closed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageId` | number | yes | Page ID (from `list_pages`) |

### `list_pages`

Get a list of pages open in the browser. No parameters.

### `navigate_page`

Navigates the currently selected page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | "url" \| "back" \| "forward" \| "reload" | no | Navigation type |
| `url` | string | no | Target URL (only for type=url) |
| `handleBeforeUnload` | "accept" \| "decline" | no | Handle beforeunload dialogs (default accept) |
| `ignoreCache` | boolean | no | Ignore cache on reload |
| `initScript` | string | no | JS to execute on new document before other scripts |
| `timeout` | integer | no | Max wait time in ms (0 = default timeout) |

### `new_page`

Creates a new page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | yes | URL to load |
| `background` | boolean | no | Open in background (default false) |
| `timeout` | integer | no | Max wait time in ms |

### `select_page`

Switch context to a different page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageId` | number | yes | Page ID (from `list_pages`) |
| `bringToFront` | boolean | no | Focus and bring page to top |

### `wait_for`

Wait for text to appear on the selected page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | yes | Text to wait for |
| `timeout` | integer | no | Max wait time in ms |

## Emulation

### `emulate`

Emulate various features on the selected page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `colorScheme` | "dark" \| "light" \| "auto" | no | Color scheme ("auto" to reset) |
| `cpuThrottlingRate` | number | no | CPU slowdown factor (1 = no throttle) |
| `geolocation` | object | no | Geolocation override (null to clear) |
| `networkConditions` | enum | no | "No emulation", "Offline", "Slow 3G", "Fast 3G", "Slow 4G", "Fast 4G" |
| `userAgent` | object | no | User agent override (null to clear) |
| `viewport` | object | no | Viewport override (null to reset) |

### `resize_page`

Resize selected page dimensions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `width` | number | yes | Page width |
| `height` | number | yes | Page height |

## Performance

### `performance_start_trace`

Start a performance trace recording. Reports Core Web Vitals.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `autoStop` | boolean | yes | Auto-stop the recording |
| `reload` | boolean | yes | Reload page after starting trace. Navigate to URL **before** starting if reload/autoStop is true |
| `filePath` | string | no | Path to save raw trace (`.json.gz` or `.json`) |

### `performance_stop_trace`

Stop the active performance trace.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | no | Path to save raw trace data |

### `performance_analyze_insight`

Get detailed info on a specific performance insight from a trace.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `insightName` | string | yes | Insight name (e.g., "DocumentLatency", "LCPBreakdown") |
| `insightSetId` | string | yes | Insight set ID from "Available insight sets" list |

## Network

### `list_network_requests`

List all requests for the selected page since last navigation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includePreservedRequests` | boolean | no | Include requests from last 3 navigations |
| `pageIdx` | integer | no | Page number (0-based) |
| `pageSize` | integer | no | Max requests to return |
| `resourceTypes` | array | no | Filter by resource types |

### `get_network_request`

Get a specific network request with full details.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reqid` | number | no | Request ID (omit for currently selected in DevTools) |
| `requestFilePath` | string | no | Path to save request body |
| `responseFilePath` | string | no | Path to save response body |

## Debugging

### `evaluate_script`

Execute JavaScript in the selected page. Returns JSON-serializable values.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `function` | string | yes | JS function declaration. Examples: `() => document.title`, `(el) => el.innerText` |
| `args` | array | no | Arguments to pass (use element uids) |

### `take_screenshot`

Capture page or element as image.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | no | Path to save screenshot |
| `format` | "png" \| "jpeg" \| "webp" | no | Image format (default png) |
| `fullPage` | boolean | no | Full page screenshot (incompatible with uid) |
| `quality` | number | no | Compression quality 0-100 (JPEG/WebP only) |
| `uid` | string | no | Element uid (omit for page screenshot) |

### `take_snapshot`

Get accessibility tree text representation with element UIDs. Always use the latest snapshot. Prefer snapshot over screenshot.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | no | Path to save snapshot |
| `verbose` | boolean | no | Include all a11y tree info (default false) |

### `list_console_messages`

List console messages for the selected page since last navigation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includePreservedMessages` | boolean | no | Include messages from last 3 navigations |
| `pageIdx` | integer | no | Page number (0-based) |
| `pageSize` | integer | no | Max messages to return |
| `types` | array | no | Filter by message types |

### `get_console_message`

Get a specific console message by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `msgid` | number | yes | Message ID from `list_console_messages` |
