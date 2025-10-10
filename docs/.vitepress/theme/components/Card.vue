<script setup>
defineProps(["title", "details", "href"]);
</script>

<style scoped>
p {
  margin: 0;
}

.box {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition:
    border-color 0.25s,
    background-color 0.25s;
  padding: 24px;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

a.box:hover {
  border-color: var(--vp-c-brand-1);
}

.title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
}

.details {
  flex-grow: 1;
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>

<template>
  <component :is="href ? 'a' : 'div'" class="box" :href="href">
    <p class="title">
      {{ title }}
    </p>
    <p v-if="details" class="details">
      {{ details }}
    </p>
  </component>
</template>
