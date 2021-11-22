import BigNumber from 'bignumber.js';
import { BigNumber as EthersBN } from '@ethersproject/bignumber';
import { ActionTree } from 'vuex';
import { AppState } from '@/store';
import {
  JobBasicData,
  JobData,
  JobLiquidityData,
  JobLiquidityMap,
  JobsMap,
  UserJobData,
  UserJobLiquidityData,
  UserJobLiquidityMap,
  UserJobsLiquiditiesDataMap,
} from '@/shared/job.models';
import { getWeb3Tools, ONE_ETH } from '@/shared/web3.helper';
import { JobsState } from './jobs.state';

export const actions: ActionTree<JobsState, AppState> = {
  async initiateJobsList({ commit, dispatch }) {
    commit('INITIATE_JOBS_LIST');
    try {
      const addresses: string[] = await dispatch('getJobsAddresses');
      await dispatch('getJobsBasicData', { addresses });
      commit('INITIATE_JOBS_LIST_SUCCESS');
    } catch (error) {
      commit('INITIATE_JOBS_LIST_FAILURE', { error });
    }
  },

  async getJobsAddresses({ commit, dispatch }) {
    commit('GET_JOBS_ADDRESSES');
    try {
      const { web3helper } = getWeb3Tools();
      const addresses = await web3helper.keep3rContract.methods.getJobs().call();

      const isEnableResponses: boolean[] = await Promise.all(
        addresses.map((address: string) => web3helper.keep3rContract.methods.jobs(address).call())
      );
      const acceptedAddresses: string[] = [];

      isEnableResponses.forEach((isEnable: boolean, i) => {
        if (isEnable) acceptedAddresses.push(addresses[i]);
      });

      const jobsWithLiquidity = await web3helper.LiquidityManagerContract.methods.jobs().call();

      commit('GET_JOBS_ADDRESSES_SUCCESS', {
        addresses: acceptedAddresses,
        jobsWithLiquidity,
      });
      return acceptedAddresses;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_JOBS_ADDRESSES_FAILURE', { error });
    }
  },

  async getJobsBasicData({ commit, dispatch }, { addresses }: { addresses: string[] }) {
    commit('GET_JOBS_BASIC_DATA');
    try {
      const jobsBasicData: JobBasicData[] = await Promise.all(
        addresses.map((jobAddress) => getJobBasicData(jobAddress))
      );
      const jobsMap: JobsMap = {};
      jobsBasicData.forEach((data) => (jobsMap[data.address] = new JobData(data)));
      commit('GET_JOBS_BASIC_DATA_SUCCESS', { jobsMap });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_JOBS_BASIC_DATA_FAILURE', { error });
    }
  },

  async selectJob({ commit, dispatch, state, rootState }, { jobAddress }: { jobAddress: string }) {
    commit('SELECT_JOB', { jobAddress });

    await dispatch('getJobData', { jobAddress });
    const isWalletConnected = true; // TODO: Actually check if wallet is connected or not.
    if (isWalletConnected) {
      await dispatch('getUserJobData', { jobAddress });
    }

    // this force to never be able to persist the selected liquidity across all jobs because when opening a new job, this sets the selected liq to the first liq that the user has balance on.
    // const jobLiqAddresses = state.jobsMap[jobAddress].liquiditiesAddresses;
    // const { selectedLiquidityAddress } = rootState.liquidities;
    // if (!jobLiqAddresses.includes(selectedLiquidityAddress) && jobLiqAddresses[0]) {
    //   commit('liquidities/SELECT_LIQUIDITY', { liquidityAddress: jobLiqAddresses[0] }, { root: true });
    // }
  },

  async getJobData({ commit, state, dispatch }, { jobAddress }: { jobAddress: string }) {
    commit('GET_JOB_DATA');
    try {
      const jobData = await getJobData(jobAddress, state.jobsWithLiquidity);

      const liquiditiesDataMap: JobLiquidityMap = {};
      const liquiditiesData: JobLiquidityData[] = await Promise.all(
        jobData.liquiditiesAddresses.map((address) => getJobLiquidityData(jobAddress, address))
      );
      liquiditiesData.forEach((liq) => (liquiditiesDataMap[liq.address] = liq));

      commit('GET_JOB_DATA_SUCCESS', { jobData, liquiditiesDataMap });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_JOB_DATA_FAILURE', { error });
    }
  },

  async getUserJobData({ commit, state, dispatch, rootState }, { jobAddress }: { jobAddress: string }) {
    if (!rootState.wallet.connected) return;
    commit('GET_USER_JOB_DATA');
    try {
      const job = state.jobsMap[jobAddress];

      if (!job) {
        throw new Error(
          "Can't get user job data because common job data has not been loaded yet. Call getJobData first."
        );
      }

      const userJobData = await getUserJobData(jobAddress);

      const userLiquiditiesDataMap: UserJobLiquidityMap = {};
      const userLiquiditiesData: UserJobLiquidityData[] = await Promise.all(
        job.liquiditiesAddresses.map((address) => getUserJobLiquidityData(jobAddress, address))
      );
      userLiquiditiesData.forEach((liq) => (userLiquiditiesDataMap[liq.address] = liq));

      commit('GET_USER_JOB_DATA_SUCCESS', { userJob: userJobData, userLiquiditiesDataMap });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_USER_JOB_DATA_FAILURE', { error });
    }
  },

  async setJobLiquidity(
    { commit, dispatch, state, rootState },
    { jobAddress, liqAddress, amount }: { jobAddress: string; liqAddress: string; amount: BigNumber }
  ) {
    commit('SET_JOB_LIQUIDITY', { jobAddress, liqAddress });

    if (amount.lt(0)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Invalud amount.' }, { root: true });
      return commit('SET_JOB_LIQUIDITY_FAILURE', { error: 'INVALID AMOUNT', jobAddress, liqAddress });
    }

    amount = amount.multipliedBy(ONE_ETH);
    const userLiquidityData = rootState.liquidities.user.userLiquiditiesMap[liqAddress];

    if (amount.gt(userLiquidityData.userIdleAmount)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Unsufficient funds.' }, { root: true });
      return commit('SET_JOB_LIQUIDITY_FAILURE', { error: 'INSUFFICIENT FUNDS', jobAddress, liqAddress });
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;

      await liqManagerMethods
        .setJobLiquidityAmount(liqAddress, jobAddress, amount)
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('SET_JOB_LIQUIDITY_SUCCESS', { jobAddress, liqAddress });

      const jobHasLiquiditiesAlready = state.jobsWithLiquidity.find((address) => address === jobAddress);
      if (!jobHasLiquiditiesAlready) {
        commit('ADD_JOB_TO_JOBS_WITH_LIQUIDITIES', { jobAddress });
      }

      await dispatch('getJobData', { jobAddress });
      dispatch('getUserJobData', { jobAddress });

      // dispatch('getLiquiditiesDynamicData', { addresses: [liqAddress] }); // TODO use this instead.
      await dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      dispatch('liquidities/getUserLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      return true;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('SET_JOB_LIQUIDITY_FAILURE', { error, jobAddress, liqAddress });
    }
  },

  async removeJobLiquidity(
    { commit, dispatch, state },
    { jobAddress, liqAddress, amount }: { jobAddress: string; liqAddress: string; amount: BigNumber }
  ) {
    commit('REMOVE_JOB_LIQUIDITY', { jobAddress, liqAddress });
    if (amount.isNaN() || amount.lte(0)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Invalid amount.' }, { root: true });
      return commit('REMOVE_JOB_LIQUIDITY_FAILURE', { error: 'INVALID AMOUNT', jobAddress, liqAddress });
    }

    amount = amount.multipliedBy(ONE_ETH);
    // const userAvailableLiq = state.user.userJobsLiquiditiesDataMap[jobAddress][liqAddress].userLockedLiquidity;

    // if (amount.gt(userAvailableLiq)) {
    //   return commit('REMOVE_JOB_LIQUIDITY_FAILURE', { error: 'INSUFFICIENT FOUNDS', jobAddress, liqAddress });
    // }

    try {
      const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;

      await liqManagerMethods
        .removeIdleLiquidityFromJob(liqAddress, jobAddress, amount)
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('REMOVE_JOB_LIQUIDITY_SUCCESS', { jobAddress, liqAddress });
      dispatch('getJobData', { jobAddress });
      dispatch('getUserJobData', { jobAddress });

      // dispatch('getLiquiditiesDynamicData', { addresses: [liqAddress] }); // TODO use this instead.
      dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      dispatch('liquidities/getUserLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      return true;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('REMOVE_JOB_LIQUIDITY_FAILURE', { error, jobAddress, liqAddress });
    }
  },

  searchJobs({ commit, state }, { query }: { query: string }) {
    commit('SET_JOB_QUERY', { query });
  },
};

async function getJobBasicData(jobAddress: string): Promise<JobBasicData> {
  try {
    const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const { methods: keep3rMethods, _address: keep3rAddress } = web3helper.keep3rContract;
    const { methods: jobRegistryMethods } = web3helper.Keep3rV1JobRegistryContract;

    const [jobData, credits]: [any, EthersBN] = await Promise.all([
      jobRegistryMethods.jobData(jobAddress).call(),
      keep3rMethods.credits(jobAddress, keep3rAddress).call(),
    ]);

    const name: string = jobData['_name'];
    return {
      address: jobAddress,
      name,
      credits: credits.toString(),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getJobData(jobAddress: string, jobsWithLiquidity: string[]): Promise<JobData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools();
    const { methods: keep3rMethods, _address: keep3rAddress } = web3helper.keep3rContract;
    const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;
    const { methods: jobRegistryMethods } = web3helper.Keep3rV1JobRegistryContract;

    type Batch = [string, string, EthersBN, EthersBN, any];
    const [escrow1, escrow2, cycle, credits, jobData]: Batch = await Promise.all([
      liqManagerMethods.escrow1().call(),
      liqManagerMethods.escrow2().call(),
      liqManagerMethods.jobCycle(jobAddress).call(),
      keep3rMethods.credits(jobAddress, keep3rAddress).call(),
      jobRegistryMethods.jobData(jobAddress).call(),
    ]);

    const name: string = jobData['_name'];

    const { creditsRefillAt, jobEscrowStep1, jobEscrowStep2 } = await calculateCreditsRefill(
      liqManagerMethods,
      jobAddress,
      escrow1,
      escrow2
    );

    let liquiditiesAddresses: string[] = [];
    const jobHasLiquidities = jobsWithLiquidity.find((address) => address.toLowerCase() === jobAddress.toLowerCase());
    if (jobHasLiquidities) {
      liquiditiesAddresses = await liqManagerMethods.jobLiquidities(jobAddress).call();
    }

    return new JobData({
      name,
      address: jobAddress,
      credits: credits.toString(),
      cycle: cycle.toString(),
      creditsRefillAt,
      jobEscrowStep1,
      jobEscrowStep2,
      liquiditiesAddresses,
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getJobLiquidityData(jobAddress: string, liqAddress: string): Promise<JobLiquidityData> {
  try {
    const { web3helper } = getWeb3Tools();
    const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;
    const liquidityDesiredAmount: EthersBN = await liqManagerMethods
      .jobLiquidityDesiredAmount(jobAddress, liqAddress)
      .call();

    return {
      address: liqAddress,
      liquidityDesiredAmount: liquidityDesiredAmount.toString(),
    };
  } catch (error) {
    throw new Error(error);
  }
}

async function getUserJobData(jobAddress: string): Promise<UserJobData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools();
    const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;

    const userCycle: EthersBN = await liqManagerMethods.userJobCycle(currentAccount, jobAddress).call();

    return new UserJobData({
      address: jobAddress,
      userCycle: userCycle.toString(),
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getUserJobLiquidityData(jobAddress: string, liqAddress: string): Promise<UserJobLiquidityData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools();
    const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;
    let [userLiquidity, userLockedLiquidity]: any[] = await Promise.all([
      liqManagerMethods.userJobLiquidityAmount(currentAccount, jobAddress, liqAddress).call(),
      liqManagerMethods.userJobLiquidityLockedAmount(currentAccount, jobAddress, liqAddress).call(),
    ]);

    userLiquidity = new BigNumber(userLiquidity);
    userLockedLiquidity = new BigNumber(userLockedLiquidity).minus(userLiquidity);

    return {
      address: liqAddress,
      userLiquidity: userLiquidity.toString(),
      userLockedLiquidity: userLockedLiquidity.toString(),
    };
  } catch (error) {
    throw new Error(error);
  }
}

async function calculateCreditsRefill(liqManagerMethods: any, job: string, escrow1: string, escrow2: string) {
  try {
    enum steps {
      NotStarted,
      LiquidityAdded,
      CreditApplied,
      UnbondingLiquidity,
    }

    const [jobEscrowStep1, jobEscrowStep2] = await Promise.all([
      new BigNumber(await liqManagerMethods.jobEscrowStep(job, escrow1).call()),
      new BigNumber(await liqManagerMethods.jobEscrowStep(job, escrow2).call()),
    ]);

    const daySeconds = 60 * 60 * 24;
    let creditsRefillAt: BigNumber = new BigNumber(0);

    if (jobEscrowStep1.isEqualTo(steps.LiquidityAdded)) {
      const jobEscrowTimestamp: BigNumber = new BigNumber(
        await liqManagerMethods.jobEscrowTimestamp(job, escrow1).call()
      );
      creditsRefillAt = jobEscrowTimestamp.plus(3 * daySeconds);
    }
    if (jobEscrowStep2.isEqualTo(steps.LiquidityAdded)) {
      const jobEscrowTimestamp: BigNumber = new BigNumber(
        await liqManagerMethods.jobEscrowTimestamp(job, escrow2).call()
      );
      creditsRefillAt = jobEscrowTimestamp.plus(3 * daySeconds);
    }
    if (jobEscrowStep1.isEqualTo(steps.CreditApplied) || jobEscrowStep1.isEqualTo(steps.UnbondingLiquidity)) {
      const jobEscrowTimestamp: BigNumber = new BigNumber(
        await liqManagerMethods.jobEscrowTimestamp(job, escrow1).call()
      );
      creditsRefillAt = jobEscrowTimestamp.plus(17 * daySeconds);
    }
    return {
      creditsRefillAt,
      jobEscrowStep1,
      jobEscrowStep2,
    };
  } catch (error) {
    throw new Error(error);
  }
}
