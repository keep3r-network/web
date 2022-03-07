import { ActionTree } from 'vuex';
import { AppState } from '../../index';
import { Web3Helper } from '../../../shared/web3.helper';
import { WalletState } from './wallet.state';
import { getWeb3Tools } from '@/shared/web3.helper';
import { networkList } from '../../../shared/networkList';
interface ConnectActionProps {
  onlyAlchemy?: boolean;
}

interface MetamaskError {
  code: number;
  message: string;
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

  async changeNetwork({ commit, dispatch }, network: { id: string; name: string; rpcUrls: string[] }) {
    const { web3helper } = getWeb3Tools();
    const chainIdHex = `0x${Number(network.id).toString(16)}`;

    try {
      await web3helper.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      commit('NETWORK_CHANGE_SUCCESS', { id: network.id });
    } catch (switchError) {
      console.log(switchError);
      if ((switchError as MetamaskError).code === 4902) {
        try {
          await web3helper.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: network.name,
                rpcUrls: network.rpcUrls,
              },
            ],
          });
          // TODO: agregar la chain, la cambia tambien?
        } catch (addError) {
          dispatch('alerts/openAlert', { type: 'error', message: 'Failed to create network' }, { root: true });
          // TODO: add mutation to commit
          commit('SWITCH_NETWORK_FAILURE', { addError });
        }
      } else {
        dispatch('alerts/openAlert', { type: 'error', message: 'Failed to switch network' }, { root: true });
        commit('SWITCH_NETWORK_FAILURE', { switchError });
      }
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

      const networkId = `${await web3Helper.web3.eth.net.getId()}`;

      const networkIsNotWhitelisted = !networkList.find((n) => n.id === networkId);
      const isNotTestnet = (await web3Helper.web3.eth.net.getNetworkType()) === 'private';

      const openNetworkModal =
        process.env.NODE_ENV === 'development' ? networkIsNotWhitelisted && isNotTestnet : networkIsNotWhitelisted;

      if (openNetworkModal) {
        dispatch('modals/openModal', { name: 'network', closable: false }, { root: true });
        return;
      }

      commit('CONNECT_SUCCESS', { connected, secureConnection, address, networkId });
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
