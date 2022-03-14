<template>
  <div class="k-modal">
    <Loading v-if="loading" />

    <div class="modal-content" v-else>
      <h1>Unbond</h1>
      <div class="flex-row">
        <div class="flex-column">
          <p>
            If your job isn't necessary anymore, you are able to unbond your kLPs from it and withdraw the underlying tokens after the unbonding period has passed (14 days)

          </p>
          <p>Keep in mind that a minimum required amount of underlying tokens (3 KP3Rs) is needed for the job to operate on each liquidity. If willing to leave less than the minimum, you must unbond all.</p>
        </div>
        <div class="flex-column">
          <dl>
            <dt>Bonded</dt>
            <dd>{{ selectSelectedJob.liquidityAmount }} {{ this.selectSelectedLiquidity.symbol }}</dd>
            <dt>Pending Unbond ({{ pendingUnbondTimestamp }})</dt>
            <dd>{{ selectSelectedJob.pendingUnbonds }} {{ this.selectSelectedLiquidity.symbol }}</dd>
          </dl>
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column">
          <label>Unbond</label>
          <Dropdown
            :options="getLiquidityOptions"
            :selected="selectSelectedLiquidity"
            @input="handleLiquidityInput"
            class="select top-items"
            size="single"
          />
        </div>
        <div class="flex-column flex-end">
          <Input :placeholder="setUnbondMaxValue" :maxValue="setUnbondMaxValue" @onInput="handleAmountInput" />
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column">
          <Button
            theme="fill"
            size="small"
            v-bind:disabled="!getIsWalletConnected || !formIsValid || selectGetJobLiquidityDataStatus.loading"
            @onClick="handleUnbondClick"
          >
            <Loading v-if="loading" />
            Unbond
          </Button>
        </div>
        <div class="flex-column">
          <Button
            :disabled="!getIsWalletConnected || isWithdrawDisabled || selectGetJobLiquidityDataStatus.loading"
            theme="fill"
            size="small"
            @onClick="handleWithdrawClick"
          >
            <Loading v-if="selectGetJobLiquidityDataStatus.loading" />
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
    ...mapGetters('jobs', ['selectSelectedJob', 'selectGetJobLiquidityDataStatus']),
    ...mapGetters('liquidities', ['selectLiquidities', 'selectSelectedLiquidity', 'selectCurrentLiqStatusMap']),
    ...mapGetters('wallet', ['getIsWalletConnected']),
    isWithdrawDisabled() {
      const t = Number(this.selectSelectedJob.canWithdrawAfter);
      if (t <= 0 || t === null) {
        return true;
      }
      return t > DateTime.now().toSeconds();
    },
    getLiquidityOptions() {
      return this.selectLiquidities.map((liquidity) => ({
        ...liquidity,
        label: liquidity.symbol,
        tag: liquidity.protocol,
        icon: require('../../assets/token.png'),
      }));
    },
    pendingUnbondTimestamp() {
      const t = Number(this.selectSelectedJob.canWithdrawAfter);
      return t ? DateTime.fromSeconds(t).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A' || 'N/A';
    },
    formIsValid() {
      return this.amount > 0;
    },
    setUnbondMaxValue() {
      return humanizeAmount(BigNumber(this.selectSelectedJob.liquidityAmountRaw), undefined, '18');
    },
  },
  methods: {
    handleLiquidityInput(liquidity) {
      this.$store.commit('liquidities/SELECT_LIQUIDITY', { liquidityAddress: liquidity.address });
    },
    handleAmountInput(amount) {
      this.amount = amount || 0;
    },
    handleUnbondClick() {
      const amount = new BigNumber(this.amount);
      this.$store.dispatch('jobs/removeJobLiquidity', {
        jobAddress: this.selectSelectedJob.address,
        liqAddress: this.selectSelectedLiquidity.address,
        amount,
      });
    },
    handleWithdrawClick() {
      this.$store.dispatch('jobs/withdrawJobLiquidity', {
        jobAddress: this.selectSelectedJob.address,
        liqAddress: this.selectSelectedLiquidity.address,
      });
    },
  },
};
</script>

<style scoped>
.modal-content {
  width: 576px;
}
</style>
