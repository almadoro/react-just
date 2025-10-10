<script setup lang="ts">
import { useData } from "vitepress";
import { VPHomeFeatures } from "vitepress/theme";
import ComparisonSection from "./ComparisonSection.vue";
import HomeHero from "./HomeHero.vue";

const { frontmatter, theme } = useData();
</script>

<template>
  <div
    class="Home"
    :class="{
      'external-link-icon-enabled': theme.externalLinkIcon,
    }"
  >
    <slot name="home-hero-before" />
    <HomeHero>
      <template #home-hero-info-before
        ><slot name="home-hero-info-before"
      /></template>
      <template #home-hero-info><slot name="home-hero-info" /></template>
      <template #home-hero-info-after
        ><slot name="home-hero-info-after"
      /></template>
      <template #home-hero-actions-after
        ><slot name="home-hero-actions-after"
      /></template>
      <template #home-hero-image><slot name="home-hero-image" /></template>
    </HomeHero>
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <VPHomeFeatures />
    <slot name="home-features-after" />

    <ComparisonSection />
  </div>
</template>

<style scoped>
.Home {
  margin-bottom: 96px;
}

@media (min-width: 768px) {
  .Home {
    margin-bottom: 128px;
  }
}
</style>
