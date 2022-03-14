<template>
  <div class="k-modal">
    <div class="modal-content">
      <div class="section section-header">
        <h1 class="job-name ellipsis">Register a Job</h1>
      </div>
      <div class="section section-text">
        <p>
          Adding a job to the network is permissionless, the address is the only thing needed. The sender of the "Add Job" transaction will be the owner of the job.
          <br><br>
          In order to have the job in the public registry a Pull Request must be submitted to the <a href="https://github.com/keep3r-network/job-registry" target="_blank">Job Registry Repository</a> following the requirements described there.
        </p>
        <div class="flex-row">
          <div class="flex-column flex-content">
            <div class="flex-row flex-small">
              <div class="flex-column">
                <label>Job Contract Address</label>
                <Input
                  :class="{ error: false }"
                  placeholder="0x0000000000000000000000000000000000000000"
                  @onInput="handleAddressInput"
                />
              </div>
            </div>
            <div class="flex-row">
              <div class="flex-column">
                <Button theme="fill" size="small" @onClick="addJob" :disabled="!getIsWalletConnected"> Add Job </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="section last">
        <h4>Documentation</h4>
        <p class="more">
          <a href="https://github.com/keep3r-network/keep3r-network-v2" target="_blank">Read more on github</a>
        </p>
      </div>
      <Button @onClick="$emit('close')" theme="close" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';

import Button from '@/components/Button';
import Input from '@/components/Input';

export default {
  name: 'AddJobModal',
  components: { Button, Input },
  computed: {
    ...mapGetters('wallet', ['getIsWalletConnected']),
  },
  data() {
    return {
      inputSet: '0',
    };
  },
  methods: {
    async addJob() {
      const jobAddress = this.inputSet;
      await this.$store.dispatch('jobs/addJob', {
        jobAddress,
      });
    },
    handleAddressInput(address) {
      this.inputSet = address;
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
.k-modal .flex-row .flex-column:first-child {
  padding-right: 0;
}
.k-modal .flex-row.flex-small .flex-column:first-child {
  padding-right: 0;
}
.modal-content {
  width: 576px;
}
</style>
