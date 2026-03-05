# Slidev Export & Deployment Reference

## CLI Reference

### Core Commands

| Command | Description |
|---------|-------------|
| `slidev [entry]` | Start dev server |
| `slidev build [entry]` | Build static SPA |
| `slidev export [entry]` | Export slides |
| `slidev format [entry]` | Format slides file |
| `slidev theme eject` | Eject theme to local |

### Dev Server Options

```bash
slidev                          # Default: slides.md on port 3030
slidev slides.md --port 8080    # Custom port
slidev --open                   # Auto-open browser
slidev --remote                 # Allow remote access
```

---

## Exporting

### Prerequisites

```bash
# Install playwright-chromium for CLI export
npm i -D playwright-chromium
# or
pnpm add -D playwright-chromium
```

### Export Formats

#### PDF (Default)

```bash
slidev export
# Output: ./slides-export.pdf

slidev export --output my-talk.pdf
slidev export --with-clicks          # Each click step = separate page
slidev export --range 1,6-8,10       # Specific slides only
slidev export --dark                  # Dark mode
slidev export --with-toc             # Include PDF outline/bookmarks
```

#### PowerPoint (PPTX)

```bash
slidev export --format pptx
```

- All slides exported as images (text not selectable)
- Includes presenter notes per slide
- `--with-clicks` enabled by default

#### PNG

```bash
slidev export --format png
# Output: individual PNG files per slide

slidev export --format png --omit-background  # Transparent background
```

#### Markdown

```bash
slidev export --format md
# Compiles markdown with embedded PNG images
```

### Export Options Reference

| Flag | Default | Description |
|------|---------|-------------|
| `--format` | `pdf` | `pdf` \| `pptx` \| `png` \| `md` |
| `--output` | `slides-export` | Output filename |
| `--with-clicks` | `false` | Export click steps as pages (default `true` for PPTX) |
| `--range` | all | Slide range (e.g., `1,6-8,10`) |
| `--dark` | `false` | Export in dark mode |
| `--with-toc` | `false` | Generate PDF outline |
| `--timeout` | `30000` | Rendering timeout (ms) |
| `--wait` | `0` | Delay before export (ms) |
| `--omit-background` | `false` | Remove background (PNG only) |

### Headmatter Export Config

```yaml
---
exportFilename: my-talk-2026
download: true          # Show download button in presentation
---
```

### Browser Exporter (v0.50.0+)

Access via navigation menu "Export" button or `http://localhost:3030/export`.

Works best in Chromium-based browsers.

---

## Building Static SPA

### Basic Build

```bash
slidev build
# Output: ./dist/
```

### Build Options

```bash
slidev build --base /talks/my-talk/   # Sub-path deployment
slidev build --out my-build            # Custom output directory
slidev build --without-notes           # Remove speaker notes from build
```

### Multiple Builds

```bash
slidev build slides1.md slides2.md
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "slidev --open",
    "build": "slidev build",
    "export": "slidev export"
  }
}
```

---

## Deployment Platforms

### GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy slides

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install
        run: npm install
      - name: Build
        run: npx slidev build --base /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
        id: deployment
```

Configure: Repository Settings → Pages → Source: "GitHub Actions"

### Netlify

Create `netlify.toml`:

```toml
[build]
  publish = 'dist'
  command = 'npm run build'

[build.environment]
  NODE_VERSION = '20'
```

Or connect the repository in Netlify dashboard:
- Build command: `npm run build` or `slidev build`
- Publish directory: `dist`

### Vercel

Create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Rewrite rules needed for SPA client-side routing.

### Docker

```bash
docker run -d \
  -p 3030:3030 \
  -v $(pwd):/slidev \
  tangramor/slidev:latest
```

Or create a `Dockerfile`:

```dockerfile
FROM tangramor/slidev:latest
COPY . /slidev
EXPOSE 3030
CMD ["npx", "slidev", "--remote"]
```

### Cloudflare Pages

- Build command: `npm run build` or `slidev build`
- Output directory: `dist`
- Framework preset: None

---

## Presenter Mode

### Access

- Press `P` key during presentation
- Navigate to `http://localhost:3030/presenter`

### Features

- Current slide + next slide preview
- Speaker notes display
- Timer and clock
- Drawing tools
- Navigation controls

### Presenter Notes

```md
---

# My Slide

Audience-visible content

<!--
Speaker notes here.
**Markdown** supported.
- Bullet points
- Reminders
-->
```

---

## Recording

Enable in headmatter:

```yaml
---
record: true
---
```

Or `record: 'dev'` (only in dev mode).

Uses RecordRTC for browser-based screen + camera recording.

---

## Drawing / Annotations

### Enable

```yaml
---
drawings:
  enabled: true
  persist: false    # Persist across slides
  presenterOnly: false
  syncAll: false    # Sync across clients
---
```

### Usage

- Press `D` key or use drawing toolbar
- Uses Drauu library
- Supports pen, eraser, shapes, text
- Can be exported with slides

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `→` / `↓` | Next animation/slide |
| `←` / `↑` | Previous animation/slide |
| `F` | Toggle fullscreen |
| `O` | Toggle overview |
| `D` | Toggle drawing mode |
| `P` | Toggle presenter mode |
| `G` | Show goto dialog |
| `Esc` | Exit fullscreen/overview |
