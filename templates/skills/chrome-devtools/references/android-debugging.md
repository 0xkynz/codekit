# Debugging Chrome on Android

Experimental feature — Puppeteer does not officially support Chrome on Android as a target.

## Setup

1. Open **Developer Options** on your Android device ([guide](https://developer.android.com/studio/debug/dev-options.html))
2. Enable **USB Debugging**
3. Connect Android device to development machine via USB
4. Set up port forwarding:
   ```bash
   adb forward tcp:9222 localabstract:chrome_devtools_remote
   ```
5. Configure MCP server:
   ```json
   {
     "chrome-devtools": {
       "command": "npx",
       "args": [
         "chrome-devtools-mcp@latest",
         "--wsEndpoint=ws://127.0.0.1:9222/devtools/browser/"
       ],
       "trust": true
     }
   }
   ```
6. Test with: "Check the performance of developers.chrome.com"

## Troubleshooting

If DevTools doesn't detect the Android device, see [Chrome remote debugging troubleshooting](https://developer.chrome.com/docs/devtools/remote-debugging#troubleshooting).
