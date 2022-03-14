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
} from '@/shared/job.models';
import { getWeb3Tools, ONE_ETH } from '@/shared/web3.helper';
import { JobsState } from './jobs.state';
import { toHex } from '@/shared/utils';

export const actions: ActionTree<JobsState, AppState> = {
  async initiateJobsList({ commit, dispatch }) {
    commit('INITIATE_JOBS_LIST');
    try {
      const addresses: string[] = await dispatch('getJobsAddresses');
      await dispatch('getJobsBasicData', { addresses });
      await dispatch('getJobRegistry');
      commit('INITIATE_JOBS_LIST_SUCCESS');
    } catch (error) {
      commit('INITIATE_JOBS_LIST_FAILURE', { error });
    }
  },

  async getJobsAddresses({ commit, dispatch }) {
    commit('GET_JOBS_ADDRESSES');
    try {
      const { web3helper } = getWeb3Tools();
      const addresses = await web3helper.Keep3rV2Contract.methods.jobs().call();
      commit('GET_JOBS_ADDRESSES_SUCCESS', {
        addresses: addresses,
        jobsWithLiquidity: addresses,
      });
      return addresses;
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

  async selectJob({ commit, dispatch }, { jobAddress }: { jobAddress: string }) {
    commit('SELECT_JOB', { jobAddress });

    await dispatch('getJobData', { jobAddress });
    const isWalletConnected = true;
    if (isWalletConnected) {
      await dispatch('getUserJobData', { jobAddress });
    }
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

    if (amount.gt(userLiquidityData.balanceOf)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Unsufficient funds.' }, { root: true });
      return commit('SET_JOB_LIQUIDITY_FAILURE', { error: 'INSUFFICIENT FUNDS', jobAddress, liqAddress });
    }

    if (amount.gt(userLiquidityData.allowance)) {
      await dispatch('liquidities/approveLiquidity', { liqAddress }, { root: true });
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

      await keep3rV2Methods
        .addLiquidityToJob(jobAddress, liqAddress, toHex(amount))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('SET_JOB_LIQUIDITY_SUCCESS', { jobAddress, liqAddress });

      dispatch('getJobData', { jobAddress });
      dispatch('getUserJobData', { jobAddress });
      dispatch('getJobLiquidityData', { jobAddress });
      dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
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
    const jobAvailableLiq = state.jobsLiquiditiesDataMap[jobAddress][liqAddress].liquidityAmount

    if (amount.gt(jobAvailableLiq)) {
      return commit('REMOVE_JOB_LIQUIDITY_FAILURE', { error: 'INSUFFICIENT FOUNDS', jobAddress, liqAddress });
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

      await keep3rV2Methods
        .unbondLiquidityFromJob(jobAddress, liqAddress, toHex(amount))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('REMOVE_JOB_LIQUIDITY_SUCCESS', { jobAddress, liqAddress });
      dispatch('getJobData', { jobAddress });
      dispatch('getUserJobData', { jobAddress });
      dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      dispatch('liquidities/getUserLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      return true;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('REMOVE_JOB_LIQUIDITY_FAILURE', { error, jobAddress, liqAddress });
    }
  },

  async withdrawJobLiquidity(
    { commit, dispatch, state },
    { jobAddress, liqAddress }: { jobAddress: string; liqAddress: string; }
  ) {
    commit('REMOVE_JOB_LIQUIDITY', { jobAddress, liqAddress });
    try {
      const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

      await keep3rV2Methods
        .withdrawLiquidityFromJob(jobAddress, liqAddress, currentAccount)
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('REMOVE_JOB_LIQUIDITY_SUCCESS', { jobAddress, liqAddress });

      dispatch('getJobData', { jobAddress });
      dispatch('getUserJobData', { jobAddress });

      dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      dispatch('liquidities/getUserLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      return true;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('REMOVE_JOB_LIQUIDITY_FAILURE', { error, jobAddress, liqAddress });
    }
  },

  async addJob({ dispatch }, { jobAddress }: { jobAddress: string }) {
    const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

    await keep3rV2Methods
      .addJob(jobAddress)
      .send({ from: currentAccount })
      .on('transactionHash', function (hash: string) {
        dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
      });
  },

  searchJobs({ commit, state }, { query }: { query: string }) {
    commit('SET_JOB_QUERY', { query });
  },

  async getJobRegistry({ commit, state, dispatch }) {
    commit('GET_JOB_REGISTRY');
    try {
      const file = await fetch('https://raw.githubusercontent.com/keep3r-network/job-registry/main/v2.json');
      const registry = JSON.parse(await file.text());

      commit('GET_JOB_REGISTRY_SUCCESS', { registry });
    } catch (error: unknown) {
      dispatch('alerts/openAlert', { type: 'error', message: (error as Error).message ?? error }, { root: true });
      commit('GET_JOB_REGISTRY_FAILURE', { error });
    }
  },
};

async function getJobBasicData(jobAddress: string): Promise<JobBasicData> {
  try {
    const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

    const [credits, owner, lastWorked]: [EthersBN, string, EthersBN] = await Promise.all([
      keep3rV2Methods.totalJobCredits(jobAddress).call(),
      keep3rV2Methods.jobOwner(jobAddress).call(),
      keep3rV2Methods.workedAt(jobAddress).call(),
    ]);

    return {
      address: jobAddress,
      credits: credits.toString(),
      owner,
      lastWorked: lastWorked.toString(),
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

// function that populates job modal
async function getJobData(jobAddress: string, jobsWithLiquidity: string[]): Promise<JobData> {
  try {
    const { web3helper } = getWeb3Tools();
    const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

    const [rewardPeriod, credits, jobLiquidityCredits, jobPeriodCredits, owner, lastWorked]: [
      EthersBN,
      EthersBN,
      EthersBN,
      EthersBN,
      string,
      EthersBN,
    ] = await Promise.all([
      keep3rV2Methods.rewardPeriodTime().call(),
      keep3rV2Methods.totalJobCredits(jobAddress).call(),
      keep3rV2Methods.jobLiquidityCredits(jobAddress).call(),
      keep3rV2Methods.jobPeriodCredits(jobAddress).call(),
      keep3rV2Methods.jobOwner(jobAddress).call(),
      keep3rV2Methods.workedAt(jobAddress).call(),
    ]);
    const liquiditiesAddresses = await keep3rV2Methods.approvedLiquidities().call();

    return new JobData({
      address: jobAddress,
      rewardPeriod: rewardPeriod.toString(),
      credits: credits.toString(),
      jobLiquidityCredits: jobLiquidityCredits.toString(),
      jobPeriodCredits: jobPeriodCredits.toString(),
      lastWorked: lastWorked.toString(),
      owner,
      liquiditiesAddresses,
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

async function getJobLiquidityData(jobAddress: string, liqAddress: string): Promise<JobLiquidityData> {
  try {
    const { web3helper } = getWeb3Tools();
    const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

    const [liquidityAmount, pendingUnbonds, canWithdrawAfter] = await Promise.all(
      [keep3rV2Methods.liquidityAmount(jobAddress, liqAddress).call(),
      keep3rV2Methods.pendingUnbonds(jobAddress, liqAddress).call(),
      keep3rV2Methods.canWithdrawAfter(jobAddress, liqAddress).call()]
    );

    return {
      address: liqAddress,
      liquidityAmount: liquidityAmount,
      pendingUnbonds: pendingUnbonds,
      canWithdrawAfter: canWithdrawAfter,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

async function getUserJobData(jobAddress: string): Promise<UserJobData> {
  return new UserJobData({
    address: jobAddress,
    userCycle: '',
  });
}

async function getUserJobLiquidityData(jobAddress: string, liqAddress: string): Promise<UserJobLiquidityData> {
  return {
    address: liqAddress,
    userLiquidity: '',
    userLockedLiquidity: '',
  };
}
