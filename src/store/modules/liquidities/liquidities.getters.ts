import { GetterTree } from 'vuex';
import { AppState } from '@/store';
import { initialLiquidityActionsStatusMap, LiquiditiesState, LiquidityActionMap } from './liquidities.state';
import { Liquidity, UserLiquidityData } from '@/shared/liquidity.models';

export const getters: GetterTree<LiquiditiesState, AppState> = {
  selectLiquidities: (state: LiquiditiesState): Liquidity[] => {
    return state.liquidityAddresses
      .map((address) => ({
        address,
        symbol: state.liquiditiesMap[address]?.symbol,
        protocol: state.liquiditiesMap[address]?.protocol,
        tokens: state.liquiditiesMap[address]?.tokens,
        token0IsKp3r: state.liquiditiesMap[address]?.token0IsKp3r,
      }))
      .sort((a, b) => a?.symbol?.localeCompare(b?.symbol));
  },
  selectSelectedLiquidity: (state: LiquiditiesState): Liquidity => {
    const liquidity = state.liquiditiesMap[state.selectedLiquidityAddress];

    return {
      address: liquidity?.address,
      symbol: liquidity?.symbol,
      protocol: liquidity?.protocol,
      tokens: liquidity?.tokens,
      token0IsKp3r: liquidity?.token0IsKp3r,
    };
  },
  selectCurrentLiqAnyLoading: (state: LiquiditiesState): boolean => {
    const liqAddress = state.selectedLiquidityAddress;
    const liqActionsStatuses = state.statusMap.liquiditiesStatusMap[liqAddress];
    if (!liqActionsStatuses) return false;
    return (
      liqActionsStatuses.approve.loading || liqActionsStatuses.withdraw.loading || liqActionsStatuses.deposit.loading
    );
  },
  selectCurrentLiqStatusMap: (state: LiquiditiesState): LiquidityActionMap => {
    const liqAddress = state.selectedLiquidityAddress;
    return state.statusMap.liquiditiesStatusMap[liqAddress] ?? { ...initialLiquidityActionsStatusMap };
  },
  selectSelectedUserLiquidity: (state: LiquiditiesState): UserLiquidityData => {
    const userLiquidity = state.user.userLiquiditiesMap[state.selectedLiquidityAddress];

    return {
      address: userLiquidity?.address,
      balanceOf: userLiquidity?.balanceOf,
      allowance: userLiquidity?.allowance,
    };
  },
};
