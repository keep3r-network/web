<template>
  <div class="k-modal">
    <div class="modal-content">
      <h1>Network is not supported</h1>
      <div class="flex-row">
        <div class="flex-column">
          <p>The Keep3r Network currently does not support the active network, please select from the following options instead:</p>
          <ul class="network-options-container">
            <li
              v-for="(network, index) in selectNetworkList"
              v-bind:key="index"
              class="network-option tooltip"
              @click="handleNetworkInput(network)"
            >
              <div class="icons">
                <img class="select-icon" :src="selectNetworkOptions[index].icon" />
                <div class="tooltiptext item-text">
                  {{ network.name }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import BigNumber from 'bignumber.js';
import { humanizeAmount } from '@/shared/utils';

import Loading from '@/components/Loading';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input';

export default {
  name: 'ConnectWalletModal',
  computed: {
    ...mapGetters('wallet', [
      'selectNetworkOptions',
      'selectSelectedNetworkOption',
      'selectSelectedNetwork',
      'selectNetworkList',
    ]),
  },
  methods: {
    handleNetworkInput(network) {
      this.$store.dispatch('wallet/changeNetwork', network);
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-content {
  width: 576px;
}

.network-options-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.network-option {
  display: flex;
  align-items: center;
  padding: 15px;

  &:hover {
    cursor: pointer;
  }

  img {
    height: 40px;
  }
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 10px;
  white-space: nowrap;

  /* Position the tooltip */
  position: absolute;
  left: 50%;
  z-index: 1;
  transform: translate(-50%);
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}

p {
  line-height: 2.4rem;
}
</style>
