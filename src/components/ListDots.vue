<template>
  <div>
    <span v-if="userKeeperDataLoading">LOADING...</span>
    <ul class="list-dots">
      <li v-for="item in selectUserKeeperInfo" :key="item.id">
        <span class="name">{{ item.name }}</span>
        <span class="number">{{ item.number }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ListDots',
  props: {
    icon: Object,
  },
  computed: {
    ...mapGetters('keepers', ['selectUserKeeperInfo', 'userKeeperDataLoading']),
  },
};
</script>
