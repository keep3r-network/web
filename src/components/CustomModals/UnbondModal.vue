<template>
  <div class="k-modal">
    <Loading v-if="selectGetKeeperTokensData.loading" />

    <div class="modal-content" v-else>
      <h1>Unbond</h1>
      <div class="flex-row">
        <div class="flex-column">
          <p>
            If you no longer wish to be a keeper you have to call <i>unbond(address,uint)</i> and deactivate your
            account.
          </p>
          <p>
            There is a default 14-day unbonding period before you can withdraw any bonded assets. Once the 14-day period
            has passed, you will have to call <i>withdraw(address)</i> and claim any assets.
          </p>
        </div>
        <div class="flex-column">
          <dl>
            <dt>Balance</dt>
            <dd>{{ selectUserKeeperTokenData.balanceOf }} {{ selectSelectedKeeperToken.symbol }}</dd>
            <dt>Bonded</dt>
            <dd>{{ selectUserKeeperTokenData.bonded }} {{ selectSelectedKeeperToken.symbol }}</dd>
            <dt>Pending Unbond ({{ pendingUnbondTimestamp }})</dt>
            <dd>{{ selectUserKeeperTokenData.pendingUnbondAmount }} {{ selectSelectedKeeperToken.symbol }}</dd>
          </dl>
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column">
          <label>Unbond</label>
          <Dropdown
            :options="getKeeperTokenOptions"
            :selected="selectSelectedKeeperToken"
            @input="handleKeeperTokenInput"
            class="select top-items"
            size="single"
          />
        </div>
        <div class="flex-column flex-end">
          <Input placeholder="0.000000" :maxValue="setUnbondMaxValue" @onInput="handleAmountInput" />
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column">
          <Button
            theme="fill"
            size="small"
            v-bind:disabled="!getIsWalletConnected || !formIsValid || selectedKeeperTokenStatusMap.unbond.loading"
            @onClick="handleUnbondClick"
          >
            <Loading v-if="selectedKeeperTokenStatusMap.unbond.loading" />
            Unbond
          </Button>
        </div>
        <div class="flex-column">
          <Button
            :disabled="!getIsWalletConnected || isWithdrawDisabled || selectedKeeperTokenStatusMap.withdraw.loading"
            theme="fill"
            size="small"
            @onClick="handleWithdrawClick"
          >
            <Loading v-if="selectedKeeperTokenStatusMap.withdraw.loading" />
            Withdraw
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
  name: 'ConnectWalletModal',
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
    isWithdrawDisabled() {
      const t = Number(this.selectUserKeeperTokenData.pendingUnbondTimestamp);
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
    pendingUnbondTimestamp() {
      const t = Number(this.selectUserKeeperTokenData.pendingUnbondTimestamp);
      return t ? DateTime.fromSeconds(t).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A' || 'N/A';
    },
    formIsValid() {
      return this.amount > 0;
    },
    setUnbondMaxValue() {
      return humanizeAmount(BigNumber(this.selectUserKeeperTokenData.bondedRaw), undefined, '18');
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
    handleUnbondClick() {
      const amount = new BigNumber(this.amount);
      this.$store.dispatch('keepers/unbondKeeperToken', {
        tokenAddress: this.selectSelectedKeeperToken.address,
        amount,
      });
    },
    handleWithdrawClick() {
      this.$store.dispatch('keepers/withdrawUnbond', { tokenAddress: this.selectSelectedKeeperToken.address });
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
