import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import BigNumber from 'bignumber.js';

import * as KEEP3RV2 from '../assets/contracts/Keep3rV2.json';
import * as KEEP3R from '../assets/contracts/Keep3r.json';

export const ONE_ETH = new BigNumber(10).pow(18);
export const MAX_ETH = new BigNumber(2).pow(256).minus(1);

const CONTRACT_ADDRESSES: any = {
  '1': {
    // Mainnet
    Keep3r: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
    Keep3rV2: '0x4a6cff9e1456eaa3b6f37572395c6fa0c959edab',
  },
  '4': {
    // Rinkeby
    Keep3r: '0xe5dC100786A842d6054296845feBe809CB8907dE',
    Keep3rV2: '0x8d4D9F53f6F67Eed2D7520F335842805d73F1aFB',
  },
  '5': {
    // Goerli
    Keep3r: '0xcE60677e8a0471e51c2E32424ce8d0aa51030b54',
    Keep3rV2: '0xEd05BcB3b77F6Ef70B12BE931F98b6EFf2Ef6e1c',
  },
  '42': {
    // Kovan
    Keep3r: '0x03c82271dBb33093EAEc9fC412AaE6E0B71095d3',
    Keep3rV2: '0x521132B3bE7518B47F5cCb713f683a1cE0FD82E0',
  },
  '1337': {
    // Localhost
    Keep3r: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
    Keep3rV2: '0x4a6cff9e1456eaa3b6f37572395c6fa0c959edab',
  },
};

export class Web3Helper {
  private static _instance: Web3Helper;

  provider: any = {};
  selectedAccount = '';
  web3Modal: Web3Modal;
  web3: any;
  Keep3rContract: any;
  Keep3rV2Contract: any;

  contractsMap: any = {};

  constructor() {
    if (Web3Helper._instance) {
      throw new Error('Error: Instantiation failed: Use Web3Helper.getInstance() instead of new.');
    }
    Web3Helper._instance = this;

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          rpc: {
            1: process.env.VUE_APP_RPC_URL!,
          },
        },
      },
    };

    this.web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
      disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
      theme: 'light',
    });
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public get CachedProvider() {
    return this.web3Modal.cachedProvider;
  }

  async onConnect(onlyAlchemy?: boolean): Promise<any> {
    try {
      if (onlyAlchemy) {
        this.provider = new Web3.providers.HttpProvider(process.env.VUE_APP_RPC_URL!);
      } else {
        this.provider = await this.web3Modal.connect();
      }
    } catch (e) {
      console.error('Could not get a wallet connection', e);
      return;
    }

    if (!onlyAlchemy) {
      // Subscribe to accounts change
      this.provider.on('accountsChanged', () => {
        location.reload();
      });

      // Subscribe to chainId change
      this.provider.on('chainChanged', () => {
        location.reload();
      });
    }

    await this.initWeb3(this.provider);
    return this.provider;
  }

  async onDisconnect(): Promise<boolean> {
    if (this.provider.close) {
      await this.provider.close();
    }

    await this.web3Modal.clearCachedProvider();
    this.provider = null;
    this.selectedAccount = '';
    this.web3 = null;
    return true;
  }

  async initWeb3(provider: any): Promise<any> {
    const web3: any = new Web3(provider);
    let chainId = '';

    web3.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          outputFormatter: web3.utils.hexToNumber,
        },
      ],
    });

    try {
      chainId = `${await web3.eth.net.getId()}`;
    } catch (error) {
      console.error(`Problem verifyng network name ERROR: ${error}`);
      console.warn('USING MAINNET as network name');
      chainId = '1';
    }

    try {
      const keep3rAddress = CONTRACT_ADDRESSES[chainId].Keep3r;
      const keep3rV2Address = CONTRACT_ADDRESSES[chainId].Keep3rV2;

      this.Keep3rContract = new web3.eth.Contract(KEEP3R.abi, keep3rAddress);
      this.Keep3rV2Contract = new web3.eth.Contract(KEEP3RV2.abi, keep3rV2Address);
      this.contractsMap[keep3rV2Address] = this.Keep3rV2Contract;
    } catch (error) {
      console.error(`CAN'T FIND CONTRACT ADDRESSES: ${chainId} ERROR: ${error}`);
    }

    this.selectedAccount = (await web3.eth.getAccounts())[0];
    this.web3 = web3;

    return web3;
  }

  async addNewContracts(addresses: string[], abi: unknown): Promise<any> {
    const newContractAddresses = addresses.filter((address: string) => !this.contractsMap[address]);
    const contracts = await Promise.all(
      newContractAddresses.map((address) => new this.web3.eth.Contract(abi, address))
    );

    contracts.forEach((contract) => {
      const address = contract._address;
      this.contractsMap[address] = contract;
    });

    return contracts;
  }
}

export function getWeb3Tools() {
  const web3helper = Web3Helper.Instance;
  if (!web3helper.web3) {
    throw new Error('NO WEB3 INITIATED');
  }

  return { web3helper, currentAccount: web3helper.selectedAccount };
}

export function isKp3r(address: string) {
  const { web3helper } = getWeb3Tools();

  return address === web3helper.Keep3rContract._address;
}
