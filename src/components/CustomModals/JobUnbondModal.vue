<template>
  <div class="k-modal">
    <Loading v-if="loading" />

    <div class="modal-content" v-else>
      <div class="section section-header">
        <p class="no-margin-top size-medium">{{ selectSelectedJob.name }}</p>
        <h1 class="job-name ellipsis">{{ selectSelectedJob.address }}</h1>
      </div>
      <div class="section section-middle">
        <div class="flex-row">
          <div class="flex-column">
            <dl>
              <dt>Job Added</dt>
              <dd>{{ selectSelectedJob.jobAdded }}</dd>
              <dt>Liquidity Manager Balance</dt>
              <dd>{{ selectSelectedJob.liquidityManagerBalance }} {{ selectSelectedLiquidity.symbol }}</dd>
              <dt>Current Bonds <a underline @click="openJobBondModal">(bond)</a></dt>
              <dd>{{ selectSelectedJob.currentBonds }} {{ selectSelectedLiquidity.symbol }}</dd>
            </dl>
          </div>
          <div class="flex-column">
            <dl>
              <dt>Total Credits</dt>
              <dd>{{ selectSelectedJob.credits }}</dd>
              <dt>User Balance</dt>
              <dd>{{ selectSelectedJob.userBalance }} {{ selectSelectedLiquidity.symbol }}</dd>
              <dt>Refill Schedule (X credits in Y hours)</dt>

              <dd v-if="isRefillNA(selectSelectedJob.creditsRefillAt)">N/A</dd>
              <dd v-else>{{ selectSelectedJob.userBalance }} / {{ refillsIn(selectSelectedJob.creditsRefillAt) }}</dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="flex-row">
          <div class="flex-column">
            <p class="size-medium"><strong>1. Remove liquidity</strong></p>
            <p>
              As a first step, you have to call <i>setJobLiquidityAmount(address,address,uint)</i> and set liquidity
              amount either to 0 or value lower than your current supplied liquidity on the job. There is a delay period
              (2 refill cycles, about 34 days) after which you can call
              <i>removeIdleLiquidityFromJob(address,address,uint)</i>
              to move the freed-up liquidity back to liquidity manager. Reducing liquidity causes difference to remain
              locked for up to 34 days, e.g. <i>current_liquidity=10</i>, <i>new_liquidity=8</i>,
              <i>locked_liquidity=2 – locked_liquidity</i> cannot be used as <i>idle_liquidity</i> while increasing job
              liquidity will reduce your <i>idle_liquidity</i>.
            </p>
            <div>
              <div class="flex-row padding-small">
                <div class="flex-column flex-end">
                  <Dropdown
                    :options="getLiquidityOptions"
                    :selected="selectSelectedLiquidity"
                    @input="handleLiquidityInput"
                    class="select top-items"
                    size="double"
                  />
                </div>
                <div class="flex-column">
                  <Input
                    :class="{ error: false }"
                    placeholder="0.000000"
                    :maxValue="setLiquidityMaxValue"
                    @onInput="checkSetValue"
                  />
                </div>
              </div>

              <div class="flex-row padding-small">
                <div class="flex-column">
                  <Button
                    theme="fill"
                    size="small"
                    @onClick="jobLiquidityAction('set')"
                    :disabled="!getIsWalletConnected || selectCurrentJobLiqStatusMap.set.loading"
                  >
                    <Loading v-if="selectCurrentJobLiqStatusMap.set.loading" />
                    Set Liquidity
                  </Button>
                </div>
                <Button
                  theme="fill"
                  size="small"
                  @onClick="jobLiquidityAction('remove')"
                  :disabled="!getIsWalletConnected || selectCurrentJobLiqStatusMap.remove.loading"
                >
                  <Loading v-if="selectCurrentJobLiqStatusMap.remove.loading" />
                  Remove Liquidity
                </Button>
              </div>
            </div>
          </div>

          <div class="flex-column flex-content">
            <div fill>
              <p class="size-medium"><strong>2. Withdraw from liquidity manager</strong></p>
              <p>
                As a second step, you have to call <i>withdrawLiquidity(address,uint)</i> to move your idle liquidity
                from liquidity manager back to your wallet.
              </p>
              <p><strong>Note</strong>, 2.5% fee was initially charged to cover liquidity manager auto-provision.</p>
            </div>

            <div class="flex-row padding-small">
              <div class="flex-column flex-end">
                <Dropdown
                  :options="getLiquidityOptions"
                  :selected="selectSelectedLiquidity"
                  @input="handleLiquidityInput"
                  class="select top-items"
                  size="double"
                />
              </div>
              <div class="flex-column">
                <Input
                  :class="{ error: false }"
                  placeholder="0.000000"
                  :maxValue="setWithdrawMaxValue"
                  @onInput="checkWithdrawValue"
                />
              </div>
            </div>
            <Button
              theme="fill"
              size="small"
              @onClick="withdraw"
              :disabled="!getIsWalletConnected || selectCurrentLiqStatusMap.withdraw.loading"
            >
              <Loading v-if="selectCurrentLiqStatusMap.withdraw.loading" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>
      <div class="section last">
        <h4>Documentation</h4>
        <p class="more">
          <a href="https://github.com/keep3r-network/keep3r.network" target="_blank">Read more on github</a>
        </p>
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

