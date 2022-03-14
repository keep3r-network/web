<template>
  <div class="k-modal">
    <Loading v-if="selectExternalKeeperDataLoading" />

    <div class="modal-content" v-else>
      <Button @onClick="$emit('close')" theme="close" />

      <h1>
        <template v-if="selectExternalKeeper.isKeeper">Keeper</template>
        <template v-else>Not a keeper</template>
      </h1>
      <p class="name ellipsis">{{ selectExternalKeeper.address }}</p>
      <div class="flex-row">
        <div class="flex-column">
          <dl>
            <dt>First Seen</dt>
            <dd>{{ firstSeenTimestamp }}</dd>
          </dl>
        </div>
        <div class="flex-column">
          <dl>
            <dt>Total Earnings</dt>
            <dd>{{ selectExternalKeeper.workCompleted }} KP3R</dd>
            <dt>Bonded</dt>
            <dd>{{ selectExternalKeeper.bonded }} KP3R</dd>
          </dl>
        </div>
      </div>

      <Dropdown
        v-if="selectExternalKeeper.isKeeper"
        :options="getKeeperTokenOptions"
        :selected="selectSelectedKeeperToken"
        @input="handleKeeperTokenInput"
        class="select top-items"
        size="single"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { DateTime } from 'luxon';

import Button from '@/components/Button';
import Loading from '@/components/Loading';
import Dropdown from '@/components/Dropdown';
import BigNumber from 'bignumber.js';

export default {
  name: 'ConnectWalletModal',
  components: { Button, Loading, Dropdown },
  data() {
    return {
      isKeeper: true,
      loading: false,
    };
  },
  computed: {
    ...mapGetters('keepers', [
      'selectExternalKeeperDataLoading',
      'selectExternalKeeper',
      'selectKeeperTokens',
      'selectSelectedKeeperToken',
      'selectIsGoverner',
      'selectGetGovernanceStatus',
      'selectSlashKeeperStatus',
    ]),
    firstSeenTimestamp() {
      return this.parseTimestap(this.selectExternalKeeper.firstSeen);
    },
    lastJobTimestamp() {
      return this.parseTimestap(this.selectExternalKeeper.lastJob);
    },
    getKeeperTokenOptions() {
      return this.selectKeeperTokens.map((keeperToken) => ({
        ...keeperToken,
        label: keeperToken.symbol,
      }));
    },
  },
  methods: {
    parseTimestap(timestamp) {
      const t = Number(timestamp);
      return t ? DateTime.fromSeconds(t).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A' || 'N/A';
    },
    handleKeeperTokenInput(selectedToken) {
      this.$store.commit('keepers/SELECT_KEEPER_TOKEN', { keeperTokenAddress: selectedToken.address });
      this.$store.dispatch('keepers/getExternalKeeperBondedAmount', {
        accountAddress: this.selectExternalKeeper.address,
        tokenAddress: selectedToken.address,
      });
    },
    slash() {
      this.$store.dispatch('keepers/slashKeeper', {
        tokenAddress: this.selectSelectedKeeperToken.address,
        userAddress: this.selectExternalKeeper.address,
        bonded: new BigNumber(this.selectExternalKeeper.bondedRaw),
      });
    },
  },
};
</script>

<style scoped>
.modal-content {
  width: 550px;
}
</style>
