<template>
  <div class="k-form">
    <form v-on:submit.prevent="onSubmit">
      <label>{{ label }}</label>
      <div class="wrap-search" :class="{ error: searchError }">
        <input
          type="text"
          :placeholder="placeholder"
          v-model="query"
          v-on="submitOnChange ? { input: onSubmit } : {}"
          class="input-search"
          :class="{ error: searchError }"
          @change="onChange"
        />
        <input id="search_submit" type="submit" class="input-search-bt" />

        <span class="error" v-if="searchError">Not an address</span>
      </div>
    </form>
  </div>
</template>

<script>
import web3 from 'web3';

export default {
  name: 'Search',
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
    submitOnChange: {
      type: Boolean,
      required: false,
      default: false,
    },
    validateAddress: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      query: '',
      dirty: false,
    };
  },
  computed: {
    searchError() {
      return this.validateAddress && !this.isAddress && this.dirty;
    },
    isAddress() {
      return web3.utils.isAddress(this.query.toLowerCase());
    },
  },
  methods: {
    onSubmit() {
      if (this.validateAddress && !this.isAddress) {
        return;
      }
      this.$emit('onSubmit', this.query.toLowerCase());
    },
    onChange() {
      this.dirty = true;
    },
  },
};
</script>
