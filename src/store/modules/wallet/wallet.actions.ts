import { ActionTree } from 'vuex';
import { AppState } from '../../index';
import { Web3Helper } from '../../../shared/web3.helper';
import { WalletState } from './wallet.state';

interface ConnectActionProps {
  onlyAlchemy?: boolean;
}

export const actions: ActionTree<WalletState, AppState> = {
  async init({ commit, dispatch }) {
    commit('INIT');
    const web3Helper = Web3Helper.Instance;

    if (web3Helper.CachedProvider) {
      dispatch('connect', {});
    } else {
      dispatch('connect', { onlyAlchemy: true });
    }
  },

  async connect({ commit, dispatch }, { onlyAlchemy }: ConnectActionProps) {
    commit('CONNECT');
    const secureConnection = location.protocol === 'https:';
    if (!secureConnection && process.env.NODE_ENV !== 'development') {
      throw new Error('Error: Unsecure connection');
    }

    try {
      let connected = false;
      let address;
      const web3Helper = Web3Helper.Instance;
      const provider = await web3Helper.onConnect(onlyAlchemy);
      if (provider && !onlyAlchemy) {
        connected = true;
        address = web3Helper.selectedAccount;
      }

      commit('CONNECT_SUCCESS', { connected, secureConnection, address });
      dispatch('liquidities/initiateLiquidities', {}, { root: true });
      dispatch('jobs/initiateJobsList', {}, { root: true });
      dispatch('keepers/initiateKeepersData', {}, { root: true });
    } catch (error) {
      commit('CONNECT_FAILURE', { error });
    }
  },

  async disconnect({ commit }) {
    commit('DISCONNECT');
    const secureConnection = location.protocol === 'https:';
    try {
      let connected = true;
      const web3Helper = Web3Helper.Instance;
      const isSuccess = await web3Helper.onDisconnect();
      if (isSuccess) {
        connected = false;
        commit('DISCONNECT_SUCCESS', { connected, secureConnection });
        location.reload();
        return;
      }
      commit('DISCONNECT_FAILURE', { error: 'CANT_DISCONNECT' });
    } catch (error) {
      commit('DISCONNECT_FAILURE', { error });
    }
  },
};
