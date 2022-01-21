import { ActionTree } from 'vuex';
import { AppState } from '@/store';
import { getWeb3Tools, MAX_ETH, ONE_ETH } from '@/shared/web3.helper';
import { BigNumber as EthersBN } from '@ethersproject/bignumber';
import * as LP_TOKEN_DATA from '@/assets/contracts/LPToken.json';
import * as ERC20 from '@/assets/contracts/ERC20.json';
import { LiquidityData, UserLiquidityData } from '@/shared/liquidity.models';
import BigNumber from 'bignumber.js';
import { LiquiditiesState } from './liquidities.state';
import { toHex } from '@/shared/utils';

export const actions: ActionTree<LiquiditiesState, AppState> = {
  async initiateLiquidities({ commit, dispatch }) {
    commit('INITIATE_LIQUIDITIES');
    try {
      const addresses: string[] = await dispatch('getLiquiditiesAddresses');
      await dispatch('instantiateLpTokens', { addresses });
      await Promise.all([
        dispatch('getLiquiditiesData', { addresses }),
        dispatch('getUserLiquiditiesData', { addresses }), // TODO only if user is connected
      ]);
      commit('INITIATE_LIQUIDITIES_SUCCESS');
    } catch (error) {
      commit('INITIATE_LIQUIDITIES_FAILURE', { error });
    }
  },

  async getLiquiditiesAddresses({ commit, dispatch }) {
    commit('GET_LIQUIDITIES_ADDRESSES');
    try {
      const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      const addresses = await web3helper.keep3rContract.methods.pairs().call();
      const isEnableResponses: boolean[] = await Promise.all(
        addresses.map((address: string) => web3helper.keep3rContract.methods.liquidityAccepted(address).call())
      );
      const acceptedAddresses: string[] = [];

      isEnableResponses.forEach((isEnable: boolean, i) => {
        if (isEnable) acceptedAddresses.push(addresses[i]);
      });

      commit('GET_LIQUIDITIES_ADDRESSES_SUCCESS', {
        addresses: acceptedAddresses,
      });
      return acceptedAddresses;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_LIQUIDITIES_ADDRESSES_FAILURE', { error });
    }
  },

  async instantiateLpTokens({ commit, dispatch }, { addresses }) {
    commit('INSTANTIATE_LP_TOKENS');
    try {
      const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
      await web3helper.addNewContracts(addresses, LP_TOKEN_DATA.abi);
      commit('INSTANTIATE_LP_TOKENS_SUCCESS', { addresses });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('INSTANTIATE_LP_TOKENS_FAILURE', { error });
      throw new Error(error);
    }
  },

  async getLiquiditiesData({ commit, dispatch }, { addresses }) {
    commit('GET_LIQUIDITIES_DATA', { addresses });
    try {
      const lpTokensData: LiquidityData[] = await Promise.all(
        addresses.map((address: string) => getLiquidityData(address))
      );

      const liquiditiesMap: { [address: string]: LiquidityData } = {};
      lpTokensData.forEach((data: LiquidityData) => {
        liquiditiesMap[data.address] = data;
      });

      commit('GET_LIQUIDITIES_DATA_SUCCESS', { liquiditiesMap, addresses });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_LIQUIDITIES_DATA_FAILURE', { error, addresses });
    }
  },

  async getLiquiditiesDynamicData({ commit, dispatch }, { addresses }) {
    // TODO Nice To Have.
    // commit('GET_LIQUIDITIES_DYNAMIC_DATA', { addresses });
    // try {
    //   const lpTokensData: LiquidityData[] = await Promise.all(
    //     addresses.map((address: string) => getLiquidityData(address))
    //   );
    //   const liquiditiesMap: { [address: string]: LiquidityData } = {};
    //   lpTokensData.forEach((data: LiquidityData) => {
    //     liquiditiesMap[data.address] = data;
    //   });
    //   commit('GET_LIQUIDITIES_DYNAMIC_DATA_SUCCESS', { liquiditiesMap, addresses });
    // } catch (error) {
    //   commit('GET_LIQUIDITIES_DYNAMIC_DATA_FAILURE', { error, addresses });
    // }
  },

  async getUserLiquiditiesData({ commit, dispatch, rootState }, { addresses }) {
    if (!rootState.wallet.connected) return;
    commit('GET_USER_LIQUIDITIES_DATA', { addresses });
    try {
      const userLiquidityData: UserLiquidityData[] = await Promise.all(
        addresses.map((address: string) => getUserLiquidityData(address))
      );

      const userLiquiditiesMap: { [address: string]: UserLiquidityData } = {};
      userLiquidityData.forEach((data: UserLiquidityData) => {
        userLiquiditiesMap[data.address] = data;
      });

      commit('GET_USER_LIQUIDITIES_DATA_SUCCESS', { userLiquiditiesMap, addresses });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: error.message ?? error }, { root: true });
      commit('GET_USER_LIQUIDITIES_DATA_FAILURE', { error, addresses });
    }
  },

  async approveLiquidity({ commit, dispatch }, { liqAddress }) {
    commit('APPROVE_LIQUIDITY', { liqAddress });
    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const lpTokenContract = web3helper.contractsMap[liqAddress];
      const liqManagerAddress = web3helper.LiquidityManagerContract._address;

      await lpTokenContract.methods
        .approve(liqManagerAddress, toHex(MAX_ETH))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });
      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('APPROVE_LIQUIDITY_SUCCESS', { liqAddress });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('APPROVE_LIQUIDITY_FAILURE', { liqAddress, error });
      throw new Error(error.message);
    }
  },

  async depositLiquidity(
    { commit, dispatch, state },
    { liqAddress, amount }: { liqAddress: string; amount: BigNumber }
  ) {
    commit('DEPOSIT_LIQUIDITY', { liqAddress });
    if (amount.isNaN() || amount.lte(0)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Invalid amount.' }, { root: true });
      return commit('DEPOSIT_LIQUIDITY_FAILURE', { error: 'INVALID AMOUNT', liqAddress });
    }

    amount = amount.multipliedBy(ONE_ETH);
    const userBalance = state.user.userLiquiditiesMap[liqAddress].balanceOf;

    if (amount.gt(userBalance)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Insufficient funds' }, { root: true });
      return commit('DEPOSIT_LIQUIDITY_FAILURE', { error: 'INSUFFICIENT FUNDS', liqAddress });
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;

      if (amount.gt(state.user.userLiquiditiesMap[liqAddress].allowance)) {
        await dispatch('approveLiquidity', { liqAddress });
      }

      await liqManagerMethods
        .depositLiquidity(liqAddress, toHex(amount))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('DEPOSIT_LIQUIDITY_SUCCESS', { liqAddress });
      // dispatch('getLiquiditiesDynamicData', { addresses: [liqAddress] }); // TODO use this instead.
      dispatch('getLiquiditiesData', { addresses: [liqAddress] });
      dispatch('getUserLiquiditiesData', { addresses: [liqAddress] });
      return true;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('DEPOSIT_LIQUIDITY_FAILURE', { error, liqAddress });
    }
  },

  async withdrawLiquidity(
    { commit, dispatch, state },
    { liqAddress, amount }: { liqAddress: string; amount: BigNumber }
  ) {
    commit('WITHDRAW_LIQUIDITY', { liqAddress });
    if (amount.isNaN() || amount.lte(0)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Invalid amount.' }, { root: true });
      return commit('WITHDRAW_LIQUIDITY_FAILURE', { error: 'INVALID AMOUNT', liqAddress });
    }

    amount = amount.multipliedBy(ONE_ETH);

    if (amount.gt(state.user.userLiquiditiesMap[liqAddress].userIdleAmount)) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Insuficient funds.' }, { root: true });
      return commit('WITHDRAW_LIQUIDITY_FAILURE', { error: 'INSUFFICIENT FUNDS', liqAddress });
    }

    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;

      await liqManagerMethods
        .withdrawLiquidity(liqAddress, toHex(amount))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('WITHDRAW_LIQUIDITY_SUCCESS', { liqAddress });
      // dispatch('getLiquiditiesDynamicData', { addresses: [liqAddress] }); // TODO use this instead.
      dispatch('getLiquiditiesData', { addresses: [liqAddress] });
      dispatch('getUserLiquiditiesData', { addresses: [liqAddress] });
      return true;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('WITHDRAW_LIQUIDITY_FAILURE', { error, liqAddress });
    }
  },
};

