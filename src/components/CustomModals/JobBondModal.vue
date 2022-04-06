<template>
  <div class="k-modal">
    <Loading v-if="loading" />

    <div class="modal-content" v-else>
      <div class="section section-header">
        <p class="no-margin-top size-medium">{{ selectSelectedJob.address }}</p>
        <h1 class="job-name ellipsis">{{ selectSelectedJobRegistryData.name }}</h1>
      </div>
      <div class="section section-middle">
        <div class="flex-row">
          <div class="flex-column">
            <dl>
              <dt>Last Worked</dt>
              <dd>{{ selectSelectedJob.lastWorked }}</dd>
              <dt>Liquidity credits</dt>
              <dd>{{ selectSelectedJob.jobLiquidityCredits }} KP3R</dd>
              <dt>Refill Schedule</dt>
              <dd>{{ selectSelectedJob.jobPeriodCredits }} KP3R / {{ selectSelectedJob.rewardPeriod }}</dd>
              <dt>Repository</dt>
              <dd>
                <a :href="selectSelectedJobRegistryData.repository" target="_blank">
                  {{ selectSelectedJobRegistryData.repository }}
                </a>
              </dd>
            </dl>
          </div>
          <div class="flex-column">
            <dl>
              <dt>Total Credits</dt>
              <dd>{{ selectSelectedJob.credits }}</dd>
              <dt>
                Liquidities
                <span v-if="isJobOwner">
                  <a underline @click="openJobUnbondModal">(unbond)</a>
                </span>
              </dt>
              <dd>{{ selectSelectedJob.liquidityAmount }} {{ selectSelectedLiquidity.symbol }}</dd>
              <dt>Owner</dt>
              <dd>{{ selectSelectedJob.owner }}</dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="section section-text">
        <div class="flex-row">
          <div class="flex-column flex-content">
            <div>
              <p class="size-medium"><strong>Add liquidity to job</strong></p>
              <p>
                As a job owner, you will be in charge of maintaining the liquidity credits on your jobs. To do so, you
                will first need to mint governance approved kLPs and then bond them in your job.
              </p>
              <p>
                When liquidity is added to the job, your job will start mining KP3R credits that will be later used to
                reward the keepers that work on your job. The rate at which credits are minted is proportional to the
                underlying KP3Rs of the liquidity, and the relation between the length of the reward and the inflation
                periods. Keep in mind that a minimum amount of underlying tokens (<b>3 KP3Rs</b>) is needed for the
                liquidity to generate credits.
              </p>
              <p>
                <b>
                  Warning: If the job you are adding credits to is considered a malicious job by governance, your LP
                  tokens might get slashed. Read more about this in the
                  <a href="https://docs.keep3r.network/core/jobs" target="_blank">docs</a>.
                </b>
              </p>
            </div>
            <div>
              <div class="flex-row flex-small">
                <div class="flex-column flex-end">
                  <Dropdown
                    :options="getLiquidityOptions"
                    :selected="getSelectedLiquidity"
                    @input="handleLiquidityInput"
                    class="select top-items"
                  />
                </div>
                <div class="flex-column">
                  <Input
                    :class="{ error: false }"
                    :placeholder="setLiquidityMaxValue"
                    :maxValue="setLiquidityMaxValue"
                    @onInput="checkSetValue"
                  />
                </div>
              </div>
              <div class="flex-row">
                <div class="flex-column buttons">
                  <Button
                    theme="fill"
                    @onClick="setJobLiquidity"
                    :disabled="!getIsWalletConnected || selectCurrentJobLiqStatusMap.set.loading || hasZeroValue()"
                  >
                    <Loading v-if="selectCurrentJobLiqStatusMap.set.loading" />
                    Add Liquidity to Job
                  </Button>
                </div>
              </div>
            </div>
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
  name: 'JobBondModal',
  components: { Button, Dropdown, Input, Loading },
  computed: {
    ...mapGetters('keepers', [
      'selectCurrentKeeper',
      'selectKeeperTokens',
      'selectSelectedKeeperToken',
      'selectUserKeeperTokenData',
      'handleKeeperTokenInput',
    ]),
    ...mapGetters('jobs', [
      'selectGetJobDataStatus',
      'selectGetJobLiquidityDataStatus',
      'selectSelectedJob',
      'selectCurrentJobLiqStatusMap',
      'selectSelectedJobRegistryData',
    ]),
    ...mapGetters('liquidities', ['selectLiquidities', 'selectSelectedLiquidity', 'selectCurrentLiqStatusMap']),
    ...mapGetters('wallet', ['getIsWalletConnected']),
    getTokenOptions() {
      return this.selectLiquidities.map((liquidity) => ({
        ...liquidity,
        value: liquidity.otherToken,
      }));
    },
    getKeeperTokenOptions() {
      return this.selectKeeperTokens.map((keeperToken) => ({
        ...keeperToken,
        value: keeperToken.symbol,
      }));
    },
    getLiquidityOptions() {
      return this.selectLiquidities.map((liquidity) => ({
        ...liquidity,
        label: liquidity.symbol,
        tag: liquidity.protocol,
        icon: require('../../assets/token.png'),
      }));
    },
    getSelectedLiquidity() {
      return {
        ...this.selectSelectedLiquidity,
        icon: require('../../assets/token.png'),
      };
    },
    loading() {
      return this.selectGetJobDataStatus.loading || this.selectGetJobLiquidityDataStatus.loading;
    },
    setDepositMaxValue() {
      return humanizeAmount(this.selectUserKeeperTokenData.balanceOfRaw, undefined, '18');
    },
    setLiquidityMaxValue() {
      return humanizeAmount(BigNumber(this.selectSelectedJob.userBalanceRaw), undefined, '18');
    },
    isJobOwner() {
      if (!this.selectCurrentKeeper) {
        return false;
      }

      return this.selectSelectedJob.owner.toLowerCase() === this.selectCurrentKeeper.toLowerCase();
    },
  },
  data() {
    return {
      inputDeposit: '0',
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
    async deposit() {
      const amount = new BigNumber(this.inputDeposit);
      const address = this.selectSelectedLiquidity.address;
      const res = await this.$store.dispatch('liquidities/depositLiquidity', { liqAddress: address, amount });
      if (res) this.inputDeposit = '0';
    },
    async setJobLiquidity() {
      const amount = new BigNumber(this.inputSet);
      const res = await this.$store.dispatch('jobs/setJobLiquidity', {
        jobAddress: this.selectSelectedJob.address,
        liqAddress: this.selectSelectedLiquidity.address,
        amount,
      });
      if (res) this.inputSet = '0';
    },
    checkDepositValue(value) {
      this.inputDeposit = value;
    },
    checkSetValue(value) {
      this.inputSet = value;
    },
    openJobUnbondModal() {
      this.$store.dispatch('modals/openModal', { name: 'jobUnbond' });
    },
    hasZeroValue() {
      const isZero = (amount) => !amount || BigNumber(amount).isZero();
      return isZero(this.inputSet);
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
.section.section-text {
  padding: 1.5em 0 2rem 0;
}
.section.section-text p {
  margin: 1.5rem 0;
}
.no-margin-top.size-medium {
  margin-bottom: 0.7rem;
}
.k-modal .flex-row .flex-column p:first-child {
  margin-top: 0;
}
.buttons {
  padding-right: 0 !important;
}
</style>
