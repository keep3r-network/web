import { GetterTree } from 'vuex';
import { AppState } from '../../index';
import { WalletState } from './wallet.state';
import { Status } from '../../../shared/status.model';

export const getters: GetterTree<WalletState, AppState> = {
  getWalletAddress: (state: WalletState): string => {
    return state.address;
  },
  getIsWalletConnected: (state: WalletState): boolean => {
    return state.connected;
  },
  getWalletStatus: (state: WalletState): Status => {
    return state.status;
  },
};
