<template>
  <div class="navbar">
    <div class="container">
      <div>
        <!-- TODO DEHARDCODE PRICE -->
        <p>{{ currentDate }} | KP3R: ${{ currentPrice || ' ----' }}</p>
      </div>
      <Navigation />
      <div class="navbar-side">
        <p>This project is in beta. Use at your own risk.</p>
        <a href="https://discord.gg/9JBxTWR4nZ" target="_blank"><img alt="Discord" src="../assets/discord.svg" /></a>
        <a href="https://gov.yearn.finance/c/projects/keep3r/20" target="_blank">
          <img alt="Discourse" src="../assets/discourse.svg" />
        </a>
        <a href="https://twitter.com/thekeep3r" target="_blank"><img alt="Twitter" src="../assets/twitter.svg" /></a>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import axios from 'axios';

import Navigation from '@/components/Navigation.vue';

export default {
  name: 'Navbar',
  components: {
    Navigation,
  },
  data() {
    return {
      currentDate: DateTime.now().toLocaleString(DateTime.DATE_FULL),
      currentPrice: this.updateKeeperPrice(),
      priceInterval: null,
    };
  },
  mounted() {
    this.priceInterval = setInterval(() => {
      this.updateKeeperPrice();
    }, 1000 * 60);
  },
  beforeDestroy() {
    clearInterval(this.priceInterval);
  },
  methods: {
    updateKeeperPrice() {
      const KEEPER_CONTRACT = '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44';
      const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${KEEPER_CONTRACT}&vs_currencies=usd`;

      axios.get(url).then((response) => {
        if (response.data && response.data[KEEPER_CONTRACT]) {
          this.currentPrice = response.data[KEEPER_CONTRACT].usd;
        }
      });
    },
  },
};
</script>
