import BigNumber from 'bignumber.js';
import { BigNumber as EthersBN } from '@ethersproject/bignumber';
import { ActionTree } from 'vuex';
import { AppState } from '@/store';
import * as ERC20 from '@/assets/contracts/ERC20.json';
import {
  UserKeeperTokenData,
  KeeperTokenData,
  UserKeeperTokenBasicData,
  ExternalKeeperData,
} from '@/shared/keepers.models';
import { getWeb3Tools, isKp3r, MAX_ETH } from '@/shared/web3.helper';
import { KeepersState, KeeperTokensMap, UserKeeperTokenActionsMap, UserKeeperTokensMap } from './keepers.state';
import { toHex } from '@/shared/utils';

export const actions: ActionTree<KeepersState, AppState> = {
  async initiateKeepersData({ commit, dispatch, state }, { addresses }) {
    commit('INITIATE_KEEPER_DATA');
    try {
      const keerperTokenAddresses = state.keeperTokenAddresses;
      await dispatch('instantiateKeeperTokens', { addresses: keerperTokenAddresses });
      dispatch('getKeep3rGovernance');
      await dispatch('getKeeperTokensData', { tokenAddresses: keerperTokenAddresses });
      await dispatch('getUserKeeperTokensBasicData', { tokenAddresses: keerperTokenAddresses }); // TODO use this
      // await dispatch('getUserKeeperTokensData', { tokenAddresses: keerperTokenAddresses }); // dont use this when ready to prod
      commit('INITIATE_KEEPER_DATA_SUCCESS');
    } catch (error) {
      commit('INITIATE_KEEPER_DATA_FAILURE', { error });
      throw new Error(error);
    }
  },

  async instantiateKeeperTokens({ commit, dispatch }, { addresses }) {
    commit('INSTANTIATE_KEEPER_TOKENS');
    try {
      const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      await web3helper.addNewContracts(addresses, ERC20.abi); // TODO use kp3r abi?
      commit('INSTANTIATE_KEEPER_TOKENS_SUCCESS', { addresses });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('INSTANTIATE_KEEPER_TOKENS_FAILURE', { error });
      throw new Error(error);
    }
  },

  async getKeep3rGovernance({ commit, dispatch }) {
    commit('GET_KEEP3R_GOVERNANCE');
    try {
      const { web3helper } = getWeb3Tools();
      const keep3rContract = web3helper.keep3rContract;
      const governance = await keep3rContract.methods.governance().call();
      commit('GET_KEEP3R_GOVERNANCE_SUCCESS', { governance });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_KEEP3R_GOVERNANCE_FAILURE', { error });
    }
  },

  async getKeeperTokensData({ commit, dispatch }, { tokenAddresses }: { tokenAddresses: string[] }) {
    commit('GET_KEEPER_TOKENS_DATA');
    try {
      const keeperTokensData = await Promise.all(tokenAddresses.map((address) => getKeeperTokenData(address)));
      const keeperTokensMap: KeeperTokensMap = {};
      keeperTokensData.forEach((tokenData) => (keeperTokensMap[tokenData.address] = tokenData));

      commit('GET_KEEPER_TOKENS_DATA_SUCCESS', { keeperTokensMap });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_KEEPER_TOKENS_DATA_FAILURE', { error });
    }
  },

  async getUserKeeperTokensBasicData(
    { commit, dispatch, rootState },
    { tokenAddresses }: { tokenAddresses: string[] }
  ) {
    if (!rootState.wallet.connected) return;
    commit('GET_USER_KEEPER_TOKENS_BASIC_DATA');
    try {
      const userKeeperTokensData = await Promise.all(
        tokenAddresses.map((address) => getUserKeeperTokenBasicData(address))
      );
      const userKeeperTokensMap: UserKeeperTokensMap = {};
      userKeeperTokensData.forEach(
        (tokenData) => (userKeeperTokensMap[tokenData.address] = new UserKeeperTokenData(tokenData))
      );

      commit('GET_USER_KEEPER_TOKENS_BASIC_DATA_SUCCESS', { userKeeperTokensMap });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_USER_KEEPER_TOKENS_BASIC_DATA_FAILURE', { error });
    }
  },

  async getUserKeeperTokensData({ commit, dispatch, rootState }, { tokenAddresses }: { tokenAddresses: string[] }) {
    if (!rootState.wallet.connected) return;
    commit('GET_USER_KEEPER_TOKENS_DATA');
    try {
      const userKeeperTokensData = await Promise.all(tokenAddresses.map((address) => getUserKeeperTokenData(address)));
      const userKeeperTokensMap: UserKeeperTokensMap = {};
      userKeeperTokensData.forEach((tokenData) => (userKeeperTokensMap[tokenData.address] = tokenData));

      commit('GET_USER_KEEPER_TOKENS_DATA_SUCCESS', { userKeeperTokensMap });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_USER_KEEPER_TOKENS_DATA_FAILURE', { error });
    }
  },

  async getExternalKeeperData({ commit, dispatch, state }, { accountAddress }: { accountAddress: string }) {
    const externalAlreadyFetched = state.externalKeepersAddresses.find(
      (address) => address.toLowerCase() === accountAddress.toLowerCase()
    );
    if (externalAlreadyFetched) {
      return;
    }

    commit('GET_EXTERNAL_KEEPER_DATA');
    try {
      const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const keep3rContract = web3helper.keep3rContract;
      const tokenAddress = state.selectedKeeperToken;

      const isKeeper = await keep3rContract.methods.isKeeper(accountAddress).call();
      if (!isKeeper) {
        commit('GET_EXTERNAL_KEEPER_DATA_SUCCESS', {
          externalKeeperData: {
            address: accountAddress,
            isKeeper,
          },
        });
        return;
      }

      const [firstSeen, lastJob, worksCompleted]: EthersBN[] = await Promise.all([
        keep3rContract.methods.firstSeen(accountAddress).call(),
        keep3rContract.methods.lastJob(accountAddress).call(),
        keep3rContract.methods.workCompleted(accountAddress).call(),
      ]);

      const bonded: string = await dispatch('getExternalKeeperBondedAmount', { accountAddress, tokenAddress });
      const keeperTokensMap = state.externalKeepersMap[accountAddress]
        ? state.externalKeepersMap[accountAddress].keeperTokensMap
        : {};
      const externalKeeperData: ExternalKeeperData = {
        address: accountAddress,
        isKeeper,
        firstSeen: firstSeen.toString(),
        lastJob: lastJob.toString(),
        completedJobs: worksCompleted.toString(),
        keeperTokensMap: { ...keeperTokensMap, [tokenAddress]: { bonded } },
      };
      commit('GET_EXTERNAL_KEEPER_DATA_SUCCESS', { externalKeeperData });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_EXTERNAL_KEEPER_DATA_FAILURE', { error });
    }
  },

  async getExternalKeeperBondedAmount(
    { commit, dispatch },
    { accountAddress, tokenAddress }: { accountAddress: string; tokenAddress: string }
  ) {
    commit('GET_EXTERNAL_KEEPER_BONDED_AMOUNT');
    try {
      const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const keep3rContract = web3helper.keep3rContract;

      const bonded: EthersBN = await keep3rContract.methods.bonds(accountAddress, tokenAddress).call();

      commit('GET_EXTERNAL_KEEPER_BONDED_AMOUNT_SUCCESS', { accountAddress, tokenAddress, bonded: bonded.toString() });
      return bonded.toString();
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_EXTERNAL_KEEPER_BONDED_AMOUNT_FAILURE', { error });
    }
  },

  async approveKeeperToken({ commit, state, dispatch }, { tokenAddress }: { tokenAddress: string }) {
    commit('APPROVE_KEEPER_TOKEN', { tokenAddress });
    // TODO check allowance or amount to approve?
    const allowance = new BigNumber(state.user.userKeeperTokensMap[tokenAddress].allowance);
    if (isKp3r(tokenAddress)) {
      return commit('APPROVE_KEEPER_TOKEN_SUCCESS', { tokenAddress });
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const keep3rContract = web3helper.keep3rContract;
      const tokenContract = web3helper.contractsMap[tokenAddress];

      await tokenContract.methods
        .approve(keep3rContract._address, toHex(MAX_ETH))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('APPROVE_KEEPER_TOKEN_SUCCESS', { tokenAddress });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('APPROVE_KEEPER_TOKEN_FAILURE', { error, tokenAddress });
      throw new Error(error.message);
    }
  },

  async bondKeeperToken(
    { commit, dispatch, state },
    { tokenAddress, amount }: { tokenAddress: string; amount: BigNumber }
  ) {
    commit('BOND_KEEPER_TOKEN', { tokenAddress });
    const tokenData = state.keeperTokensMap[tokenAddress];
    const userKeeperTokensData = state.user.userKeeperTokensMap[tokenAddress];
    if (amount.isNaN() || amount.lt(0)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Invalid amount.' }, { root: true });
      return commit('BOND_KEEPER_TOKEN_FAILURE', { error: 'INVALID AMOUNT', tokenAddress });
    }

    const decimals = new BigNumber(10).pow(new BigNumber(tokenData.decimals));
    amount = amount.multipliedBy(decimals);

    if (amount.gt(userKeeperTokensData.balanceOf)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Insufficient funds.' }, { root: true });
      return commit('BOND_KEEPER_TOKEN_FAILURE', { error: 'INSUFFICIENT FUNDS', tokenAddress });
    }

    const allowance = new BigNumber(state.user.userKeeperTokensMap[tokenAddress].allowance);

    try {
      const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const keep3rContract = web3helper.keep3rContract;

      if (!isKp3r(tokenAddress) && allowance.lt(amount)) {
        await dispatch('approveKeeperToken', { tokenAddress });
      }

      await keep3rContract.methods
        .bond(tokenAddress, toHex(amount))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('BOND_KEEPER_TOKEN_SUCCESS', { tokenAddress });
      dispatch('getUserKeeperTokensData', { tokenAddresses: [tokenAddress] });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('BOND_KEEPER_TOKEN_FAILURE', { error, tokenAddress });
    }
  },

  async unbondKeeperToken(
    { commit, dispatch, state },
    { tokenAddress, amount }: { tokenAddress: string; amount: BigNumber }
  ) {
    commit('UNBOND_KEEPER_TOKEN', { tokenAddress });
    const tokenData = state.keeperTokensMap[tokenAddress];
    const userKeeperTokensData = state.user.userKeeperTokensMap[tokenAddress];
    if (amount.isNaN() || amount.lte(0)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Invalid amount.' }, { root: true });
      return commit('UNBOND_KEEPER_TOKEN_FAILURE', { error: 'INVALID AMOUNT', tokenAddress });
    }

    const decimals = new BigNumber(10).pow(new BigNumber(tokenData.decimals));
    amount = amount.multipliedBy(decimals);

    if (amount.gt(userKeeperTokensData.bonded)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Insifficient funds.' }, { root: true });
      return commit('UNBOND_KEEPER_TOKEN_FAILURE', { error: 'INSUFICIENT FUNDS', tokenAddress });
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const keep3rContract = web3helper.keep3rContract;

      await keep3rContract.methods
        .unbond(tokenAddress, toHex(amount))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('UNBOND_KEEPER_TOKEN_SUCCESS', { tokenAddress });
      dispatch('getUserKeeperTokensData', { tokenAddresses: [tokenAddress] });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('UNBOND_KEEPER_TOKEN_FAILURE', { error, tokenAddress });
    }
  },

  async activateBond({ commit, dispatch }, { tokenAddress }: { tokenAddress: string }) {
    commit('ACTIVATE_BOND', { tokenAddress });
    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const keep3rContract = web3helper.keep3rContract;
      // TODO NTH check date with momentjs. UserKeeperTokenData.pendingBondingTimestamp

      await keep3rContract.methods
        .activate(tokenAddress)
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('ACTIVATE_BOND_SUCCESS', { tokenAddress });
      dispatch('getUserKeeperTokensData', { tokenAddresses: [tokenAddress] });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('ACTIVATE_BOND_FAILURE', { error, tokenAddress });
      throw new Error(error.message);
    }
  },

  async withdrawUnbond({ commit, dispatch }, { tokenAddress }: { tokenAddress: string }) {
    commit('WITHDRAW_UNBOND', { tokenAddress });
    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const keep3rContract = web3helper.keep3rContract;
      // TODO NTH check date with momentjs. UserKeeperTokenData.pendingUnbondingTimestamp

      await keep3rContract.methods
        .withdraw(tokenAddress)
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('WITHDRAW_UNBOND_SUCCESS', { tokenAddress });
      dispatch('getUserKeeperTokensData', { tokenAddresses: [tokenAddress] });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('WITHDRAW_UNBOND_FAILURE', { error, tokenAddress });
      throw new Error(error.message);
    }
  },

  async slashKeeper(
    { commit, dispatch },
    { tokenAddress, userAddress, bonded }: { tokenAddress: string; userAddress: string; bonded: BigNumber }
  ) {
    commit('SLASH_KEEPER');

    if (bonded.lte(0)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Invalid amount.' }, { root: true });
      commit('SLASH_KEEPER_FAILURE', { error: 'INVALID AMOUNT' });
      return;
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const keep3rContract = web3helper.keep3rContract;

      await keep3rContract.methods
        .slash(tokenAddress, userAddress, toHex(bonded))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('SLASH_KEEPER_SUCCESS');
      // TODO what data should we update on success?
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('SLASH_KEEPER_FAILURE', { error });
      throw new Error(error.message);
    }
  },
};

