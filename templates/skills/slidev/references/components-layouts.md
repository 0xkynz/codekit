# Slidev Components & Layouts Reference

## Built-in Components

### Arrow

Draw lines with directional endpoints:

```html
<Arrow x1="10" y1="20" x2="100" y2="200" />
<Arrow v-bind="{ x1:10, y1:10, x2:200, y2:200 }" />
<Arrow x1="10" y1="20" x2="200" y2="100" width="3" color="red" two-way />
```

| Prop | Default | Description |
|------|---------|-------------|
| `x1` | — | Start X (required) |
| `y1` | — | Start Y (required) |
| `x2` | — | End X (required) |
| `y2` | — | End Y (required) |
| `width` | `2` | Line width |
| `color` | `'currentColor'` | Line color |
| `two-way` | `false` | Arrow on both ends |

### VDragArrow

Draggable arrow with same props as Arrow, plus drag interaction:

```html
<v-drag-arrow two-way />
```

### AutoFitText (Experimental)

Auto-adjusts font size to fit container:

```html
<AutoFitText :max="200" :min="100" modelValue="Big text here" />
```

| Prop | Default | Description |
|------|---------|-------------|
| `max` | `100` | Maximum font size |
| `min` | `30` | Minimum font size |
| `modelValue` | `''` | Text content |

### LightOrDark

Render different content based on color mode:

```html
<LightOrDark>
  <template #dark>
    <img src="/dark-logo.png" />
  </template>
  <template #light>
    <img src="/light-logo.png" />
  </template>
</LightOrDark>
```

### Link

Navigate to specific slides:

```html
<Link to="42">Go to slide 42</Link>
<Link to="42" title="Jump to solutions" />
```

| Prop | Description |
|------|-------------|
| `to` | Slide number or route name (string \| number) |
| `title` | Link text (alternative to slot) |

### PoweredBySlidev

Attribution footer:

```html
<PoweredBySlidev />
```

### RenderWhen

Conditional rendering based on context:

```html
<RenderWhen context="presenter">
  Only visible in presenter mode
</RenderWhen>

<RenderWhen context="slide">
  <template #default>In slide view</template>
  <template #fallback>Fallback content</template>
</RenderWhen>
```

| Context | Description |
|---------|-------------|
| `'main'` | Main presentation view |
| `'visible'` | Any visible context |
| `'print'` | Print/export mode |
| `'slide'` | Normal slide view |
| `'overview'` | Overview/grid mode |
| `'presenter'` | Presenter mode |
| `'previewNext'` | Next slide preview in presenter |

### SlideCurrentNo / SlidesTotal

```html
<SlideCurrentNo /> / <SlidesTotal />
```

### TitleRenderer

Render a slide's title as HTML:

```html
<TitleRenderer no="42" />
```

Import: `import TitleRenderer from '#slidev/title-renderer'`

### Toc (Table of Contents)

```html
<Toc />
<Toc :columns="2" :maxDepth="2" mode="onlyCurrentTree" />
```

| Prop | Default | Description |
|------|---------|-------------|
| `columns` | `1` | Number of columns |
| `listClass` | — | CSS class for list |
| `maxDepth` | `Infinity` | Max heading depth |
| `minDepth` | `1` | Min heading depth |
| `mode` | `'all'` | `'all'` \| `'onlyCurrentTree'` \| `'onlySiblings'` |

### Transform

Apply CSS scaling/transformation:

```html
<Transform :scale="0.5" origin="top center">
  <p>Half-size content</p>
</Transform>
```

| Prop | Default | Description |
|------|---------|-------------|
| `scale` | `1` | Scale factor |
| `origin` | `'top left'` | Transform origin |

### Tweet

Embed Twitter/X posts:

```html
<Tweet id="20" />
<Tweet id="1390115482657726468" :scale="0.65" />
```

| Prop | Default | Description |
|------|---------|-------------|
| `id` | — | Tweet ID (required) |
| `scale` | `1` | Display scale |
| `conversation` | `'none'` | Show thread |
| `cards` | `'visible'` | Show media cards |

### SlidevVideo

Video player with presentation controls:

```html
<SlidevVideo v-click autoplay controls>
  <source src="/myMovie.mp4" type="video/mp4" />
  <source src="/myMovie.webm" type="video/webm" />
</SlidevVideo>
```