async function getLiquidityData(liquidityAddress: string): Promise<LiquidityData> {
  try {
    const { web3helper } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const lpTokenContract = web3helper.contractsMap[liquidityAddress];

    type Reserves = { _reserve0: EthersBN; _reserve1: EthersBN };
    const [lpSymbol, token0, token1, reserves, totalSupply]: [
      string,
      string,
      string,
      Reserves,
      EthersBN
    ] = await Promise.all([
      lpTokenContract.methods.symbol().call(),
      lpTokenContract.methods.token0().call(),
      lpTokenContract.methods.token1().call(),
      lpTokenContract.methods.getReserves().call(),
      lpTokenContract.methods.totalSupply().call(),
    ]);

    const token0IsKp3r = token0.toLowerCase() === web3helper.keep3rContract._address.toLowerCase();
    const otherToken = token0IsKp3r ? token1 : token0;
    await web3helper.addNewContracts([otherToken], ERC20.abi);
    const otherTokenSymbol = await web3helper.contractsMap[otherToken].methods.symbol().call();
    const symbol = 'KP3R-' + otherTokenSymbol;

    const underlyingBalance = token0IsKp3r ? reserves._reserve0.toString() : reserves._reserve1.toString();

    return {
      address: liquidityAddress,
      underlyingBalance,
      symbol,
      protocol: lpSymbol,
      totalSupply: totalSupply.toString(),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getUserLiquidityData(liquidityAddress: string): Promise<UserLiquidityData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const lpTokenContract = web3helper.contractsMap[liquidityAddress];
    const liqManagerAddress = web3helper.LiquidityManagerContract._address;
    const { methods: liqManagerMethods } = web3helper.LiquidityManagerContract;

    const [balanceOf, allowance, userIdleAmount, userTotalAmount]: EthersBN[] = await Promise.all([
      lpTokenContract.methods.balanceOf(currentAccount).call(),
      lpTokenContract.methods.allowance(currentAccount, liqManagerAddress).call(),
      liqManagerMethods.userLiquidityIdleAmount(currentAccount, liquidityAddress).call(),
      liqManagerMethods.userLiquidityTotalAmount(currentAccount, liquidityAddress).call(),
    ]);

    return {
      address: liquidityAddress,
      balanceOf: balanceOf.toString(),
      allowance: allowance.toString(),
      userIdleAmount: userIdleAmount.toString(),
      userTotalAmount: userTotalAmount.toString(),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
