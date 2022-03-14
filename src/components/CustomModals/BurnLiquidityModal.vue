<template>
  <div class="k-modal">
    <Loading v-if="selectCurrentLiqAnyLoading" />

    <div class="modal-content" v-else>
      <h1>Burn</h1>
      <div class="flex-row">
        <div class="flex-column">
          <p>
            Burn your kLP to withdraw the underlying tokens.
          </p>
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column flex-end">
          <Input :placeholder="setMaxBurnValue" :maxValue="setMaxBurnValue" @onInput="handleAmountInput" />
        </div>
      </div>
      <div class="flex-row flex-small">
        <div class="flex-column">
          <Button
            theme="fill"
            size="small"
            v-bind:disabled="!getIsWalletConnected || selectCurrentLiqAnyLoading || hasInvalidValues"
            @onClick="handleBurnClick()"
          >
            <Loading v-if="selectCurrentLiqAnyLoading" />
            Burn
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
import Input from '@/components/Input';

export default {
  name: 'BurnLiquidityModal',
  components: { Loading, Button, Input },
  data() {
    return {
      amount: 0,
    };
  },
  computed: {
    ...mapGetters('liquidities', [
      'selectSelectedUserLiquidity',
      'selectCurrentLiqAnyLoading',
    ]),
    ...mapGetters('wallet', ['getIsWalletConnected']),
    hasInvalidValues() {
      const bnAmount = new BigNumber(this.amount).multipliedBy(1e18);

      return bnAmount.isZero() || bnAmount.gt(this.selectSelectedUserLiquidity.balanceOf);
    },
    setMaxBurnValue() {
      return humanizeAmount(BigNumber(this.selectSelectedUserLiquidity.balanceOf || 0), undefined, '18');
    },
  },
  methods: {
    handleAmountInput(amount) {
      this.amount = amount || '0';
    },
    handleBurnClick() {
      const amount = new BigNumber(this.amount).multipliedBy(1e18);

      this.$store.dispatch('liquidities/burnLiquidity', {
        liqAddress: this.selectSelectedUserLiquidity.address,
        amount,
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