| Prop | Default | Description |
|------|---------|-------------|
| `controls` | `false` | Show player controls |
| `autoplay` | — | `true` \| `'once'` \| `false` |
| `autoreset` | — | `'slide'` \| `'click'` — auto-reset on nav |
| `poster` | — | Poster image URL |
| `printPoster` | — | Poster for print/export |
| `timestamp` | `0` | Start timestamp (seconds) |
| `printTimestamp` | — | Timestamp for print screenshot |

### Youtube

```html
<Youtube id="luoMHjh-XcQ" />
<Youtube id="luoMHjh-XcQ" width="640" height="360" />
<Youtube id="luoMHjh-XcQ?start=60" />
```

| Prop | Default | Description |
|------|---------|-------------|
| `id` | — | YouTube video ID (required) |
| `width` | — | Player width |
| `height` | — | Player height |

### VDrag

Draggable container:

```html
<!-- Frontmatter position -->
<v-drag pos="square" text-3xl>
  <carbon:arrow-up />
  Drag me!
</v-drag>

<!-- Inline position -->
<v-drag pos="100,200,150,150,0" text-xl>
  Positioned content
</v-drag>
```

Position format: `Left,Top,Width,Height,Rotate`

Controls:
- Double-click to start dragging
- Arrow keys for precise movement
- Shift+drag to preserve aspect ratio
- Click outside to stop

### Animation Components

See `syntax-animations.md` for:
- `<v-click>`, `<v-after>`, `<v-clicks>`, `<v-switch>`

---

## Built-in Layouts

### default

General-purpose layout for any content:

```yaml
---
layout: default
---
```

### cover

Title/cover page:

```yaml
---
layout: cover
---

# Presentation Title
Your Name — Date
```

### center

Horizontally and vertically centered:

```yaml
---
layout: center
---

# Centered Content
```

### intro

Introduction slide with author/title emphasis:

```yaml
---
layout: intro
---

# Talk Title
## Subtitle
Author Name
```

### section

Section divider between topics:

```yaml
---
layout: section
---

# Part 2: Architecture
```

### statement

Bold statement emphasis:

```yaml
---
layout: statement
---

# We need to talk about testing.
```

### quote

Quotation display:

```yaml
---
layout: quote
---

# "The best way to predict the future is to invent it."
— Alan Kay
```

### fact

Data/fact with visual prominence:

```yaml
---
layout: fact
---

# 100%
Test Coverage
```

### full

Full-screen content (no padding):

```yaml
---
layout: full
---
```

### end

Closing slide:

```yaml
---
layout: end
---

# Thank You!
```

### image

Full-screen image:

```yaml
---
layout: image
image: /photo.jpg
backgroundSize: cover
---
```

### image-left / image-right

Image on one side, content on the other:

```yaml
---
layout: image-left
image: /diagram.png
class: my-cool-class
---

# Description

Text content goes here on the right side.
```

### iframe / iframe-left / iframe-right

Embed web pages:

```yaml
---
layout: iframe
url: https://sli.dev
---
```

```yaml
---
layout: iframe-right
url: https://example.com
---

# My Notes

Content on the left
```

### two-cols

Two-column layout with `::right::` separator:

```md
---
layout: two-cols
---

# Left Column

Content for left

::right::

# Right Column

Content for right
```

### two-cols-header

Header spanning both columns, then two columns below:

```md
---
layout: two-cols-header
---

# Comparison

::left::

## Option A
- Fast
- Simple

::right::

## Option B
- Flexible
- Powerful
```

### none

Blank canvas with no default styling:

```yaml
---
layout: none
---
```

---

## Custom Layouts

Create in `./layouts/` directory:

```vue
<!-- layouts/my-layout.vue -->
<template>
  <div class="slidev-layout my-layout">
    <slot />
  </div>
</template>

<style scoped>
.my-layout {
  display: grid;
  place-items: center;
  height: 100%;
}
</style>
```

Use in slides:

```yaml
---
layout: my-layout
---
```

## Custom Components

Create in `./components/` directory (auto-imported):

```vue
<!-- components/Counter.vue -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```

Use in slides:

```md
---

# Interactive Demo

<Counter />
```
