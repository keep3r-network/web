import { GetterTree } from 'vuex';
import { AppState } from '../../index';
import { NetworkOptionData } from '../../../shared/wallet.models';
import { Network, WalletState } from './wallet.state';
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
  selectNetworkList: (state: WalletState): Network[] => {
    return state.networkList;
  },
  selectSelectedNetwork: (state: WalletState): string => {
    return state.selectedNetwork;
  },
  selectSelectedNetworkOption: (state: WalletState): NetworkOptionData => {
    if (!state.selectedNetwork) {
      return {
        icon: '',
        value: '',
      }
    }

    const network: Network = state.networkList.find(network => network.id === state.selectedNetwork)!;

    if (!network) {
      return {
        icon: '',
        value: '',
      }
    }

    return {
      icon: require(`../../../assets/network-icons/${network.name}.png`),
      value: network.id
    };
  },
  selectNetworkOptions: (state: WalletState): NetworkOptionData[] => {
    return state.networkList
      .map((network) => ({
        icon: require(`../../../assets/network-icons/${network.name}.png`),
        value: network.id
      }));
  },
};
