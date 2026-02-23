# Chrome DevTools MCP Configuration

## MCP Client Setup

Standard configuration:
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

### Client-Specific Setup

**Claude Code (CLI):**
```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
```

**Claude Code (Plugin with Skills):**
```sh
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp
```

**VS Code / Copilot:**
```bash
code --add-mcp '{"name":"io.github.ChromeDevTools/chrome-devtools-mcp","command":"npx","args":["-y","chrome-devtools-mcp"],"env":{}}'
```

**Cursor:** `Cursor Settings` → `MCP` → `New MCP Server` → use standard config.

**Gemini CLI:**
```bash
gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest
# Or as extension (MCP+Skills):
gemini extensions install --auto-update https://github.com/ChromeDevTools/chrome-devtools-mcp
```

**Codex:**
```bash
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

**Amp:**
```bash
amp mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

Works with: Claude Code, Cursor, VS Code, Copilot, Gemini CLI, Cline, Codex, Factory CLI, Antigravity, JetBrains, Katalon, OpenCode, Qoder, Warp, Windsurf, and more.

## CLI Options

Pass via `args` in JSON config:
```json
"args": ["chrome-devtools-mcp@latest", "--channel=canary", "--headless=true", "--isolated=true"]
```

### Connection

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--browserUrl`, `-u` | string | — | Connect to running Chrome (e.g., `http://127.0.0.1:9222`) |
| `--wsEndpoint`, `-w` | string | — | WebSocket endpoint (e.g., `ws://127.0.0.1:9222/devtools/browser/<id>`) |
| `--wsHeaders` | string | — | Custom WebSocket headers as JSON |
| `--autoConnect` | boolean | false | Auto-connect to Chrome 144+ running in user data dir |

### Browser

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--channel` | string | stable | Chrome channel: stable, canary, beta, dev |
| `--executablePath`, `-e` | string | — | Path to custom Chrome executable |
| `--headless` | boolean | false | Run in headless (no UI) mode |
| `--isolated` | boolean | false | Temporary user-data-dir, cleaned up on close |
| `--userDataDir` | string | — | Custom user data directory |
| `--viewport` | string | — | Initial viewport size (e.g., `1280x720`) |
| `--proxyServer` | string | — | Proxy server for Chrome |
| `--acceptInsecureCerts` | boolean | false | Ignore self-signed/expired certificate errors |
| `--chromeArg` | array | — | Additional Chrome arguments |
| `--ignoreDefaultChromeArg` | array | — | Disable default Chrome arguments |

### Tool Categories

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--categoryEmulation` | boolean | true | Include emulation tools |
| `--categoryPerformance` | boolean | true | Include performance tools |
| `--categoryNetwork` | boolean | true | Include network tools |

### Other

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--logFile` | string | — | Debug log file path (set `DEBUG=*` env for verbose) |
| `--performanceCrux` | boolean | true | Send trace URLs to CrUX API for field data |
| `--usageStatistics` | boolean | true | Google usage statistics collection |
| `--experimentalScreencast` | boolean | false | Screencast tools (requires ffmpeg) |

## Connecting to a Running Chrome Instance

### Automatic Connection (Chrome 144+)

Best for sharing state between manual and agent-driven testing.

1. In Chrome, navigate to `chrome://inspect/#remote-debugging` and enable remote debugging
2. Configure MCP: `"args": ["chrome-devtools-mcp@latest", "--autoConnect"]`
3. Test: "Check the performance of https://developers.chrome.com"

### Manual Connection via Remote Debugging Port

Best for sandboxed environments.

**Step 1:** Configure MCP with `--browser-url`:
```json
"args": ["chrome-devtools-mcp@latest", "--browser-url=http://127.0.0.1:9222"]
```

**Step 2:** Start Chrome with remote debugging:

```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable

# Linux
/usr/bin/google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-profile-stable"
```

### WebSocket with Custom Headers

```json
"args": [
  "chrome-devtools-mcp@latest",
  "--wsEndpoint=ws://127.0.0.1:9222/devtools/browser/<id>",
  "--wsHeaders={\"Authorization\":\"Bearer YOUR_TOKEN\"}"
]
```

Get the WebSocket endpoint from `http://127.0.0.1:9222/json/version` (`webSocketDebuggerUrl` field).

## User Data Directory

Default persistent profile locations:
- **Linux/macOS:** `$HOME/.cache/chrome-devtools-mcp/chrome-profile-$CHANNEL`
- **Windows:** `%HOMEPATH%/.cache/chrome-devtools-mcp/chrome-profile-$CHANNEL`

Not cleared between runs. Use `--isolated` for a temporary directory that auto-cleans on browser close.

## Privacy

- **CrUX API:** Performance tools may send trace URLs to Google CrUX API. Disable with `--no-performance-crux`.
- **Usage statistics:** Enabled by default. Opt out with `--no-usage-statistics` or set `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS` or `CI` env variables.
