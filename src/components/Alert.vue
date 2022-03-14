<template>
  <div
    class="k-alert"
    :class="{
      'alert-info': alert.type === 'info',
      'alert-error': alert.type === 'error',
      'alert-success': alert.type === 'success',
    }"
  >
    <Button @onClick="$emit('close')" theme="close" />

    <p>{{ alert.message }}</p>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';

export default {
  name: 'Alert',
  components: { Button },
  props: {
    alert: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.k-alert {
  width: 30rem;
  font-size: 24px;
  max-width: 100%;
  background-color: var(--color-light);
  border: 1px solid var(--color-primary);
  position: relative;
  padding: 1.5rem;
  pointer-events: all;
  p {
    margin: 0 1rem 0 0;
  }

  &.alert-error {
    background: var(--bg-error);
    border: solid 1px var(--color-error);
    color: var(--color-error);
  }
  &.alert-success {
    background: var(--bg-success);
    border: solid 1px var(--color-success);
    color: var(--color-success);
  }
  &.alert-info {
    background: var(--bg-info);
    border: solid 1px var(--color-info);
    color: var(--color-info);
  }

  .k-button[theme='close'] {
    top: 10px;
    right: 8px;
    width: 12px;
    height: 12px;
    background-size: 100%;
    filter: contrast(0.3);
    fill: #595959;
    &:hover {
      background-size: 100%;
    }
  }
}
</style>
