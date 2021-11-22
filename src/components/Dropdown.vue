<template>
  <div class="custom-select" :tabindex="tabindex" @blur="closeSelect" :size="size">
    <div class="selected" :class="{ open: open }" @click="open = !open">
      <!-- TODO DUMMY ICONS UNTIL REAL -->
      <div class="icons" v-if="size === 'double'">
        <img class="select-icon" src="../assets/tokenIcon1.png" />
        <img class="select-icon" src="../assets/tokenIcon2.png" />
      </div>
      <!-- END TODO -->
      <div class="icons" v-if="selected.icons && selected.icons.length">
        <img class="select-icon" :src="token" v-for="(token, index) in selected.icons" :key="index" />
      </div>
      <!-- TODO this is not a symbol, this is the dropdown label or value, the dropdown is generic -->
      <div class="select-name">{{ selected.symbol }}</div>
      <!-- TODO this is not a protocol, this should be the same as options, a tag, the dropdown is generic  -->
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
        <!-- TODO DUMMY ICONS UNTIL REAL -->
        <div class="icons" v-if="size === 'double'">
          <img class="select-icon" src="../assets/tokenIcon1.png" />
          <img class="select-icon" src="../assets/tokenIcon2.png" />
        </div>
        <!-- END TODO -->
        <div class="icons" v-if="option.icons && option.icons.length">
          <img class="select-icon" :src="token" v-for="(token, index) in option.icons" :key="index" />
        </div>
        <div class="select-name">{{ option.value }}</div>
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
      // tokenIcons: [
      //   'https://i.pinimg.com/originals/ab/ee/0f/abee0fc1e685e6ecad60cd507a9cf6b5.gif',
      //   'https://i.pinimg.com/originals/ab/ee/0f/abee0fc1e685e6ecad60cd507a9cf6b5.gif',
      // ],
    };
  },
  props: {
    options: {
      // NOTE dropdown option props
      // value: string
      // tag: string
      // icons: string[]
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
      // TODO the option and select should have the same names, the dropdown is generic symbol should be value or label
      if (option.value === this.selected.symbol && option.tag === this.selected.protocol) {
        return;
      }
      this.$emit('input', option);
    },
  },
};
</script>
