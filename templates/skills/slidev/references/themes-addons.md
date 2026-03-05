# Slidev Themes & Addons Reference

## Using Themes

### Installation

Set theme in headmatter — auto-installs if not found:

```yaml
---
theme: seriph
---
```

Or install manually:

```bash
npm install @slidev/theme-seriph
# or
pnpm add @slidev/theme-seriph
```

### Naming Conventions

| Input | Resolves To |
|-------|-------------|
| `seriph` | `@slidev/theme-seriph` |
| `my-theme` | `slidev-theme-my-theme` |
| `@org/theme` | `@org/slidev-theme-theme` |
| `./local-theme` | Local directory path |

### Popular Official Themes

| Theme | Name | Style |
|-------|------|-------|
| `default` | Default | Clean, minimal |
| `seriph` | Seriph | Elegant serif typography |
| `apple-basic` | Apple Basic | Apple Keynote inspired |
| `bricks` | Bricks | Bold, modern |
| `shibainu` | Shibainu | Playful, colorful |

Browse all at: [sli.dev/resources/theme-gallery](https://sli.dev/resources/theme-gallery)

### Theme Configuration

Pass config to themes via `themeConfig`:

```yaml
---
theme: seriph
themeConfig:
  primary: '#4EC5D4'
  serif: 'Robot Slab'
  sans: 'Inter'
---
```

Access in components: `$slidev.themeConfigs.primary`

### Eject Theme

Extract theme files into your project for full customization:

```bash
slidev theme eject
```

Copies theme layouts, components, and styles into your project directories.

---

## Using Addons

### Installation

Add in headmatter:

```yaml
---
addons:
  - excalidraw
  - '@slidev/plugin-notes'
  - slidev-addon-qrcode
---
```

Multiple addons can be used simultaneously.

### Addon vs Theme

| Feature | Theme | Addon |
|---------|-------|-------|
| Quantity | One per deck | Multiple per deck |
| Provides | Layouts, styles, components | Components, features, plugins |
| Styling | Full visual theme | Feature-specific |
| Ejectable | Yes | No |

Browse addons at: [sli.dev/resources/addon-gallery](https://sli.dev/resources/addon-gallery)

---

## Writing a Theme

### Package Structure

```
slidev-theme-my-theme/
├── components/          # Theme components
│   ├── Counter.vue
│   └── Logo.vue
├── layouts/             # Theme layouts
│   ├── cover.vue
│   ├── default.vue
│   └── section.vue
├── styles/              # Theme styles
│   └── index.ts         # or index.css
├── setup/               # Theme setup hooks
│   └── shiki.ts
├── example.md           # Example slides (for gallery)
├── package.json
├── screenshots/         # Screenshots for gallery
│   └── 01.png
└── README.md
```

### package.json

```json
{
  "name": "slidev-theme-my-theme",
  "version": "1.0.0",
  "slidev": {
    "colorSchema": "both",
    "defaults": {
      "fonts": {
        "sans": "Inter",
        "mono": "Fira Code"
      },
      "hightlighter": "shiki"
    }
  },
  "engines": {
    "slidev": ">=0.48.0"
  },
  "keywords": [
    "slidev-theme",
    "slidev"
  ]
}
```

### Theme Layout Example

```vue
<!-- layouts/cover.vue -->
<template>
  <div class="slidev-layout cover">
    <div class="my-auto w-full">
      <slot />
    </div>
    <div class="abs-br m-6 text-sm opacity-50">
      <slot name="upper-right" />
    </div>
  </div>
</template>

<style>
.cover {
  @apply h-full grid;
  background: var(--slidev-theme-primary, #4EC5D4);
}
</style>
```

### Theme Component Example

```vue
<!-- components/ThemeLogo.vue -->
<script setup>
const props = defineProps({
  size: { type: Number, default: 40 }
})
</script>

<template>
  <img :width="size" src="/logo.svg" />
</template>
```

### Color Schema

Declare support in `package.json`:

```json
{
  "slidev": {
    "colorSchema": "both"  // "light" | "dark" | "both"
  }
}
```

Use in styles:

```css
/* Light mode */
:root {
  --slidev-theme-primary: #2196F3;
  --slidev-theme-text: #333;
}

/* Dark mode */
html.dark {
  --slidev-theme-primary: #90CAF9;
  --slidev-theme-text: #eee;
}
```

---

## Writing an Addon

### Package Structure

```
slidev-addon-my-addon/
├── components/          # Addon components
│   └── QRCode.vue
├── layouts/             # Addon layouts (optional)
├── setup/               # Setup hooks
│   └── main.ts
├── package.json
└── README.md
```

### package.json

```json
{
  "name": "slidev-addon-my-addon",
  "version": "1.0.0",
  "slidev": {
    "addons": []
  },
  "keywords": [
    "slidev-addon",
    "slidev"
  ],
  "engines": {
    "slidev": ">=0.48.0"
  }
}
```

### Addon Component Example

```vue
<!-- components/QRCode.vue -->
<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  size: { type: Number, default: 200 }
})

const canvas = ref(null)

onMounted(async () => {
  // Generate QR code
})
</script>

<template>
  <canvas ref="canvas" :width="size" :height="size" />
</template>
```

### Addon Setup Hook

```ts
// setup/main.ts
import { defineAppSetup } from '@slidev/types'

export default defineAppSetup(({ app }) => {
  // Register global plugins or components
  app.provide('myAddonConfig', {
    // configuration
  })
})
```

---

## Local Development

### Testing a Theme Locally

```yaml
---
theme: ./path/to/my-theme
---
```

### Testing an Addon Locally

```yaml
---
addons:
  - ./path/to/my-addon
---
```

### Publishing

```bash
# Theme
npm publish  # package name: slidev-theme-xxx

# Addon
npm publish  # package name: slidev-addon-xxx
```

Use `slidev-theme-` or `slidev-addon-` prefix for npm discovery.
