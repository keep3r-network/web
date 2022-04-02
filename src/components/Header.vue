<template>
  <header class="header container">
    <div>
      <p class="quote">“All the Jobs <span>That’s Fit to Network”</span></p>
    </div>
    <div>
      <img alt="Keepr3" src="../assets/logo.svg" class="logo" />
    </div>
    <div class="wallet-container">
      <Button size="large" v-if="!getIsWalletConnected" @onClick="connectWallet">Connect Wallet</Button>
      <Button size="large" v-if="getIsWalletConnected" @onClick="disconnectWallet">{{ shortAddress }}</Button>
        <Dropdown
        :options="selectNetworkOptions"
        :selected="selectSelectedNetworkOption"
        @input="handleNetworkInput"
        class="select bottom-items network-dropdown"
        size="single"
      />
    </div>
  </header>
</template>
<script>
import Button from '@/components/Button.vue';
import { mapGetters } from 'vuex';
// import Dropdown from '@/components/Dropdown.vue';

export default {
  name: 'Header',
  components: {
    Button,
    // Dropdown,
  },
  computed: {
    ...mapGetters('wallet', [
      'getIsWalletConnected',
      'getWalletAddress',
      'selectNetworkOptions',
      'selectSelectedNetworkOption',
      'selectSelectedNetwork',
      'selectNetworkList',
    ]),
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
    async handleNetworkInput({ value: id }) {
      if (!this.getIsWalletConnected) {
        await this.$store.dispatch('wallet/connect', {});
      }

      const network = this.selectNetworkList.find(network => network.id === id);
      this.$store.dispatch('wallet/changeNetwork', network);
    },
  },
};
</script>

<style lang="scss">
.wallet-container {
  display: flex;
  align-items: center;
  gap: 10px;

  .custom-select {
    height: unset;
  }

  .k-button {
    white-space: nowrap;
    min-width: 132px;

    @media screen and (min-width: 768px) {
      min-width: 164px;
    }

    @media screen and (min-width: 1500px) {
      min-width: 204px;
    }

  }

  .item.selectedItem {
    padding: 1rem 0 1rem 1rem !important;
  }

}

.select.network-dropdown {
  min-width: 75px;
  margin: 0;
  padding: 0;

  .selected {
    height: 34px;

    &:after {
      top: 50%;
    }

    @media screen and (min-width: 768px) {
      height: 50px;
    }

    @media screen and (min-width: 1500px) {
      height: 62px;
    }

  }

  .item {
    justify-content: center;
    padding: 5px 0;
    background: white;
    &:hover {
      background: #e5e5e5;
    }
    &:not(:last-child) {
      border-bottom: 1px solid #333;
    }

  }
}
</style>
