---
outline: false
---

# Reference

<div :class="$style.grid">
  <Card href="/reference/core" title="react-just" details="Core plugin, utility types and low-level APIs for React Just packages." />
  <Card href="/reference/router" title="@react-just/router" details="Official router with a simple, familiar API." />
</div>

## Platforms

<div :class="$style.grid">
  <Card href="/reference/platforms/node" title="@react-just/node" details="Official Node.js adapter, providing a build plugin and a CLI to serve applications." />
  <Card href="/reference/platforms/vercel" title="@react-just/vercel" details="Official Vercel adapter, providing a build plugin compatible with Vercel's Build Output API." />
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
