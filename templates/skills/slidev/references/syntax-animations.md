# Slidev Syntax & Animations Reference

## Slide Structure

### Separators
Slides are separated by `---` with blank lines before and after:

```md
---
layout: cover
---

# Cover Slide

---

# Regular Slide

---
layout: section
---

# Section Break
```

### Headmatter (Global Config)
The first frontmatter block configures the entire presentation:

```yaml
---
theme: seriph
title: My Talk
author: Jane Doe
info: |
  ## About
  Multi-line info field
transition: slide-left
colorSchema: dark
layout: cover
exportFilename: my-talk-export
drawings:
  enabled: true
  persist: false
monaco: true
codeCopy: true
record: true
routerMode: hash
---
```

### Per-Slide Frontmatter
Each slide can override layout, transitions, classes:

```yaml
---
layout: two-cols
transition: fade
class: my-custom-class
clicks: 5
dragPos:
  square: 100,200,150,150,0
---
```

### Importing External Slides

```yaml
---
src: ./pages/intro.md
---
```

Import specific slide ranges or entire files. The `src` path is relative to the main slides file.

## Presenter Notes

Use HTML comments at the end of a slide:

```md
---

# My Slide

Visible content

<!--
These are speaker notes.
Supports **markdown** and HTML.
Visible only in presenter mode.
-->
```

## MDC Syntax

Apply styles and classes inline:

```md
Hello [World]{.text-red-500.font-bold}

![image](/photo.jpg){.w-40.rounded-lg}
```

## Scoped Styles

Per-slide CSS using `<style>` tag:

```md
---

# Styled Slide

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  color: transparent;
}
</style>
```

## UnoCSS / Tailwind Utilities

UnoCSS is built-in. Use utility classes directly:

```md
<div class="grid grid-cols-2 gap-4">
  <div class="bg-blue-500 text-white p-4 rounded">Left</div>
  <div class="bg-green-500 text-white p-4 rounded">Right</div>
</div>
```

---

## Click Animation System

### v-click — Reveal Element

```html
<!-- As component -->
<v-click>This appears after one click</v-click>

<!-- As directive -->
<div v-click>This too</div>

<!-- Hide on click -->
<div v-click.hide>This disappears on click</div>
<v-click hide>Also disappears</v-click>
```

### v-after — Reveal with Previous

```html
<div v-click>First (click 1)</div>
<div v-after>Also at click 1</div>
<div v-click>Second (click 2)</div>
```

### v-clicks — Animate All Direct Children

```html
<v-clicks>

- Item 1 (click 1)
- Item 2 (click 2)
- Item 3 (click 3)

</v-clicks>
```

**Props:**
- `depth` — Nested list depth (default: 1)
- `every` — Items revealed per click (default: 1)

```html
<v-clicks every="2">

- Items 1-2 (click 1)
-
- Items 3-4 (click 2)
-

</v-clicks>

<v-clicks depth="2">

- Parent 1
  - Child 1a
  - Child 1b
- Parent 2

</v-clicks>
```

### Click Positioning

**Relative positioning** (default `'+1'`):

```html
<div v-click>Click 1</div>
<div v-click>Click 2</div>
<v-click at="+2">Click 4 (skipped 3)</v-click>
<div v-click.hide="'-1'">Hidden after click 3</div>
```

**Absolute positioning:**

```html
<div v-click="3">Appears at exactly click 3</div>
<v-click at="2">Appears at click 2</v-click>
```

**Enter/Leave ranges** `[enter, leave]`:

```html
<div v-click="[2, 4]">Visible at clicks 2 and 3, hidden at 4</div>
```

### v-switch — Template-Based Switching

```html
<v-switch>
  <template #1>Shown at click 1</template>
  <template #2>Shown at click 2</template>
  <template #3>Shown at click 3</template>
</v-switch>
```

Props: `unmount` (boolean), `tag`, `childTag`, `transition`

### Total Clicks Override

```yaml
---
clicks: 10
---
```

Forces the slide to require exactly 10 clicks before advancing.

### Custom Transition CSS

```css
/* Default click animation */
.slidev-vclick-target {
  transition: all 500ms ease;
}

/* Hidden state — customize appearance */
.slidev-vclick-hidden {
  opacity: 0;
  transform: scale(0);
}
```

---

## Slide Transitions

### Frontmatter Configuration

```yaml
---
transition: slide-left
---
```

### Built-in Transitions

| Name | Effect |
|------|--------|
| `fade` | Crossfade |
| `slide-left` | Slide left |
| `slide-right` | Slide right |
| `slide-up` | Slide up |
| `slide-down` | Slide down |
| `view-transition` | View Transitions API (experimental) |

### Directional Transitions

```yaml
---
transition: slide-left | slide-right
---
```

Forward uses first, backward uses second.

### Custom Transitions

```css
.my-transition-enter-active,
.my-transition-leave-active {
  transition: opacity 0.5s ease;
}
.my-transition-enter-from,
.my-transition-leave-to {
  opacity: 0;
}
```

```yaml
---
transition: my-transition
---
```

### Per-Slide Override

```yaml
---
transition: fade
---

# This slide fades
```

### View Transitions API

```yaml
---
transition: view-transition
---
```

Name elements for morphing:

```md
# Title {.inline-block.view-transition-title}
```

---

## Motion Animations (@vueuse/motion)

### Basic Motion

```html
<div v-motion
  :initial="{ x: -80, opacity: 0 }"
  :enter="{ x: 0, opacity: 1 }"
  :leave="{ x: 80, opacity: 0 }">
  Animated element
</div>
```

### Click-Triggered Motion

```html
<div v-motion
  :initial="{ x: -80 }"
  :click-1="{ x: 0, y: 30 }"
  :click-2="{ y: 60 }">
  Multi-step animation
</div>
```

### Available Motion Properties

- `x`, `y` — Translation (pixels)
- `scale`, `scaleX`, `scaleY` — Scale
- `rotate`, `rotateX`, `rotateY` — Rotation (degrees)
- `opacity` — Opacity (0-1)
- `skewX`, `skewY` — Skew

### Combining v-motion + v-click

```html
<div v-click v-motion
  :initial="{ y: 50, opacity: 0 }"
  :enter="{ y: 0, opacity: 1 }">
  Appears and animates on click
</div>
```
