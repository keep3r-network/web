import { MutationTree } from 'vuex';
import { ExternalKeeperData } from '../../../shared/keepers.models';
import { Status } from '../../../shared/status.model';
import { MAX_ETH } from '../../../shared/web3.helper';
import { union } from 'lodash';

import { KeepersState, initialKeeperTokenActionsMap, initialUserKeeperTokenActionsMap } from './keepers.state';

export const mutations: MutationTree<KeepersState> = {
  INITIATE_KEEPER_DATA: (state: KeepersState) => {
    state.statusMap.initiateKeepersData = new Status({ loading: true });
  },
  INITIATE_KEEPER_DATA_SUCCESS: (state: KeepersState) => {
    state.statusMap.initiateKeepersData = new Status({});
  },
  INITIATE_KEEPER_DATA_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.initiateKeepersData = new Status({ error: error.message ?? error });
  },
  INSTANTIATE_KEEPER_TOKENS: (state: KeepersState) => {
    state.statusMap.instantiateKeeperTokens = new Status({ loading: true });
  },
  INSTANTIATE_KEEPER_TOKENS_SUCCESS: (state: KeepersState, { addresses }: { addresses: string[] }) => {
    const newTokensStatusMap: any = {};
    const newUserTokensStatusMap: any = {};
    addresses.forEach((tokenAddress) => {
      newTokensStatusMap[tokenAddress] = { ...initialKeeperTokenActionsMap };
      newUserTokensStatusMap[tokenAddress] = { ...initialUserKeeperTokenActionsMap };
    });

    if (!state.selectedKeeperToken.length) {
      state.selectedKeeperToken = addresses[0];
    }

    state.statusMap.keeperTokensStatusMap = {
      ...state.statusMap.keeperTokensStatusMap,
      ...newTokensStatusMap,
    };
    state.statusMap.user.userKeeperTokensStatusMap = {
      ...state.statusMap.user.userKeeperTokensStatusMap,
      ...newUserTokensStatusMap,
    };
    state.statusMap.instantiateKeeperTokens = new Status({});
  },
  INSTANTIATE_KEEPER_TOKENS_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.instantiateKeeperTokens = new Status({ error: error.message ?? error });
  },
  GET_KEEP3R_GOVERNANCE: (state: KeepersState) => {
    state.statusMap.getKeep3rGovernance = new Status({ loading: true });
  },
  GET_KEEP3R_GOVERNANCE_SUCCESS: (state: KeepersState, { governance }) => {
    state.keep3rGovernanceAddress = governance;
    state.statusMap.getKeep3rGovernance = new Status({});
  },
  GET_KEEP3R_GOVERNANCE_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.getKeep3rGovernance = new Status({ error: error.message ?? error });
  },
  GET_KEEPER_TOKENS_DATA: (state: KeepersState) => {
    state.statusMap.getKeeperTokensData = new Status({ loading: true });
  },
  GET_KEEPER_TOKENS_DATA_SUCCESS: (state: KeepersState, { keeperTokensMap }) => {
    state.keeperTokensMap = { ...state.keeperTokensMap, ...keeperTokensMap };
    state.statusMap.getKeeperTokensData = new Status({});
  },
  GET_KEEPER_TOKENS_DATA_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.getKeeperTokensData = new Status({ error: error.message ?? error });
  },
  GET_USER_KEEPER_TOKENS_BASIC_DATA: (state: KeepersState) => {
    state.statusMap.user.getKeeperTokensBasicData = new Status({ loading: true });
  },
  GET_USER_KEEPER_TOKENS_BASIC_DATA_SUCCESS: (state: KeepersState, { userKeeperTokensMap }) => {
    state.user.userKeeperTokensMap = { ...state.user.userKeeperTokensMap, ...userKeeperTokensMap };
    state.statusMap.user.getKeeperTokensBasicData = new Status({});
  },
  GET_USER_KEEPER_TOKENS_BASIC_DATA_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.user.getKeeperTokensBasicData = new Status({ error: error.message ?? error });
  },
  GET_USER_KEEPER_TOKENS_DATA: (state: KeepersState) => {
    state.statusMap.user.getKeeperTokensData = new Status({ loading: true });
  },
  GET_USER_KEEPER_TOKENS_DATA_SUCCESS: (state: KeepersState, { userKeeperTokensMap }) => {
    state.user.userKeeperTokensMap = { ...state.user.userKeeperTokensMap, ...userKeeperTokensMap };
    state.statusMap.user.getKeeperTokensData = new Status({});
  },
  GET_USER_KEEPER_TOKENS_DATA_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.user.getKeeperTokensData = new Status({ error: error.message ?? error });
  },
  GET_EXTERNAL_KEEPER_BONDED_AMOUNT: (state: KeepersState) => {
    state.statusMap.getExternalTokenData = new Status({ loading: true });
  },
  GET_EXTERNAL_KEEPER_BONDED_AMOUNT_SUCCESS: (state: KeepersState, { accountAddress, tokenAddress, bonded }) => {
    state.statusMap.getExternalTokenData = new Status({});
    if (!state.externalKeepersMap[accountAddress]) {
      return;
    }
    const keeperTokensMap = state.externalKeepersMap[accountAddress].keeperTokensMap;
    state.externalKeepersMap[accountAddress].keeperTokensMap = { ...keeperTokensMap, [tokenAddress]: { bonded } };
  },
  GET_EXTERNAL_KEEPER_BONDED_AMOUNT_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.getExternalTokenData = new Status({ error: error.message ?? error });
  },
  GET_EXTERNAL_KEEPER_DATA: (state: KeepersState) => {
    state.statusMap.getExternalKeeperData = new Status({ loading: true });
  },
  GET_EXTERNAL_KEEPER_DATA_SUCCESS: (
    state: KeepersState,
    { externalKeeperData }: { externalKeeperData: ExternalKeeperData }
  ) => {
    state.externalKeepersMap = { ...state.externalKeepersMap, [externalKeeperData.address]: externalKeeperData };
    state.statusMap.getExternalKeeperData = new Status({});
    state.externalKeepersAddresses = union(state.externalKeepersAddresses, [externalKeeperData.address]);
  },
  GET_EXTERNAL_KEEPER_DATA_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.getExternalKeeperData = new Status({ error: error.message ?? error });
  },
  APPROVE_KEEPER_TOKEN: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].approve = new Status({ loading: true });
  },
  APPROVE_KEEPER_TOKEN_SUCCESS: (state: KeepersState, { tokenAddress }) => {
    state.user.userKeeperTokensMap[tokenAddress].allowance = MAX_ETH.toString();
    state.statusMap.keeperTokensStatusMap[tokenAddress].approve = new Status({});
  },
  APPROVE_KEEPER_TOKEN_FAILURE: (state: KeepersState, { error, tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].approve = new Status({ error: error.message ?? error });
  },
  BOND_KEEPER_TOKEN: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].bond = new Status({ loading: true });
  },
  BOND_KEEPER_TOKEN_SUCCESS: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].bond = new Status({});
  },
  BOND_KEEPER_TOKEN_FAILURE: (state: KeepersState, { error, tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].bond = new Status({ error: error.message ?? error });
  },
  UNBOND_KEEPER_TOKEN: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].unbond = new Status({ loading: true });
  },
  UNBOND_KEEPER_TOKEN_SUCCESS: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].unbond = new Status({});
  },
  UNBOND_KEEPER_TOKEN_FAILURE: (state: KeepersState, { error, tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].unbond = new Status({ error: error.message ?? error });
  },
  ACTIVATE_BOND: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].activate = new Status({ loading: true });
  },
  ACTIVATE_BOND_SUCCESS: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].activate = new Status({});
  },
  ACTIVATE_BOND_FAILURE: (state: KeepersState, { error, tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].activate = new Status({ error: error.message ?? error });
  },
  WITHDRAW_UNBOND: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].withdraw = new Status({ loading: true });
  },
  WITHDRAW_UNBOND_SUCCESS: (state: KeepersState, { tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].withdraw = new Status({});
  },
  WITHDRAW_UNBOND_FAILURE: (state: KeepersState, { error, tokenAddress }) => {
    state.statusMap.keeperTokensStatusMap[tokenAddress].withdraw = new Status({ error: error.message ?? error });
  },
  SLASH_KEEPER: (state: KeepersState) => {
    state.statusMap.slashKeeper = new Status({ loading: true });
  },
  SLASH_KEEPER_SUCCESS: (state: KeepersState) => {
    state.statusMap.slashKeeper = new Status({});
  },
  SLASH_KEEPER_FAILURE: (state: KeepersState, { error }) => {
    state.statusMap.slashKeeper = new Status({ error: error.message ?? error });
  },
  SELECT_KEEPER_TOKEN: (state: KeepersState, { keeperTokenAddress }: { keeperTokenAddress: string }) => {
    state.selectedKeeperToken = keeperTokenAddress;
  },
  SET_CURRENT_EXTERNAL_ADDRESS: (state: KeepersState, { address }) => {
    state.currentExternalKeeperAddress = address;
  },
};
