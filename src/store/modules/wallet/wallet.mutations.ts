import { MutationTree } from 'vuex';
import { WalletState } from './wallet.state';

import { Status } from '../../../shared/status.model';

export const mutations: MutationTree<WalletState> = {
  INIT: (state: WalletState) => {
    const secureConnection = location.protocol === 'https:';
    state.secureConnection = secureConnection;
  },

  CONNECT: (state: WalletState) => {
    state.status = new Status({ loading: true });
  },

  NETWORK_CHANGE_SUCCESS: (state: WalletState, { id }) => {
    console.log('Change network success', id);
    state.selectedNetwork = id;
    state.status = new Status({});
  },
  
  CONNECT_SUCCESS: (
    state: WalletState,
    { connected, secureConnection, address, networkId } :
    { connected: boolean; secureConnection: boolean; address: string; networkId: string }
  ) => {
    state.connected = connected;
    state.secureConnection = secureConnection;
    state.address = address;
    state.status = new Status({});
    state.selectedNetwork = networkId;
  },

  CONNECT_FAILURE: (state: WalletState, { error }) => {
    console.error(error);
    state.status = new Status({ error: error.message ?? error });
  },

  DISCONNECT: (state: WalletState) => {
    state.status = new Status({ loading: true });
  },

  DISCONNECT_SUCCESS: (state: WalletState, { connected, secureConnection }) => {
    state.connected = connected;
    state.secureConnection = secureConnection;
    state.status = new Status({});
  },

  DISCONNECT_FAILURE: (state: WalletState, { error }) => {
    console.error(error);
    state.status = new Status({ error: error.message ?? error });
  },

  SWITCH_NETWORK_FAILURE: (state: WalletState, { error }) => {
    console.error(error);
    state.status = new Status({ error: error?.message ?? error });
  },
};
