import { ActionTree } from 'vuex';
import { AppState } from '@/store';
import { getWeb3Tools, MAX_ETH, ONE_ETH } from '@/shared/web3.helper';
import { BigNumber as EthersBN } from '@ethersproject/bignumber';
import * as LP_TOKEN_DATA from '@/assets/contracts/UniV3PairManager.json';
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
        dispatch('getUserLiquiditiesData', { addresses }),
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
      const addresses = await web3helper.Keep3rV2Contract.methods.approvedLiquidities().call();

      commit('GET_LIQUIDITIES_ADDRESSES_SUCCESS', {
        addresses: addresses,
      });
      return addresses;
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

  async getLiquiditiesData({ commit, dispatch, rootState }, { addresses }) {
    commit('GET_LIQUIDITIES_DATA', { addresses });
    try {
      const lpTokensData: LiquidityData[] = await Promise.all(
        addresses.map((address: string) => getLiquidityData(address, rootState.wallet.connected))
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

  async mintLiquidity(
    { commit, dispatch, state, rootGetters },
    { liqAddress, token0IsKp3r, kp3rAmount, otherTokenAmount } :
    { liqAddress: string, token0IsKp3r: boolean, kp3rAmount: BigNumber, otherTokenAmount: BigNumber }
  ) {
    commit('MINT_LIQUIDITY', { liqAddress });
    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const lpTokenContract = web3helper.contractsMap[liqAddress];

      const token0Amount = new BigNumber(token0IsKp3r ? kp3rAmount : otherTokenAmount);
      const token1Amount = new BigNumber(token0IsKp3r ? otherTokenAmount : kp3rAmount);

      const kp3rAllowance = new BigNumber(state.liquiditiesMap[liqAddress].tokens[0].allowance);
      const otherTokenAllowance = new BigNumber(state.liquiditiesMap[liqAddress].tokens[1].allowance);

      if (kp3rAmount.gt(kp3rAllowance)) {
        const kp3rContract = web3helper.contractsMap[state.liquiditiesMap[liqAddress].tokens[0].address];
        await kp3rContract.methods
        .approve(liqAddress, toHex(MAX_ETH))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });
      }
      
      if (otherTokenAmount.gt(otherTokenAllowance)) {
        const otherTokenContract = web3helper.contractsMap[state.liquiditiesMap[liqAddress].tokens[1].address];
        await otherTokenContract.methods
          .approve(liqAddress, toHex(MAX_ETH))
          .send({ from: currentAccount })
          .on('transactionHash', function (hash: string) {
            dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
          });
      }

      await lpTokenContract.methods
        .mint(toHex(token0Amount), toHex(token1Amount), toHex(0), toHex(0), currentAccount)
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      commit('MINT_LIQUIDITY_SUCCESS', { liqAddress });

      await dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      await dispatch('liquidities/getUserLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      await dispatch('keepers/getUserKeeperTokensData', {
        tokenAddresses: [rootGetters['keepers/selectSelectedKeeperToken'].address],
      }, { root: true });
      await dispatch('modals/closeModal', {}, { root: true });

    } catch (error) {
      commit('MINT_LIQUIDITY_FAILURE', { error, liqAddress });
    }
  },

  async burnLiquidity(
    { commit, dispatch, rootGetters },
    { liqAddress, amount } : { liqAddress: string, amount: BigNumber }
  ) {
    commit('BURN_LIQUIDITY', { liqAddress });
    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const lpTokenContract = web3helper.contractsMap[liqAddress];

      await lpTokenContract.methods
      .burn(amount, 0, 0, currentAccount)
      .send({ from: currentAccount })
      .on('transactionHash', function () {
        dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
      });

      commit('BURN_LIQUIDITY_SUCCESS', { liqAddress });

      await dispatch('liquidities/getLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      await dispatch('liquidities/getUserLiquiditiesData', { addresses: [liqAddress] }, { root: true });
      await dispatch('keepers/getUserKeeperTokensData', {
        tokenAddresses: [rootGetters['keepers/selectSelectedKeeperToken'].address],
      }, { root: true });
      await dispatch('modals/closeModal', {}, { root: true });

    } catch (error) {
      commit('BURN_LIQUIDITY_FAILURE', { error, liqAddress });
    }
  },

  async approveLiquidity({ commit, dispatch }, { liqAddress }) {
    commit('APPROVE_LIQUIDITY', { liqAddress });
    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const lpTokenContract = web3helper.contractsMap[liqAddress];
      const keep3rV2Address = web3helper.Keep3rV2Contract._address;

      await lpTokenContract.methods
        .approve(keep3rV2Address, toHex(MAX_ETH))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });
      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('APPROVE_LIQUIDITY_SUCCESS', { liqAddress });
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('APPROVE_LIQUIDITY_FAILURE', { error, liqAddress });
      throw new Error((error as Error).message);
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
      const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

      if (amount.gt(state.user.userLiquiditiesMap[liqAddress].allowance)) {
        await dispatch('approveLiquidity', { liqAddress });
      }

      await keep3rV2Methods
        .depositLiquidity(liqAddress, toHex(amount))
        .send({ from: currentAccount })
        .on('transactionHash', function (hash: string) {
          dispatch('alerts/openAlert', { message: 'Transaction submited' }, { root: true });
        });

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('DEPOSIT_LIQUIDITY_SUCCESS', { liqAddress });
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

    try {
      const { web3helper, currentAccount } = getWeb3Tools();
      const { methods: keep3rV2Methods } = web3helper.Keep3rV2Contract;

      dispatch('alerts/openAlert', { type: 'success', message: 'Transaction confirmed' }, { root: true });
      commit('WITHDRAW_LIQUIDITY_SUCCESS', { liqAddress });
      dispatch('getLiquiditiesData', { addresses: [liqAddress] });
      dispatch('getUserLiquiditiesData', { addresses: [liqAddress] });
      return true;
    } catch (error) {
      dispatch('alerts/openAlert', { type: 'error', message: 'Transaction rejected' }, { root: true });
      commit('WITHDRAW_LIQUIDITY_FAILURE', { error, liqAddress });
    }
  },
};

