import { Status } from '@/shared/status.model';
import { LiquidityData, UserLiquidityData } from '@/shared/liquidity.models';

export interface LiquidityActionMap {
  get: Status;
  approve: Status;
  deposit: Status;
  withdraw: Status;
}

interface UserLiquidityActionMap {
  get: Status;
}

export const initialLiquidityActionsStatusMap: LiquidityActionMap = {
  approve: new Status({}),
  deposit: new Status({}),
  withdraw: new Status({}),
  get: new Status({}),
};

export const initialUserLiquidityStatusMap: UserLiquidityActionMap = {
  get: new Status({}),
};

export interface LiquiditiesState {
  liquidityAddresses: string[];
  liquiditiesMap: { [liquidityAddress: string]: LiquidityData };
  selectedLiquidityAddress: string;
  user: {
    userLiquiditiesMap: { [liquidityAddress: string]: UserLiquidityData };
  };
  statusMap: {
    initiateLiquidities: Status;
    getLiquiditiesAddresses: Status;
    getLiquiditiesData: Status;
    instantiateLpTokens: Status;
    liquiditiesStatusMap: { [liquidityAddress: string]: LiquidityActionMap };
    user: {
      getUserLiquiditiesData: Status;
      userLiquiditiesStatusMap: { [liquidityAddress: string]: UserLiquidityActionMap };
    };
  };
}

export const state: LiquiditiesState = {
  liquidityAddresses: [],
  liquiditiesMap: {},
  selectedLiquidityAddress: '',
  user: {
    userLiquiditiesMap: {},
  },
  statusMap: {
    initiateLiquidities: new Status({}),
    getLiquiditiesAddresses: new Status({}),
    getLiquiditiesData: new Status({}),
    instantiateLpTokens: new Status({}),
    liquiditiesStatusMap: {},
    user: {
      getUserLiquiditiesData: new Status({}),
      userLiquiditiesStatusMap: {},
    },
  },
};
