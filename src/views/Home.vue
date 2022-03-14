<template>
  <Loading v-if="getWalletStatus.loading" />
  <!-- <div v-else-if="!getIsWalletConnected && !getWalletStatus.loading && !getWalletStatus.error">
    Please connect your wallet.
  </div> -->
  <div v-else-if="getWalletStatus.error">
    Something went wrong, please refresh the page. ERROR: {{ getWalletStatus.error }}
  </div>

  <div v-else class="home page-content">
    <div class="left-side">
      <div class="row liquidities">
        <div class="column">
          <h1>Liquidities</h1>
          <p>
            Keep3r Liquidity Provider Tokens (kLP), are protocol-specific tokens minted to the users that provide
            liquidity to the network's liquidity pools. Job owners can bind kLP, which will periodically generate KP3R
            credits for their job, which can be used as a form of payment for the keepers that work their job.
          </p>
          <Dropdown
            :options="getLiquidityOptions"
            :selected="selectSelectedLiquidity"
            class="select top-items"
            size="single"
            @input="handleLiquidityInput"
          />

          <ul class="list-dots">
            <li>
              <span class="name">Available Balance</span>
              <span class="number">{{ availableBalance }}</span>
            </li>
          </ul>
          <div class="flex-column-cell">
            <div class="row">
              <div class="column"><Button size="small" @onClick="openModal('mintLiquidity')">Mint</Button></div>
              <div class="column"><Button size="small" @onClick="openModal('burnLiquidity')">Burn</Button></div>
            </div>
            <!-- 
              @TODO uncomment
              <div class="row">
              <div class="column bridge-button"><Button size="small" @onClick="openBridgeSite('klp')">Bridge</Button></div>
            </div> -->
          </div>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <h1>Jobs Available</h1>
          <p>
            Keep3r Network is a decentralized keeper network – it connects projects off-loading devops jobs and external
            teams ready to help. A <i>Job</i> is a term used to refer to a smart contract which is awaiting for an
            external entity to perform an action.
          </p>
        </div>
        <div class="column">
          <div class="flex-column">
            <p>
              This action should be performed in "good will" without any malicious result. For this reason, action is
              registered as a job, and keepers can then execute on its contract.
            </p>
            <Button size="small" @onClick="openModal('addJob')">Add Job +</Button>
          </div>
        </div>
      </div>
      <Search placeholder="Address/Name" label="Find job" @onSubmit="searchJob" :submitOnChange="true" />
      <ListJobs />
    </div>

    <div class="right-side">
      <div class="row">
        <div class="column">
          <img alt="Keepr3" src="../assets/profile2.jpg" class="img" />
        </div>
        <div class="column profile">
          <div class="flex-column">
            <div class="flex-column-cell">
              <h1>Profile</h1>
              <Dropdown
                :options="getKeeperTokenOptions"
                :selected="selectSelectedKeeperToken"
                @input="handleKeeperTokenInput"
                class="select top-items"
                size="single"
              />
              <ListDots />
            </div>
            <div class="flex-column-cell">
              <div class="row">
                <div class="column"><Button size="small" @onClick="openModal('bond')">Bond</Button></div>
                <div class="column"><Button size="small" @onClick="openModal('unbond')">Unbond</Button></div>
              </div>
              <!--
                @TODO uncomment
                <div class="row">
                <div class="column bridge-button"><Button size="small" @onClick="openBridgeSite('bond')">Bridge</Button></div>
              </div> -->
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <h2>how does it work</h2>
          <p>
            A Keeper is a term used to refer to an external person and/or team that executes a job. This can be as
            simplistic as sending a transaction, or as complex as requiring extensive off-chain logic.
          </p>
          <p>
            The scope of Keep3r network is not to manage the jobs themselves, but to allow contracts to register as jobs
            for keepers, and keepers to register themselves as available to perform jobs.
          </p>
          <p>
            It is up to the individual keepers to set up their devops infrastructure and create their own rules based on
            what job they deem profitable.
          </p>
          <p>
            Each time keepers perform such a job, they are rewarded in the systems native token KP3R. The maximum amount
            of KP3R to spend is gasUsed + premium (configurable by governance).
          </p>
        </div>
        <div class="column">
          <div class="flex-column">
            <div>
              <p>
                Some jobs might require keepers to have: <br />- minimum amount of bonded tokens<br />
                ⁃ minimum amount of fees earned <br />⁃minimum time presence in the system
              </p>
              <p>At the simplest level, they require a keeper to be registered in the system.</p>
              <h3>Becoming a Keeper</h3>
              <p>
                To join as a Keeper you call bond(uint) on the Keep3r contract. You do not need to have KP3R tokens to
                join as a Keeper, so you can join with bond(0).
              </p>

              <p>
                There is a 3-day bonding delay before you can become an active keeper. Once the 3-days delay has passed,
                you can call activate().
              </p>
            </div>
          </div>
        </div>
      </div>

      <Search class="search-keeper" placeholder="Address" label="Find keeper" validateAddress @onSubmit="findKeeper" />

      <Sponsors />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters } from 'vuex';
