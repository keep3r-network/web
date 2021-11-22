<template>
  <header class="header container">
    <div>
      <p class="quote">“All the Jobs <span>That’s Fit to Network”</span></p>
    </div>
    <div>
      <img alt="Keepr3" src="../assets/logo.svg" class="logo" />
    </div>
    <div>
      <Button size="large" v-if="!getIsWalletConnected" @onClick="connectWallet">Connect Wallet</Button>
      <Button size="large" v-if="getIsWalletConnected" @onClick="disconnectWallet">{{ shortAddress }}</Button>
    </div>
  </header>
</template>
<script>
import Button from '@/components/Button.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'Header',
  components: {
    Button,
  },
  computed: {
    ...mapGetters('wallet', ['getIsWalletConnected', 'getWalletAddress']),
    shortAddress() {
      const address = this.getWalletAddress.toString();
      const addressLength = address.length;
      return address.slice(0, 5) + '...' + address.slice(addressLength - 4, addressLength);
    },
  },
  methods: {
    connectWallet() {
      this.$store.dispatch('wallet/connect', {});
    },
    disconnectWallet() {
      this.$store.dispatch('wallet/disconnect');
    },
  },
};
</script>