async function getLiquidityData(liquidityAddress: string, walletConnected: boolean): Promise<LiquidityData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const lpTokenContract = web3helper.contractsMap[liquidityAddress];

    const [lpSymbol, token0, token1, totalSupply]: [string, string, string, EthersBN] = await Promise.all([
      lpTokenContract.methods.symbol().call(),
      lpTokenContract.methods.token0().call(),
      lpTokenContract.methods.token1().call(),
      lpTokenContract.methods.totalSupply().call(),
    ]);

    const KEEPER_CONTRACT = web3helper.Keep3rContract._address;
    const token0IsKp3r = token0.toLowerCase() === KEEPER_CONTRACT.toLowerCase();
    const otherToken = token0IsKp3r ? token1 : token0;
    await web3helper.addNewContracts([otherToken], ERC20.abi);
    const otherTokenSymbol = await web3helper.contractsMap[otherToken].methods.symbol().call();
    const symbol = lpSymbol;

    const [kp3rBalance, kp3rAllowance, otherTokenBalance, otherTokenAllowance, otherTokenDecimals]: [
      EthersBN,
      EthersBN,
      EthersBN,
      EthersBN,
      string
    ] = walletConnected ? await Promise.all([
      web3helper.contractsMap[KEEPER_CONTRACT].methods.balanceOf(currentAccount).call(),
      web3helper.contractsMap[KEEPER_CONTRACT].methods.allowance(currentAccount, liquidityAddress).call(),
      web3helper.contractsMap[otherToken].methods.balanceOf(currentAccount).call(),
      web3helper.contractsMap[otherToken].methods.allowance(currentAccount, liquidityAddress).call(),
      web3helper.contractsMap[otherToken].methods.decimals().call(),
    ]) : [0, 0, 0, 0, 0];

    return {
      address: liquidityAddress,
      tokens: [
        {
          address: KEEPER_CONTRACT,
          symbol: 'KP3R',
          decimals: 18,
          balance: kp3rBalance.toString(),
          allowance: kp3rAllowance.toString(),
        },
        {
          address: otherToken,
          symbol: otherTokenSymbol,
          decimals: Number(otherTokenDecimals),
          balance: otherTokenBalance.toString(),
          allowance: otherTokenAllowance.toString(),
        },
      ],
      symbol,
      token0IsKp3r,
      protocol: 'kLP',
      totalSupply: totalSupply.toString(),
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

async function getUserLiquidityData(liquidityAddress: string): Promise<UserLiquidityData> {
  try {
    const { web3helper, currentAccount } = getWeb3Tools(); // inside is the check of web3. If !web3 then throw Error.
    const lpTokenContract = web3helper.contractsMap[liquidityAddress];
    const keep3rV2Address = web3helper.Keep3rV2Contract._address;

    const [balanceOf, allowance]: EthersBN[] = await Promise.all([
      lpTokenContract.methods.balanceOf(currentAccount).call(),
      lpTokenContract.methods.allowance(currentAccount, keep3rV2Address).call(),
    ]);

    return {
      address: liquidityAddress,
      balanceOf: balanceOf.toString(),
      allowance: allowance.toString(),
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