import { humanizeAmount } from '@/shared/utils';
import Button from '@/components/Button.vue';
import Dropdown from '@/components/Dropdown.vue';
import Search from '@/components/Search.vue';
import Sponsors from '@/components/Sponsors.vue';
import ListDots from '@/components/ListDots.vue';
import ListJobs from '@/components/ListJobs.vue';
import Loading from '@/components/Loading.vue';

export default {
  name: 'Home',
  components: {
    Button,
    Dropdown,
    Search,
    Sponsors,
    ListDots,
    ListJobs,
    Loading,
  },
  computed: {
    ...mapGetters('wallet', ['getWalletStatus', 'getIsWalletConnected', 'selectSelectedNetwork']),
    ...mapGetters('keepers', ['selectKeeperTokens', 'selectSelectedKeeperToken']),
    ...mapGetters('liquidities', ['selectLiquidities', 'selectSelectedLiquidity', 'selectSelectedUserLiquidity']),
    getKeeperTokenOptions() {
      return this.selectKeeperTokens.map((keeperToken) => ({
        ...keeperToken,
        label: keeperToken.symbol,
      }));
    },
    getLiquidityOptions() {
      return this.selectLiquidities.map((liquidity) => ({
        ...liquidity,
        label: liquidity.symbol,
        tag: liquidity.protocol,
      }));
    },
    availableBalance() {
      return `${humanizeAmount(this.selectSelectedUserLiquidity.balanceOf || 0)} ${
        this.selectSelectedLiquidity?.symbol || ''
      }`;
    },
  },
  mounted() {
    this.$store.dispatch('wallet/init');
  },
  methods: {
    handleKeeperTokenInput(keeperToken) {
      this.$store.commit('keepers/SELECT_KEEPER_TOKEN', { keeperTokenAddress: keeperToken.address });
      this.$store.dispatch('keepers/getUserKeeperTokensData', {
        tokenAddresses: [keeperToken.address],
      });
    },
    handleLiquidityInput(liquidity) {
      this.$store.commit('liquidities/SELECT_LIQUIDITY', { liquidityAddress: liquidity.address });
    },
    openModal(name) {
      this.$store.dispatch('modals/openModal', { name });
    },
    searchJob(query) {
      this.$store.dispatch('jobs/searchJobs', { query });
    },
    findKeeper(address) {
      if (address?.length) {
        this.$store.dispatch('modals/openModal', { name: 'keeper' });
        this.$store.commit('keepers/SET_CURRENT_EXTERNAL_ADDRESS', { address });
        this.$store.dispatch('keepers/getExternalKeeperData', { accountAddress: address });
      }
    },
    openBridgeSite(type) {
      const { symbol } = type === 'bond'
          ? this.selectSelectedKeeperToken
          : this.selectSelectedLiquidity;

      const url = `${process.env.VUE_APP_BRIDGE_URL}?token=${encodeURIComponent(symbol)}&origin=${this.selectSelectedNetwork}`;

      window.open(url, '_blank');
    },
  },
};
</script>

<style lang="scss">
.liquidities {
  margin-bottom: 3rem;

  & > .column {
    padding-right: 0 !important;
  }

  .custom-select {
    margin: 1.5rem 0;
  }
}

.search-keeper {
  margin-bottom: 3rem;
}

.bridge-button {
  padding-right: 0 !important;

  @media screen and (min-width: 560px) {
    margin-top: 1rem;
  }
}
</style>