// Functions
async function getKeeperTokenData(tokenAddress: string): Promise<KeeperTokenData> {
  try {
    const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const keeperTokenContract = web3helper.contractsMap[tokenAddress];

    const [symbol, decimals]: [string, EthersBN] = await Promise.all([
      keeperTokenContract.methods.symbol().call(),
      keeperTokenContract.methods.decimals().call(),
    ]);

    return {
      address: tokenAddress,
      symbol,
      decimals: decimals.toString(),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getUserKeeperTokenBasicData(tokenAddress: string): Promise<UserKeeperTokenBasicData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const keeperTokenContract = web3helper.contractsMap[tokenAddress];
    const keep3rContract = web3helper.keep3rContract;

    const [balanceOf, bonded, worksCompleted]: EthersBN[] = await Promise.all([
      keeperTokenContract.methods.balanceOf(currentAccount).call(),
      keep3rContract.methods.bonds(currentAccount, tokenAddress).call(),
      keep3rContract.methods.workCompleted(currentAccount).call(),
    ]);

    return {
      address: tokenAddress,
      balanceOf: balanceOf.toString(),
      balanceOfRaw: balanceOf.toString(),
      bonded: bonded.toString(),
      bondedRaw: bonded.toString(),
      completedJobs: worksCompleted.toString(),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getUserKeeperTokenData(tokenAddress: string): Promise<UserKeeperTokenData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const keep3rContract = web3helper.keep3rContract;
    const tokenContract = web3helper.contractsMap[tokenAddress];
    const keep3rAddress = keep3rContract._address;
    const [
      basicData,
      pendingBondAmount,
      pendingBondTimestamp,
      pendingUnbondAmount,
      pendingUnbondTimestamp,
      allowance,
    ]: [UserKeeperTokenBasicData, EthersBN, string, EthersBN, string, EthersBN] = await Promise.all([
      getUserKeeperTokenBasicData(tokenAddress),
      keep3rContract.methods.pendingbonds(currentAccount, tokenAddress).call(),
      keep3rContract.methods.bondings(currentAccount, tokenAddress).call(),
      keep3rContract.methods.partialUnbonding(currentAccount, tokenAddress).call(),
      keep3rContract.methods.unbondings(currentAccount, tokenAddress).call(),
      tokenContract.methods.allowance(currentAccount, keep3rAddress).call(),
    ]);

    return {
      ...basicData,
      address: tokenAddress,
      pendingBondAmount: pendingBondAmount.toString(),
      pendingBondTimestamp,
      pendingUnbondAmount: pendingUnbondAmount.toString(),
      pendingUnbondTimestamp,
      allowance: allowance.toString(),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
