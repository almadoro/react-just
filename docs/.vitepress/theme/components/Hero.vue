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
        <div>
          <a title="About the App Component" href="/guide/app-component">
            <VPImage v-if="image" class="image" :image />
          </a>
          <div class="app-component-link">
            <a href="/guide/app-component"> About the App Component </a>
          </div>
        </div>
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
  max-width: 100%;
  max-height: 380px;
  margin: 0 auto;
  transition: box-shadow 0.3s;
  border-radius: 24px;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
}

:deep(.image):hover {
  box-shadow:
    0 10px 15px -3px color-mix(in srgb, var(--vp-c-brand-1) 70%, transparent),
    0 4px 6px -4px color-mix(in srgb, var(--vp-c-brand-1) 70%, transparent);
}

@media (min-width: 960px) {
  :deep(.image) {
    max-height: unset;
  }
}

.app-component-link {
  display: block;
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

@media (min-width: 960px) {
  .app-component-link {
    margin-top: 12px;
  }
}
</style>