import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input';
import Loading from '@/components/Loading';

export default {
  name: 'JobUnbondModal',
  components: { Button, Dropdown, Input, Loading },
  computed: {
    ...mapGetters('jobs', [
      'selectGetJobDataStatus',
      'selectGetUserJobDataStatus',
      'selectSelectedJob',
      'selectCurrentJobLiqStatusMap',
    ]),
    ...mapGetters('liquidities', ['selectLiquidities', 'selectSelectedLiquidity', 'selectCurrentLiqStatusMap']),
    ...mapGetters('wallet', ['getIsWalletConnected']),
    getLiquidityOptions() {
      return this.selectLiquidities.map((liquidity) => ({
        ...liquidity,
        value: liquidity.symbol,
        tag: liquidity.protocol,
        // TODO populate with real icons and remove `TODO DUMMY ICONS UNTIL REAL` from dropdown.vue
        // icons: ['url1', 'url2'],
      }));
    },
    setLiquidityMaxValue() {
      return humanizeAmount(
        BigNumber(this.selectSelectedJob.liquidityManagerBalanceRaw).plus(this.selectSelectedJob.currentBondsRaw),
        undefined,
        '18'
      );
    },
    loading() {
      return this.selectGetJobDataStatus.loading || this.selectGetUserJobDataStatus.loading;
    },
    setWithdrawMaxValue() {
      return humanizeAmount(this.selectSelectedJob.liquidityManagerBalanceRaw, undefined, '18');
    },
  },
  data() {
    return {
      inputWithdraw: '0',
      inputSet: '0',
    };
  },
  methods: {
    handleLiquidityInput(liquidity) {
      this.$store.commit('liquidities/SELECT_LIQUIDITY', { liquidityAddress: liquidity.address });
    },
    isRefillNA(timestamp) {
      return Number(timestamp) < Number(DateTime.now().toSeconds());
    },
    refillsIn(timestamp) {
      const t = Number(timestamp);
      return (t ? DateTime.fromSeconds(t).toRelative() : 'N/A') || 'N/A';
    },
    async withdraw() {
      const amount = new BigNumber(this.inputWithdraw);
      const address = this.selectSelectedLiquidity.address;
      const res = await this.$store.dispatch('liquidities/withdrawLiquidity', { liqAddress: address, amount });
      // TODO not working, reset input
      if (res) this.inputWithdraw = '0';
    },
    async jobLiquidityAction(action) {
      const amount = new BigNumber(this.inputSet);
      const obj = {
        jobAddress: this.selectSelectedJob.address,
        liqAddress: this.selectSelectedLiquidity.address,
        amount,
      };

      let res = undefined;
      if (action === 'set') {
        res = await this.$store.dispatch('jobs/setJobLiquidity', obj);
      }
      if (action === 'remove') {
        res = await this.$store.dispatch('jobs/removeJobLiquidity', obj);
      }

      // TODO not working, reset input
      if (res) this.inputSet = '0';
    },
    checkWithdrawValue(value) {
      // TODO needed checks
      this.inputWithdraw = value;
    },
    checkSetValue(value) {
      // TODO needed checks
      this.inputSet = value;
    },
    openJobBondModal() {
      this.$store.dispatch('modals/openModal', { modal: 'jobBond' });
    },
  },
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
