import { MutationTree } from 'vuex';

import { initialLiquidityActionsStatusMap, LiquiditiesState, initialUserLiquidityStatusMap } from './liquidities.state';
import { Status } from '@/shared/status.model';
import { MAX_ETH } from '../../../shared/web3.helper';

export const mutations: MutationTree<LiquiditiesState> = {
  INITIATE_LIQUIDITIES: (state: LiquiditiesState) => {
    state.statusMap.initiateLiquidities = new Status({ loading: true });
  },
  INITIATE_LIQUIDITIES_SUCCESS: (state: LiquiditiesState) => {
    state.statusMap.initiateLiquidities = new Status({});
  },
  INITIATE_LIQUIDITIES_FAILURE: (state: LiquiditiesState, { error }) => {
    state.statusMap.initiateLiquidities = new Status({ error });
  },
  INSTANTIATE_LP_TOKENS: (state: LiquiditiesState) => {
    state.statusMap.instantiateLpTokens = new Status({ loading: true });
  },
  INSTANTIATE_LP_TOKENS_SUCCESS: (state: LiquiditiesState, { addresses }) => {
    const liquiditiesStatusMap: any = {};
    const userLiquiditiesStatusMap: any = {};
    addresses.forEach((address: string) => {
      liquiditiesStatusMap[address] = { ...initialLiquidityActionsStatusMap };
      userLiquiditiesStatusMap[address] = { ...initialUserLiquidityStatusMap };
    });
    state.statusMap.liquiditiesStatusMap = { ...state.statusMap.liquiditiesStatusMap, ...liquiditiesStatusMap };
    state.statusMap.user.userLiquiditiesStatusMap = {
      ...state.statusMap.user.userLiquiditiesStatusMap,
      ...userLiquiditiesStatusMap,
    };
    state.statusMap.instantiateLpTokens = new Status({});
  },
  INSTANTIATE_LP_TOKENS_FAILURE: (state: LiquiditiesState, { error }) => {
    state.statusMap.instantiateLpTokens = new Status({ error: error.message ?? error });
  },
  GET_LIQUIDITIES_ADDRESSES: (state: LiquiditiesState) => {
    state.statusMap.getLiquiditiesAddresses = new Status({ loading: true });
  },
  GET_LIQUIDITIES_ADDRESSES_SUCCESS: (state: LiquiditiesState, { addresses }) => {
    state.liquidityAddresses = addresses; // TODO find equial and only add new ones
    state.selectedLiquidityAddress = addresses[0];
    state.statusMap.getLiquiditiesAddresses = new Status({});
  },
  GET_LIQUIDITIES_ADDRESSES_FAILURE: (state: LiquiditiesState, { error }) => {
    state.statusMap.getLiquiditiesAddresses = new Status({ error: error.message ?? error });
  },
  GET_LIQUIDITIES_DATA: (state: LiquiditiesState, { addresses }: { addresses: string[] }) => {
    addresses.forEach((address) => {
      state.statusMap.liquiditiesStatusMap[address].get = new Status({ loading: true });
    });
    state.statusMap.getLiquiditiesData = new Status({ loading: true });
  },
  GET_LIQUIDITIES_DATA_SUCCESS: (state: LiquiditiesState, { liquiditiesMap, addresses }) => {
    state.liquiditiesMap = { ...state.liquiditiesMap, ...liquiditiesMap }; // TODO find equial and only add new ones
    addresses.forEach((address: string) => {
      state.statusMap.liquiditiesStatusMap[address].get = new Status({});
    });
    state.statusMap.getLiquiditiesData = new Status({});
  },
  GET_LIQUIDITIES_DATA_FAILURE: (state: LiquiditiesState, { error, addresses }) => {
    addresses.forEach((address: string) => {
      state.statusMap.liquiditiesStatusMap[address].get = new Status({});
    });
    state.statusMap.getLiquiditiesData = new Status({ error: error.message ?? error });
  },
  GET_USER_LIQUIDITIES_DATA: (state: LiquiditiesState, { addresses }: { addresses: string[] }) => {
    addresses.forEach((address) => {
      state.statusMap.user.userLiquiditiesStatusMap[address].get = new Status({ loading: true });
    });
    state.statusMap.user.getUserLiquiditiesData = new Status({ loading: true });
  },
  GET_USER_LIQUIDITIES_DATA_SUCCESS: (state: LiquiditiesState, { userLiquiditiesMap, addresses }) => {
    state.user.userLiquiditiesMap = { ...state.user.userLiquiditiesMap, ...userLiquiditiesMap }; // TODO find equial and only add new ones
    addresses.forEach((address: string) => {
      state.statusMap.user.userLiquiditiesStatusMap[address].get = new Status({});
    });
    state.statusMap.user.getUserLiquiditiesData = new Status({});
  },
  GET_USER_LIQUIDITIES_DATA_FAILURE: (state: LiquiditiesState, { error, addresses }) => {
    addresses.forEach((address: string) => {
      state.statusMap.user.userLiquiditiesStatusMap[address].get = new Status({});
    });
    state.statusMap.user.getUserLiquiditiesData = new Status({ error });
  },
  SELECT_LIQUIDITY: (state: LiquiditiesState, { liquidityAddress }: { liquidityAddress: string }) => {
    state.selectedLiquidityAddress = liquidityAddress;
  },
  APPROVE_LIQUIDITY: (state: LiquiditiesState, { liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].approve = new Status({ loading: true });
  },
  APPROVE_LIQUIDITY_SUCCESS: (state: LiquiditiesState, { liqAddress }) => {
    state.user.userLiquiditiesMap[liqAddress].allowance = MAX_ETH.toString();
    state.statusMap.liquiditiesStatusMap[liqAddress].approve = new Status({});
  },
  APPROVE_LIQUIDITY_FAILURE: (state: LiquiditiesState, { error, liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].approve = new Status({ error: error.message ?? error });
  },
  DEPOSIT_LIQUIDITY: (state: LiquiditiesState, { liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].deposit = new Status({ loading: true });
  },
  DEPOSIT_LIQUIDITY_SUCCESS: (state: LiquiditiesState, { liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].deposit = new Status({});
  },
  DEPOSIT_LIQUIDITY_FAILURE: (state: LiquiditiesState, { error, liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].deposit = new Status({ error: error.message ?? error });
  },
  WITHDRAW_LIQUIDITY: (state: LiquiditiesState, { liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].withdraw = new Status({ loading: true });
  },
  WITHDRAW_LIQUIDITY_SUCCESS: (state: LiquiditiesState, { liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].withdraw = new Status({});
  },
  WITHDRAW_LIQUIDITY_FAILURE: (state: LiquiditiesState, { error, liqAddress }) => {
    state.statusMap.liquiditiesStatusMap[liqAddress].withdraw = new Status({ error: error.message ?? error });
  },
};
