<template>
  <div class="k-input">
    <label>{{ label }}</label>
    <div class="form-group">
      <input type="text" :placeholder="placeholder" v-model="inputValue" class="form-field" v-on:input="inputChange" />
      <span pointer @click="setMax" v-if="maxValue">MAX</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
    maxValue: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      inputValue: '0',
    };
  },
  methods: {
    inputChange() {
      this.$emit('onInput', this.inputValue);
    },
    setMax() {
      this.inputValue = this.maxValue;
      this.inputChange();
    },
  },
};
</script>
