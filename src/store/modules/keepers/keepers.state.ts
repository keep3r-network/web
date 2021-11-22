import { ExternalKeeperData, KeeperTokenData, UserKeeperTokenData } from '@/shared/keepers.models';
import { Status } from '@/shared/status.model';
import { keeperTokensList } from '../../../shared/keeperTokensList';

export interface KeeperTokenActionsMap {
  get: Status;
  bond: Status;
  unbond: Status;
  approve: Status;
  activate: Status;
  withdraw: Status;
}
export interface UserKeeperTokenActionsMap {
  get: Status;
}

export interface KeeperTokensMap {
  [tokenAddress: string]: KeeperTokenData;
}

export interface UserKeeperTokensMap {
  [tokenAddress: string]: UserKeeperTokenData;
}

export const initialKeeperTokenActionsMap: KeeperTokenActionsMap = {
  get: new Status({}),
  bond: new Status({}),
  unbond: new Status({}),
  approve: new Status({}),
  activate: new Status({}),
  withdraw: new Status({}),
};

export const initialUserKeeperTokenActionsMap: UserKeeperTokenActionsMap = {
  get: new Status({}),
};

export interface KeepersState {
  keep3rGovernanceAddress: string;
  keeperTokenAddresses: string[]; // list of keeper tokens supported by the app.
  keeperTokensMap: KeeperTokensMap; // map of token data not related to user.
  selectedKeeperToken: string;
  externalKeepersAddresses: string[]; // list of keeper accounts searched
  currentExternalKeeperAddress: string;
  externalKeepersMap: { [keeperAddress: string]: ExternalKeeperData }; // Map of keeper accounts searched
  user: {
    userKeeperTokensMap: UserKeeperTokensMap; // map of keeper tokens user related data.
  };
  statusMap: {
    initiateKeepersData: Status;
    getKeep3rGovernance: Status;
    instantiateKeeperTokens: Status;
    getExternalKeeperData: Status;
    getExternalTokenData: Status;
    getKeeperTokensData: Status;
    slashKeeper: Status;
    keeperTokensStatusMap: { [tokenAddress: string]: KeeperTokenActionsMap };
    user: {
      getKeeperTokensBasicData: Status;
      getKeeperTokensData: Status;
      userKeeperTokensStatusMap: { [tokenAddress: string]: UserKeeperTokenActionsMap };
    };
  };
}

export const state: KeepersState = {
  keep3rGovernanceAddress: '',
  keeperTokenAddresses: keeperTokensList,
  keeperTokensMap: {},
  selectedKeeperToken: '',
  externalKeepersAddresses: [],
  currentExternalKeeperAddress: '',
  externalKeepersMap: {},
  user: {
    userKeeperTokensMap: {},
  },
  statusMap: {
    initiateKeepersData: new Status({}),
    getKeep3rGovernance: new Status({}),
    instantiateKeeperTokens: new Status({}),
    getExternalKeeperData: new Status({}),
    getExternalTokenData: new Status({}),
    getKeeperTokensData: new Status({}),
    slashKeeper: new Status({}),
    keeperTokensStatusMap: {},
    user: {
      getKeeperTokensBasicData: new Status({}),
      getKeeperTokensData: new Status({}),
      userKeeperTokensStatusMap: {},
    },
  },
};
