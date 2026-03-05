# Slidev Customization Reference

## Project Directory Structure

```
your-slidev/
├── components/            # Custom Vue components (auto-imported)
│   ├── Counter.vue
│   └── MyChart.vue
├── layouts/               # Custom slide layouts
│   └── my-layout.vue
├── public/                # Static assets (served at /)
│   ├── images/
│   └── favicon.ico
├── setup/                 # Setup hooks and extensions
│   ├── main.ts            # App setup
│   ├── mermaid.ts         # Mermaid config
│   ├── monaco.ts          # Monaco config
│   ├── routes.ts          # Route hooks
│   ├── shortcuts.ts       # Keyboard shortcuts
│   └── shiki.ts           # Shiki config
├── snippets/              # Reusable code snippets
│   └── example.ts
├── styles/                # Custom styles
│   └── index.css          # Main stylesheet (or style.css)
├── global-top.vue         # Global layer above all slides
├── global-bottom.vue      # Global layer below all slides
├── slide-top.vue          # Per-slide top layer
├── slide-bottom.vue       # Per-slide bottom layer
├── custom-nav-controls.vue # Custom navigation controls
├── index.html             # HTML injections (head/body)
├── slides.md              # Main presentation file
└── vite.config.ts         # Vite configuration
```

All directories and files are **optional**.

## Global Layers

### global-top.vue / global-bottom.vue

Rendered above/below ALL slides (including presenter view):

```vue
<!-- global-bottom.vue -->
<template>
  <footer class="absolute bottom-0 left-0 right-0 p-2 text-sm opacity-50">
    My Company — {{ $slidev.configs.title }}
  </footer>
</template>
```

### slide-top.vue / slide-bottom.vue

Rendered per-slide (only in slide content area):

```vue
<!-- slide-top.vue -->
<template>
  <div class="absolute top-2 right-2 text-xs opacity-40">
    {{ $page }} / {{ $nav.total }}
  </div>
</template>
```

### custom-nav-controls.vue

Add custom navigation buttons:

```vue
<!-- custom-nav-controls.vue -->
<template>
  <button class="icon-btn" title="Toggle Timer" @click="toggleTimer">
    <carbon:timer />
  </button>
</template>

<script setup>
const toggleTimer = () => {
  // Custom logic
}
</script>
```

---

## Vue Global Context

### Template Variables

Available in any slide or component:

| Variable | Type | Description |
|----------|------|-------------|
| `$slidev` | object | Main context |
| `$slidev.configs` | object | Presentation config (title, etc.) |
| `$slidev.themeConfigs` | object | Theme-specific config |
| `$frontmatter` | object | Current slide's frontmatter |
| `$nav` | object | Navigation controller |
| `$clicks` | number | Click count on current slide |
| `$page` | number | Current page (1-indexed) |
| `$renderContext` | string | Render context |

### Navigation API (`$nav`)

| Method/Property | Description |
|----------------|-------------|
| `$nav.next()` | Advance one step (click or slide) |
| `$nav.prev()` | Go back one step |
| `$nav.nextSlide()` | Jump to next slide |
| `$nav.prevSlide()` | Jump to previous slide |
| `$nav.go(n)` | Go to slide number n |
| `$nav.currentPage` | Current page number |
| `$nav.currentLayout` | Active layout name |
| `$nav.total` | Total slides |

### Render Contexts

| Context | When |
|---------|------|
| `'slide'` | Normal slide view |
| `'overview'` | Overview/grid mode |
| `'presenter'` | Presenter mode |
| `'previewNext'` | Next slide preview in presenter |
| `'print'` | Print/export mode |

### Composables

```ts
import {
  useNav,
  useDarkMode,
  useIsSlideActive,
  onSlideEnter,
  onSlideLeave,
  useSlideContext
} from '@slidev/client'

// Navigation
const { currentPage, next, prev, go } = useNav()

// Dark mode
const { isDark, toggleDark } = useDarkMode()

// Slide lifecycle
onSlideEnter(() => {
  console.log('Slide entered')
})

onSlideLeave(() => {
  console.log('Slide left')
})

// Check if active
const isActive = useIsSlideActive()
```

---

## Setup Files

### setup/main.ts — App Extensions

```ts
import { defineAppSetup } from '@slidev/types'

export default defineAppSetup(({ app, router }) => {
  // Register global components
  app.component('MyGlobal', MyGlobalComponent)

  // Install Vue plugins
  app.use(myPlugin)

  // Router hooks
  router.afterEach(() => {
    // After navigation
  })
})
```

### setup/shiki.ts — Syntax Highlighting

```ts
import { defineShikiSetup } from '@slidev/types'

export default defineShikiSetup(() => {
  return {
    themes: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
    // Add custom languages
    langs: ['custom-lang'],
  }
})
```

### setup/monaco.ts — Monaco Editor

```ts
import { defineMonacoSetup } from '@slidev/types'

export default defineMonacoSetup((monaco) => {
  // Configure Monaco
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
  })
})
```

### setup/mermaid.ts — Diagrams

```ts
import { defineMermaidSetup } from '@slidev/types'

export default defineMermaidSetup(() => {
  return {
    theme: 'forest',
    themeVariables: {
      primaryColor: '#4EC5D4',
    },
  }
})
```

### setup/shortcuts.ts — Keyboard Shortcuts

```ts
import { defineShortcutsSetup } from '@slidev/types'

export default defineShortcutsSetup((nav, base) => {
  return {
    ...base,
    // Add custom shortcuts
    t: () => {
      // Toggle something
    },
  }
})
```

### setup/routes.ts — Route Hooks

```ts
import { defineRoutesSetup } from '@slidev/types'

export default defineRoutesSetup((routes) => {
  return routes.map((route) => {
    // Modify routes
    return route
  })
})
```

---

## Styling

### styles/index.css (or style.css)

```css
/* Global styles processed by UnoCSS + PostCSS */

:root {
  --slidev-theme-primary: #4EC5D4;
}

/* Customize slide defaults */
.slidev-layout {
  padding: 2rem;
}

/* Custom code block styling */
.slidev-code {
  font-size: 0.9em;
}
```

### UnoCSS Configuration

Create `uno.config.ts`:

```ts
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'text-gradient': 'bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500',
  },
  theme: {
    colors: {
      primary: '#4EC5D4',
    },
  },
})
```

### Per-Slide Scoped Styles

```md
---

# My Slide

<style>
h1 {
  color: #4EC5D4;
}
</style>
```

---

## Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // Standard Vite config
  plugins: [],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

## HTML Injection

```html
<!-- index.html -->
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
</head>
<body>
  <script>
    // Custom scripts
  </script>
</body>
```

---

## Headmatter Configuration Reference

```yaml
---
# Presentation
theme: seriph
title: My Presentation
author: Jane Doe
info: |
  Multi-line description

# Appearance
colorSchema: dark           # 'dark' | 'light' | 'all'
background: /cover.jpg
class: text-center

# Layout
layout: cover

# Transitions
transition: slide-left

# Features
monaco: true                # Enable Monaco editor
codeCopy: true              # Copy button on code blocks
record: true                # Enable recording
drawings:
  enabled: true
  persist: false
  syncAll: false

# Export
exportFilename: my-slides
download: true              # Show download button

# Code
lineNumbers: true           # Global line numbers
magicMoveDuration: 800
magicMoveCopy: true

# Theme config
themeConfig:
  primary: '#4EC5D4'

# Addons
addons:
  - excalidraw

# Routing
routerMode: hash            # 'hash' | 'history'
---
```
