# Chrome DevTools MCP Troubleshooting

## General Tips

- Run `npx chrome-devtools-mcp@latest --help` to test if the server runs on your machine
- Ensure your MCP client uses the same npm and node version as your terminal
- Use `--yes` argument to `npx` to auto-accept installation prompts
- Check IDE Output pane for specific error messages

## Debugging

Start with debug logging enabled:

```bash
DEBUG=* npx chrome-devtools-mcp@latest --log-file=/path/to/chrome-devtools-mcp.log
```

MCP config for debugging:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--log-file",
        "/path/to/chrome-devtools-mcp.log"
      ],
      "env": {
        "DEBUG": "*"
      }
    }
  }
}
```

## Common Errors

### `Error [ERR_MODULE_NOT_FOUND]: Cannot find module ...`

Non-supported Node version or corrupted npm/npx cache. Fix:

```sh
rm -rf ~/.npm/_npx  # NOTE: removes other npx executables too
npm cache clean --force
```

### `Target closed` error

Browser could not start. Checklist:
- Close all running Chrome instances
- Install latest stable Chrome
- Verify [system can run Chrome](https://support.google.com/chrome/a/answer/7100626)

### Chrome crashes on macOS with Web Bluetooth

macOS privacy permission violation (TCC). Fix:
1. Go to `System Settings > Privacy & Security > Bluetooth`
2. Grant Bluetooth permission to the MCP client application
3. Restart the client and start a new MCP session

### Remote debugging between VM and host fails

Chrome rejects connections due to Host header validation. Fix with SSH tunnel:

```sh
# From inside the VM:
ssh -N -L 127.0.0.1:9222:127.0.0.1:9222 <user>@<host-ip>
```

Then point MCP to `http://127.0.0.1:9222`.

### Operating system sandboxes

Some MCP clients sandbox the server (macOS Seatbelt, Linux containers). Chrome can't create its own sandboxes inside another sandbox. Workarounds:
- Disable sandboxing for `chrome-devtools-mcp` in your MCP client
- Use `--browser-url` to connect to a Chrome instance started outside the sandbox

### WSL

By default requires Chrome installed within Linux. Windows-side Chrome fails due to a [known WSL issue](https://github.com/microsoft/WSL/issues/14201).

Workarounds:

**Install Chrome in WSL:**
```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
```

**Use mirrored networking:**
1. Configure [mirrored networking for WSL](https://learn.microsoft.com/en-us/windows/wsl/networking)
2. Start Chrome on Windows: `chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\path\to\dir`
3. Start MCP: `npx chrome-devtools-mcp --browser-url http://127.0.0.1:9222`

**Use PowerShell or Git Bash** instead of WSL.

