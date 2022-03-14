<template>
  <div class="k-alerts">
    <transition-group class="alerts-container" name="slide" tag="div">
      <Alert v-for="alert in selectAlerts" :key="alert.id" :alert="alert" @close="closeAlert(alert.id)" />
    </transition-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Alert from '@/components/Alert';

export default {
  name: 'Alerts',
  components: {
    Alert,
  },
  computed: {
    ...mapGetters('alerts', ['selectAlerts']),
  },
  methods: {
    closeAlert(alertId) {
      this.$store.dispatch('alerts/closeAlert', alertId);
    },
  },
};
</script>

<style lang="scss">
.k-alerts {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: var(--z-index-alerts);
  pointer-events: none;
}

.alerts-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  padding: 5rem 3rem;
  max-width: 100%;
  gap: 2rem;
}
</style>
