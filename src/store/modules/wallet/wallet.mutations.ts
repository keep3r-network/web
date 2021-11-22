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

  CONNECT_SUCCESS: (state: WalletState, { connected, secureConnection, address }) => {
    state.connected = connected;
    state.secureConnection = secureConnection;
    state.address = address;
    state.status = new Status({});
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
};
