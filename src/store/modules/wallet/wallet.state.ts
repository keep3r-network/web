import { Status } from '../../../shared/status.model';

export interface WalletState {
  secureConnection: boolean;
  connected: boolean;
  address: string;
  provider: any;
  web3: any;
  status: Status;
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
};
