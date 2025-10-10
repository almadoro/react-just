---
outline: false
---

# Core (`react-just`)

<div :class="$style.grid">
  <Card href="/reference/core/plugin" title="react-just/vite" details="The core Vite plugin." />
</div>

## Server Utilities (`react-just/server`)

<div :class="$style.grid">
  <Card href="/reference/core/server#request" title="request" details="Access information about the current server request." />
  <Card href="/reference/core/server#response" title="response" details="Modify the current server response." />
</div>

## Low-Level APIs

<div :class="$style.grid">
  <Card href="/reference/core/client" title="react-just/client" />
</div>

<style module>
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin: 16px 0;
}
@media (min-width: 640px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}
</style>
