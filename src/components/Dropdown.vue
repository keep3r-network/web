<template>
  <div class="custom-select" :tabindex="tabindex" @blur="closeSelect" :size="size">
    <div class="selected" :class="{ open: open }" @click="open = !open">
      <div class="icons" v-if="selected.icon">
        <img class="select-icon" :src="selected.icon" />
      </div>
      <div class="select-name">{{ selected.symbol }}</div>
      <div class="select-tag" v-if="selected.protocol">
        <span>{{ selected.protocol }}</span>
      </div>
    </div>
    <div class="items" :class="{ selectHide: !open }">
      <div
        class="item"
        v-for="(option, index) of options"
        :class="{ selectedItem: selected.address === option.address }"
        :key="index"
        @click="selectOption(option)"
      >
        <div class="icons" v-if="option.icon">
          <img class="select-icon" :src="option.icon" />
        </div>

        <div class="select-name" v-if="option.label">
          {{ option.label }}
        </div>
        <div class="select-tag" v-if="option.tag">
          <span>{{ option.tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dropdown',
  data() {
    return {
      open: false,
    };
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
    selected: {
      type: Object,
      required: true,
    },
    tabindex: {
      type: Number,
      required: false,
      default: 0,
    },
    size: {
      required: false,
      type: String,
      default: '',
    },
    token: Object,
  },
  methods: {
    closeSelect() {
      this.open = false;
    },
    selectOption(option) {
      this.closeSelect();
      if (option.value === this.selected.symbol && option.tag === this.selected.protocol) {
        return;
      }
      this.$emit('input', option);
    },
  },
};
</script>
