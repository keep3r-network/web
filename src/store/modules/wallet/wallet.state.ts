import { Status } from '../../../shared/status.model';
import { networkList } from '../../../shared/networkList';

export interface Network {
  name: string;
  id: string;
  rpcUrls: string[];
  nativeCurrency: string;
}

export interface WalletState {
  secureConnection: boolean;
  connected: boolean;
  address: string;
  provider: any;
  web3: any;
  status: Status;
  selectedNetwork: string;
  networkList: Network[];
}

export const state: WalletState = {
  secureConnection: false,
  connected: false,
  address: '',
  provider: null,
  web3: null,
  status: {
    loading: false,
    error: '',
  },
  networkList,
  selectedNetwork: ''
};
