<template>
  <div class="k-modal">
    <Loading v-if="selectGetKeeperTokensData.loading" />

    <div class="modal-content" v-else>
      <h1>Bond</h1>
      <div class="flex-row">
        <div class="flex-column">
          <p>
            To become a keeper, you simply need to call <i>bond(address,uint)</i>. No funds are required to become a
            keeper, however, certain jobs might require a minimum amount of funds.
          </p>
          <p>
            There is a default 3-day bonding delay before you can become an active Keeper. Once the 3-day delay has
            passed, you will have to call <i>activate()</i> and your lastJob timestamp will be set to the current block
            timestamp.
          </p>
        </div>
        <div class="flex-column" v-if="selectUserKeeperTokenData && selectSelectedKeeperToken">
          <dl>
            <dt>Balance</dt>
            <dd>{{ selectUserKeeperTokenData.balanceOf }} {{ selectSelectedKeeperToken.symbol }}</dd>
            <dt>Pending ({{ pendingBondTimestamp }})</dt>
            <dd>{{ selectUserKeeperTokenData.pendingBondAmount }} {{ selectSelectedKeeperToken.symbol }}</dd>
            <dt>Bonded</dt>
            <dd>{{ selectUserKeeperTokenData.bonded }} {{ selectSelectedKeeperToken.symbol }}</dd>
          </dl>
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column">
          <label>Bond</label>
          <Dropdown
            :options="getKeeperTokenOptions"
            :selected="selectSelectedKeeperToken"
            @input="handleKeeperTokenInput"
            class="select top-items"
            size="single"
          />
        </div>
        <div class="flex-column flex-end">
          <Input placeholder="0.000000" :maxValue="setBondMaxValue" @onInput="handleAmountInput" />
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column">
          <Button
            theme="fill"
            size="small"
            v-bind:disabled="!getIsWalletConnected || !formIsValid || selectedKeeperTokenStatusMap.bond.loading"
            @onClick="handleBondClick"
          >
            <Loading v-if="selectedKeeperTokenStatusMap.bond.loading" />
            Bond
          </Button>
        </div>
        <div class="flex-column">
          <Button
            :disabled="!getIsWalletConnected || isActivateDisabled || selectedKeeperTokenStatusMap.activate.loading"
            theme="fill"
            size="small"
            @onClick="handleActivateClick"
          >
            <Loading v-if="selectedKeeperTokenStatusMap.activate.loading" />
            Activate
          </Button>
        </div>
      </div>
      <Button @onClick="$emit('close')" theme="close" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import BigNumber from 'bignumber.js';
import { humanizeAmount } from '@/shared/utils';

import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input';

export default {
  name: 'BondModal',
  components: { Loading, Button, Dropdown, Input },
  data() {
    return {
      amount: 0,
    };
  },
  computed: {
    ...mapGetters('keepers', [
      'selectKeeperTokens',
      'selectSelectedKeeperToken',
      'selectUserKeeperTokenData',
      'selectGetKeeperTokensData',
      'selectedKeeperTokenStatusMap',
    ]),
    ...mapGetters('wallet', ['getIsWalletConnected']),
    isActivateDisabled() {
      const t = Number(this.selectUserKeeperTokenData.pendingBondTimestamp);
      if (t <= 0 || t === null) {
        return true;
      }
      return t > DateTime.now().toSeconds();
    },
    getKeeperTokenOptions() {
      return this.selectKeeperTokens.map((keeperToken) => ({
        ...keeperToken,
        value: keeperToken.symbol,
      }));
    },
    pendingBondTimestamp() {
      const t = Number(this.selectUserKeeperTokenData.pendingBondTimestamp);
      return t ? DateTime.fromSeconds(t).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A' || 'N/A';
    },
    formIsValid() {
      return this.amount > 0;
    },
    setBondMaxValue() {
      return humanizeAmount(BigNumber(this.selectUserKeeperTokenData.balanceOfRaw), undefined, '18');
    },
  },
  methods: {
    handleKeeperTokenInput(keeperToken) {
      this.$store.commit('keepers/SELECT_KEEPER_TOKEN', { keeperTokenAddress: keeperToken.address });
      this.$store.dispatch('keepers/getUserKeeperTokensData', {
        tokenAddresses: [keeperToken.address],
      });
    },
    handleAmountInput(amount) {
      this.amount = parseFloat(amount) || 0;
    },
    handleBondClick() {
      const amount = new BigNumber(this.amount);
      this.$store.dispatch('keepers/bondKeeperToken', { tokenAddress: this.selectSelectedKeeperToken.address, amount });
    },
    handleActivateClick() {
      this.$store.dispatch('keepers/activateBond', { tokenAddress: this.selectSelectedKeeperToken.address });
    },
  },
  mounted() {
    this.$store.dispatch('keepers/getUserKeeperTokensData', {
      tokenAddresses: [this.selectSelectedKeeperToken.address],
    });
  },
};
</script>

<style scoped>
.modal-content {
  width: 576px;
}
</style>
