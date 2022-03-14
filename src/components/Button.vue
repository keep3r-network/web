<template>
  <div>
    <button
      type="button"
      :disabled="disabled ? '' : null"
      class="k-button"
      :size="size"
      :theme="theme"
      @click="onClick"
    >
      <slot></slot>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    size: {
      required: false,
      type: String,
      default: '',
    },
    theme: {
      required: false,
      type: String,
      default: '',
    },
  },
  methods: {
    onClick() {
      this.$emit('onClick');
    },
  },
};
</script>
