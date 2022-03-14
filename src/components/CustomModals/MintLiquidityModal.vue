<template>
  <div class="k-modal">
    <Loading v-if="loading" />

    <div class="modal-content" v-else>
      <div class="section section-header">
        <p class="no-margin-top size-medium">{{ selectSelectedLiquidity.address }}</p>
        <h1 class="job-name ellipsis">{{ selectSelectedLiquidity.symbol }}: {{ getLiquidityBalance }}</h1>
      </div>
      <div class="section">
        <p class="size-medium"><strong>Provide liquidity</strong></p>
        <p>
          Provide liquidity to the UniswapV3 full range position to mint kLPs with the ERC20 tokens representative of
          the liquidity deposited in such pool (and redeemable for the underlying assets). Insert the maximum desired
          amount of each asset to provide, and the Pair Manager will calculate the input amount of each token.
          <u
            >Keep in mind that a minimum amount of underlying tokens (3 KP3Rs) is needed for the liquidity to generate
            credits</u
          >.
        </p>
        <div>
          <div class="flex-row padding-small">
            <div class="flex-column" v-for="(token, index) in selectSelectedLiquidity.tokens" :key="token.address">
              <h4 class="size-big">{{ token.symbol }}</h4>
              <Input
                :class="{ error: false }"
                v-bind:placeholder="humanizeDigits(token.balance, token.decimals)"
                :maxValue="humanizeDigits(token.balance, token.decimals)"
                @onInput="setTokenMintAmount(index === 0, token.decimals, ...arguments)"
              />
            </div>
          </div>
          <Button
            theme="fill"
            size="small"
            @onClick="mintLiquidity()"
            :disabled="!getIsWalletConnected || selectCurrentJobLiqStatusMap.set.loading || hasInvalidValues()"
          >
            <Loading v-if="selectCurrentJobLiqStatusMap.set.loading" />
            Approve and Provide
          </Button>
        </div>
      </div>
      <Button @onClick="$emit('close')" theme="close" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import { humanizeAmount } from '@/shared/utils';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Loading from '@/components/Loading';

export default {
  name: 'MintLiquidityModal',
  components: { Button, Input, Loading },
  computed: {
    ...mapGetters('jobs', [
      'selectGetJobDataStatus',
      'selectGetUserJobDataStatus',
      'selectCurrentJobLiqStatusMap',
    ]),
    ...mapGetters('liquidities', [
      'selectLiquidities',
      'selectSelectedLiquidity',
      'selectSelectedUserLiquidity',
      'selectSelectedLiquidityTokensData',
      'selectCurrentLiqStatusMap',
    ]),
    ...mapGetters('wallet', ['getIsWalletConnected']),
    getLiquidityOptions() {
      return this.selectLiquidities.map((liquidity) => ({
        ...liquidity,
        value: liquidity.symbol,
        tag: liquidity.protocol,
      }));
    },
    loading() {
      return this.selectGetJobDataStatus.loading || this.selectGetUserJobDataStatus.loading;
    },
    getLiquidityBalance() {
      return humanizeAmount(BigNumber(this.selectSelectedUserLiquidity.balanceOf || 0), undefined, '2');
    },
  },
  data() {
    return {
      kp3rAmount: undefined,
      otherTokenAmount: undefined,
    };
  },
  methods: {
    humanizeDigits(amount, digits) {
      return humanizeAmount(BigNumber(amount), String(digits), String(digits));
    },
    async mintLiquidity() {
      const liqAddress = this.selectSelectedLiquidity.address;
      const token0IsKp3r = this.selectSelectedLiquidity.token0IsKp3r;
      const kp3rAmount = new BigNumber(this.kp3rAmount);
      const otherTokenAmount = new BigNumber(this.otherTokenAmount);

      await this.$store.dispatch('liquidities/mintLiquidity', {
        liqAddress,
        token0IsKp3r,
        kp3rAmount,
        otherTokenAmount,
      });
    },
    setTokenMintAmount(isKP3R, decimals, value) {
      this[isKP3R ? 'kp3rAmount' : 'otherTokenAmount'] = value
        ? new BigNumber(value).multipliedBy(10 ** decimals).toString()
        : undefined;
    },
    hasInvalidValues() {
      // verify both tokens are defined and greater than 0
      const gtZero = (amount) => amount && BigNumber(amount).gt(0);
      if (!gtZero(this.kp3rAmount) || !gtZero(this.otherTokenAmount)) return true;

      // verify both tokens are less than the max
      if (
        BigNumber(this.kp3rAmount).gt(this.selectSelectedLiquidity.tokens[0].balance) ||
        BigNumber(this.otherTokenAmount).gt(this.selectSelectedLiquidity.tokens[1].balance)
      )
        return true;

      return false;
    },
  },
  mounted() {
    const liqAddress = this.selectSelectedLiquidity.address;
    this.$store.dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
  }
};
</script>

<style scoped>
.k-modal {
  padding: 3rem 4rem 4rem;
}
.modal-content {
  width: 1120px;
}
.k-modal .section.section-header {
  padding: 0.8rem 0 1rem 0;
}
.k-modal .flex-row .flex-column p:first-child {
  margin-top: 0;
}
</style>
