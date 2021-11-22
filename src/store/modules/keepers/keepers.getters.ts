import { GetterTree } from 'vuex';
import { AppState } from '../..';
import { KeeperTokenData, UserKeeperTokenData } from '../../../shared/keepers.models';
import { Status } from '../../../shared/status.model';
import { humanizeAmount } from '../../../shared/utils';
import { KeepersState } from './keepers.state';

export const getters: GetterTree<KeepersState, AppState> = {
  selectUserKeeperInfo: (state: KeepersState): any | null => {
    const userKeeperTokenData = state.user.userKeeperTokensMap[state.selectedKeeperToken];
    const keeperTokenData = state.keeperTokensMap[state.selectedKeeperToken];
    if (!userKeeperTokenData || !keeperTokenData) {
      return [
        { name: 'Balance', number: '0.00 KP3R' },
        { name: 'Bonds', number: '0.00 KP3R' },
        { name: 'Work Completed', number: '0' },
      ];
    }

    const balance = humanizeAmount(userKeeperTokenData.balanceOf, keeperTokenData.decimals, '2');
    const bonded = humanizeAmount(userKeeperTokenData.bonded, keeperTokenData.decimals, '2');
    const completedJobs = userKeeperTokenData?.completedJobs
      ? humanizeAmount(userKeeperTokenData?.completedJobs, undefined, '4')
      : '0';
    return [
      { name: 'Balance', number: `${balance} ${keeperTokenData.symbol}` },
      { name: 'Bonds', number: `${bonded} ${keeperTokenData.symbol}` },
      { name: 'Work Completed', number: `${completedJobs}` },
    ];
  },
  userKeeperDataLoading: (state: KeepersState): boolean | null => {
    return state.statusMap.user.getKeeperTokensBasicData.loading;
  },
  selectSelectedKeeperToken: (state: KeepersState): KeeperTokenData => {
    const keeperTokenData = state.keeperTokensMap[state.selectedKeeperToken];
    return keeperTokenData ?? new KeeperTokenData({});
  },
  selectKeeperTokens: (state: KeepersState): KeeperTokenData[] => {
    return state.keeperTokenAddresses
      .map((address) => {
        const keeperTokenData = state.keeperTokensMap[address] ?? new KeeperTokenData({});
        return {
          address,
          symbol: keeperTokenData.symbol,
          decimals: keeperTokenData.decimals,
        };
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  },
  selectGetKeeperTokensData: (state: KeepersState): Status => {
    return state.statusMap.user.getKeeperTokensData;
  },
  selectUserKeeperTokenData: (state: KeepersState): UserKeeperTokenData => {
    const userKeeperTokenData = state.user.userKeeperTokensMap[state.selectedKeeperToken];
    return {
      ...userKeeperTokenData,
      balanceOf: humanizeAmount(userKeeperTokenData?.balanceOf ?? '0'),
      balanceOfRaw: userKeeperTokenData?.balanceOf ?? '0',
      pendingBondAmount: humanizeAmount(userKeeperTokenData?.pendingBondAmount ?? '0'),
      pendingUnbondAmount: humanizeAmount(userKeeperTokenData?.pendingUnbondAmount ?? '0'),
      bonded: humanizeAmount(userKeeperTokenData?.bonded ?? '0'),
    };
  },
  selectExternalKeeperDataLoading: (state: KeepersState): boolean | null => {
    return state.statusMap.getExternalKeeperData.loading || state.statusMap.getExternalTokenData.loading;
  },
  selectIsGoverner: (state: KeepersState, _, rootState: AppState): boolean => {
    return state.keep3rGovernanceAddress?.toLowerCase() === rootState.wallet.address?.toLowerCase();
  },
  selectGetGovernanceStatus: (state: KeepersState): Status => {
    return state.statusMap.getKeep3rGovernance;
  },
  selectSlashKeeperStatus: (state: KeepersState): Status => {
    return state.statusMap.slashKeeper;
  },
  selectedKeeperTokenStatusMap: (state: KeepersState) => {
    return state.statusMap.keeperTokensStatusMap[state.selectedKeeperToken];
  },
  selectExternalKeeper: (state: KeepersState) => {
    const currentExternal = state.currentExternalKeeperAddress;
    const externalKeeperData = state.externalKeepersMap[currentExternal];
    const selectedTokenAdress = state.selectedKeeperToken;
    const keeperTokenData = state.keeperTokensMap[selectedTokenAdress];

    const isKeeper = externalKeeperData?.isKeeper ?? false;
    const completedJobs = externalKeeperData?.completedJobs
      ? humanizeAmount(externalKeeperData?.completedJobs, undefined, '4')
      : '0';

    const externalKeeperTokensMap = externalKeeperData?.keeperTokensMap ?? {};
    const externalKeeperToken = externalKeeperTokensMap[selectedTokenAdress];
    const bonded = externalKeeperToken?.bonded
      ? humanizeAmount(externalKeeperToken.bonded, keeperTokenData.decimals, '4')
      : '0';

    return {
      address: currentExternal,
      firstSeen: externalKeeperData?.firstSeen ?? '0',
      isKeeper,
      lastJob: externalKeeperData?.lastJob ?? '0',
      completedJobs,
      bonded,
      bondedRaw: externalKeeperToken?.bonded ?? '0',
    };
  },
};
