<script setup lang="ts">
import nextIcon from "../icons/next.svg";
import reactJustIcon from "../icons/react-just.svg";
import reactRouterDarkIcon from "../icons/react-router-dark.svg";
import reactRouterLightIcon from "../icons/react-router-light.svg";
import LevelIndicator from "./LevelIndicator.vue";
</script>

<template>
  <div class="ComparisonTable">
    <div class="Container">
      <div class="SectionHeader">
        <h2 class="SectionTitle">Simplicity and flexibility above all</h2>
        <p class="SectionSubtitle">
          How React Just compares to other frameworks.
        </p>
      </div>
      <div class="Card">
        <div class="TableWrapper">
          <table class="Table" aria-label="Framework comparison table">
            <thead>
              <tr>
                <th class="TopicCol">Topic</th>
                <th class="BrandCol">
                  <div class="HeaderCell">
                    <img
                      class="Icon Icon--rj"
                      :src="reactJustIcon"
                      alt="React Just"
                    />
                    <span>React Just</span>
                  </div>
                </th>
                <th class="BrandCol">
                  <div class="HeaderCell">
                    <img class="Icon" :src="nextIcon" alt="Next.js" />
                    <span>Next.js</span>
                  </div>
                </th>
                <th class="BrandCol">
                  <div class="HeaderCell">
                    <img
                      class="Icon Icon--light"
                      :src="reactRouterLightIcon"
                      alt="React Router"
                    />
                    <img
                      class="Icon Icon--dark"
                      :src="reactRouterDarkIcon"
                      alt="React Router"
                    />
                    <span>React Router</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="TopicCol">RSC support</td>
                <td>
                  <LevelIndicator level="medium" />
                  use server directive with function-level support under
                  development
                </td>
                <td>
                  <LevelIndicator level="high" />
                  Full support
                </td>
                <td>
                  <LevelIndicator level="low" />
                  Experimental and confusing to set up
                </td>
              </tr>
              <tr>
                <td class="TopicCol">Learning curve</td>
                <td>
                  <LevelIndicator level="high" />
                  React Server Components with a few utilities to read request
                  details and modify responses
                </td>
                <td>
                  <LevelIndicator level="medium" />
                  Includes many additional features and conventions
                </td>
                <td>
                  <LevelIndicator level="low" />
                  Includes many additional conventions that overlap with RSC,
                  which can cause confusion. Also, multiple modes and the
                  relation to Remix can generate even more confusion.
                </td>
              </tr>
              <tr>
                <td class="TopicCol">Routing</td>
                <td>
                  <LevelIndicator level="high" />
                  Choose your routing solution, skip routing, or build your own
                </td>
                <td>
                  <LevelIndicator level="low" />
                  Not customizable; strictly file-system based
                </td>
                <td>
                  <LevelIndicator level="medium" />
                  Built on React Router; supports programmatic and file-system
                  routing
                </td>
              </tr>
              <tr>
                <td class="TopicCol">Deployment</td>
                <td>
                  <LevelIndicator level="high" />
                  Deployable anywhere
                </td>
                <td>
                  <LevelIndicator level="low" />
                  Difficult to deploy the fully-featured version outside Vercel.
                </td>
                <td>
                  <LevelIndicator level="high" />
                  Deployable anywhere
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ComparisonTable {
  margin-top: 32px;
  padding: 24px 48px;
}

@media (min-width: 640px) {
  .ComparisonTable {
    padding: 48px 64px;
  }
}

@media (min-width: 960px) {
  .ComparisonTable {
    padding: 64px 64px;
  }
}

.ComparisonTable .Container {
  margin: 0 auto;
  max-width: 1152px;
}

.ComparisonTable .SectionHeader {
  margin-bottom: 16px;
}

.ComparisonTable .SectionTitle {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.ComparisonTable .SectionSubtitle {
  margin: 8px 0 0;
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.ComparisonTable .Card {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.ComparisonTable .TableWrapper {
  width: 100%;
  overflow-x: auto;
}

.ComparisonTable .Table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.ComparisonTable thead th {
  position: sticky;
  top: 0;
  background: var(--vp-c-bg);
  z-index: 1;
}

.ComparisonTable th,
.ComparisonTable td {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 14px 12px;
  text-align: left;
  vertical-align: top;
}

.ComparisonTable tbody tr:nth-child(odd) {
  background: var(--vp-c-bg-soft);
}

.ComparisonTable .TopicCol {
  width: 16rem;
  white-space: nowrap;
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.ComparisonTable .BrandCol {
  min-width: 16rem;
}

.ComparisonTable .HeaderCell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ComparisonTable .Icon {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
}

.ComparisonTable .Icon--rj {
  filter: drop-shadow(0 0 6px rgba(0, 255, 191, 0.5));
}

.ComparisonTable .Icon--dark {
  display: none;
}
.dark .ComparisonTable .Icon--light {
  display: none;
}
.dark .ComparisonTable .Icon--dark {
  display: inline-block;
}

.ComparisonTable .Icon.Placeholder {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--vp-c-divider), transparent);
}

@media (max-width: 768px) {
  .ComparisonTable .TopicCol {
    width: auto;
  }
  .ComparisonTable .BrandCol {
    min-width: 14rem;
  }
}
</style>
