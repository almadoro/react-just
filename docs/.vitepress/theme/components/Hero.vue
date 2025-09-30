<script setup lang="ts">
import type { DefaultTheme } from "vitepress/theme";
import { VPButton, VPImage } from "vitepress/theme";

interface HeroAction {
  theme?: "brand" | "alt";
  text: string;
  link: string;
  target?: string;
  rel?: string;
}

defineProps<{
  name?: string;
  text?: string;
  tagline?: string;
  image?: DefaultTheme.ThemeableImage;
  actions?: HeroAction[];
}>();
</script>

<template>
  <div class="Hero" :class="{ 'has-image': !!image }">
    <div class="container">
      <div class="main">
        <slot name="home-hero-info-before" />
        <slot name="home-hero-info">
          <h1 class="heading">
            <span v-if="name" v-html="name" class="name clip"></span>
            <span v-if="text" v-html="text" class="text"></span>
          </h1>
          <p v-if="tagline" v-html="tagline" class="tagline"></p>
        </slot>
        <slot name="home-hero-info-after" />

        <div v-if="actions" class="actions">
          <div v-for="action in actions" :key="action.link" class="action">
            <VPButton
              tag="a"
              size="medium"
              :theme="action.theme"
              :text="action.text"
              :href="action.link"
              :target="action.target"
              :rel="action.rel"
            />
          </div>
        </div>
        <slot name="home-hero-actions-after" />
      </div>

      <slot name="home-hero-image">
        <VPImage v-if="image" class="image" :image />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.Hero {
  margin-top: calc(
    (var(--vp-nav-height) + var(--vp-layout-top-height, 0px)) * -1
  );
  padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 48px)
    24px 48px;
}

@media (min-width: 640px) {
  .Hero {
    padding: calc(
        var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 80px
      )
      48px 64px;
  }
}

@media (min-width: 960px) {
  .Hero {
    padding: calc(
        var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 80px
      )
      64px 64px;
  }
}

.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 0 auto;
  max-width: 1152px;
}

@media (min-width: 960px) {
  .container {
    grid-template-columns: 1fr 480px;
  }
}

@media (min-width: 1280px) {
  .container {
    grid-template-columns: 1fr 560px;
  }
}

.main {
  position: relative;
  z-index: 10;
}

.Hero.has-image .container {
  text-align: center;
}

@media (min-width: 960px) {
  .Hero.has-image .container {
    text-align: left;
  }
}

.heading {
  display: flex;
  flex-direction: column;
}

.name,
.text {
  width: fit-content;
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 40px;
  font-size: 32px;
  font-weight: 700;
  white-space: pre-wrap;
}

.Hero.has-image .name,
.Hero.has-image .text {
  margin: 0 auto;
}

.name {
  color: var(--vp-home-hero-name-color);
}

.clip {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 576px;
    line-height: 56px;
    font-size: 48px;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    line-height: 64px;
    font-size: 56px;
  }

  .Hero.has-image .name,
  .Hero.has-image .text {
    margin: 0;
  }
}

.tagline {
  padding-top: 8px;
  max-width: 392px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
}

.Hero.has-image .tagline {
  margin: 0 auto;
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 12px;
    max-width: 576px;
    line-height: 32px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .tagline {
    line-height: 36px;
    font-size: 24px;
  }

  .Hero.has-image .tagline {
    margin: 0;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin: -6px;
  padding-top: 24px;
}

.Hero.has-image .actions {
  justify-content: center;
}

@media (min-width: 640px) {
  .actions {
    padding-top: 32px;
  }
}

@media (min-width: 960px) {
  .Hero.has-image .actions {
    justify-content: flex-start;
  }
}

.action {
  flex-shrink: 0;
  padding: 6px;
}

:deep(.image) {
  width: 100%;
  max-height: 380px;
  object-fit: contain;
}

@media (min-width: 960px) {
  :deep(.image) {
    max-height: unset;
  }
}
</style>
