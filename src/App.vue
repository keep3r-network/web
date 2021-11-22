<template>
  <div id="app">
    <Alerts />
    <Modals />
    <Header />
    <Navbar />
    <router-view />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import Header from '@/components/Header.vue';
import Modals from '@/components/Modals.vue';
import Alerts from '@/components/Alerts.vue';

export default {
  components: {
    Navbar,
    Header,
    Modals,
    Alerts,
  },
};
</script>
