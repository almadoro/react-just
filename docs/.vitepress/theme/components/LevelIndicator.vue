<script setup lang="ts">
import { computed } from "vue";
type Level = "high" | "medium" | "low";

const props = defineProps<{
  level: Level;
}>();

const filledCount = computed(() => {
  switch (props.level) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
    default:
      return 1;
  }
});
</script>

<template>
  <div
    class="Level"
    :class="[`Level--${level}`]"
    :aria-label="level"
    :title="level"
  >
    <span
      v-for="i in 3"
      :key="i"
      class="seg"
      :class="{ 'is-filled': i <= filledCount }"
    />
  </div>
</template>

<style scoped>
.Level {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.seg {
  width: 24px;
  height: 6px;
  border-radius: 4px;
  background: var(--vp-c-divider);
}

.seg.is-filled {
  background: var(--vp-c-brand-1);
}

.Level--high .seg.is-filled {
  background: #19c37d;
}

.Level--medium .seg.is-filled {
  background: #f5a623;
}

.Level--low .seg.is-filled {
  background: #f24822;
}
</style>
