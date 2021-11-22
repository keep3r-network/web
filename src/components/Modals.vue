<template>
  <div class="k-modals">
    <transition-group class="modals-container" name="slide" tag="div">
      <component v-if="activeModal" :is="activeModal.component" :key="activeModal.key" @close="closeModal" />
    </transition-group>
    <transition name="fade">
      <div class="backdrop" v-if="activeModal" @click="closeModal"></div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import JobBondModal from '@/components/CustomModals/JobBondModal';
import JobUnbondModal from '@/components/CustomModals/JobUnbondModal';
import BondModal from '@/components/CustomModals/BondModal';
import UnbondModal from '@/components/CustomModals/UnbondModal';
import KeeperModal from '@/components/CustomModals/KeeperModal';

const MODALS = [
  { key: 'jobBond', component: JobBondModal },
  { key: 'jobUnbond', component: JobUnbondModal },
  { key: 'bond', component: BondModal },
  { key: 'unbond', component: UnbondModal },
  { key: 'keeper', component: KeeperModal },
];

export default {
  name: 'Modals',
  components: {
    JobBondModal,
    JobUnbondModal,
    BondModal,
    UnbondModal,
    KeeperModal,
  },
  computed: {
    ...mapGetters('modals', ['selectActiveModal']),
    activeModal() {
      return MODALS.find(({ key }) => key === this.selectActiveModal);
    },
  },
  methods: {
    closeModal() {
      this.$store.dispatch('modals/closeModal');
    },
  },
};
</script>
