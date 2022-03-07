import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import BigNumber from 'bignumber.js';

import * as KEEP3R from '../assets/contracts/Keep3r.json';
import * as KEEP3R_V1_JOB_REGISTRY from '../assets/contracts/Keep3rV1JobRegistry.json';
import * as LIQUIDITY_MANAGER from '../assets/contracts/LiquidityManager.json';
// import { BehaviorSubject } from "rxjs";

export const ONE_ETH = new BigNumber(10).pow(18);
export const MAX_ETH = new BigNumber(2).pow(256).minus(1);

// NOTE If you use infura instead of RPC_URL
// const INFURA_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const RPC_URL =  process.env.VUE_APP_RPC_URL ?? 'https://eth-mainnet.alchemyapi.io/v2/R_8p_DAM4hFUpvxZBexIvPt_A89tk1py';
const RPC_WSS_URL = 'wss://eth-mainnet.alchemyapi.io/v2/R_8p_DAM4hFUpvxZBexIvPt_A89tk1py';

// export const blockNumberSubscription: BehaviorSubject<number> = new BehaviorSubject(
//   0
// );

const CONTRACT_ADDRESSES: any = {
  main: {
    Keep3r: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
    Keep3rV1JobRegistry: '0x7396899638410094b3690f8bd2b56f07fdab620c',
    LiquidityManager: '0xf14cb1FeB6C40F26D9cA0ea39a9a613428CDc9cA',
  },
  localMainnet: {
    Keep3r: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
    Keep3rV1JobRegistry: '0x7396899638410094b3690f8bd2b56f07fdab620c',
    LiquidityManager: '0xf14cb1FeB6C40F26D9cA0ea39a9a613428CDc9cA',
  },
  ropsten: {
    Keep3r: '0x00000',
    Keep3rV1JobRegistry: '0x000',
    LiquidityManager: '0x000',
  },
};

export class Web3Helper {
  private static _instance: Web3Helper;

  provider: any = {};
  selectedAccount = '';
  web3Modal: Web3Modal;
  web3: any;
  keep3rContract: any;
  LiquidityManagerContract: any;
  Keep3rV1JobRegistryContract: any;

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
          // infuraId: INFURA_ID, // required
          rpc: {
            1: RPC_URL,
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
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this());
  }

  public get CachedProvider() {
    return this.web3Modal.cachedProvider;
  }

  async onConnect(onlyAlchemy?: boolean): Promise<any> {
    try {
      if (onlyAlchemy) {
        this.provider = new Web3.providers.HttpProvider(RPC_URL);
        // this.provider = new Web3.providers.WebsocketProvider(RPC_WSS_URL);
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

    // Subscribe to provider connection
    // this.provider.on('connect', (info: { chainId: number }) => {
    //   console.log(info);
    // });

    // Subscribe to provider disconnection
    // this.provider.on('disconnect', (error: { code: number; message: string }) => {
    //   console.log(error);
    // });

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
    // const usingInfura = window.web3 ? false : true;
    const web3: any = new Web3(provider);
    let chainName = '';

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
      chainName = await web3.eth.net.getNetworkType();
    } catch (error) {
      console.error(`Problem verifyng network name ERROR: ${error}`);
      console.warn('USING MAINNET as network name');
      chainName = 'main';
    }

    chainName = chainName !== 'private' ? chainName : 'localMainnet';
    try {
      const keep3rAddress = CONTRACT_ADDRESSES[chainName].Keep3r;
      const keep3rV1JobRegistryAddress = CONTRACT_ADDRESSES[chainName].Keep3rV1JobRegistry;
      const liquidityManagerAddress = CONTRACT_ADDRESSES[chainName].LiquidityManager;

      this.keep3rContract = new web3.eth.Contract(KEEP3R.abi, keep3rAddress);
      this.contractsMap[keep3rAddress] = this.keep3rContract;
      this.Keep3rV1JobRegistryContract = new web3.eth.Contract(KEEP3R_V1_JOB_REGISTRY.abi, keep3rV1JobRegistryAddress);
      this.LiquidityManagerContract = new web3.eth.Contract(LIQUIDITY_MANAGER.abi, liquidityManagerAddress);
    } catch (error) {
      console.error(`CAN'T FIND CONTRACT ADDRESSES: ${chainName} ERROR: ${error}`);
    }

    this.selectedAccount = (await web3.eth.getAccounts())[0];
    this.web3 = web3;

    // NOTE If there is no window.web3 it means its using web3 with an HttpProvider(infura..)
    // if (!usingInfura) {
    //   this.startBlockSubscription(web3);
    // }

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

  // startBlockSubscription(web3: any) {
  //   web3.eth.subscribe("newBlockHeaders", (error: any, result: any) => {
  //     blockNumberSubscription.next(result.number);
  //   });
  // }
}

export function getWeb3Tools() {
  const web3helper = Web3Helper.Instance;
  if (!web3helper.web3) {
    throw new Error('NO WEB3 INITIATED');
  }

  // return { web3helper, currentAccount: '0x93Dfa873b15ad496BA8116Ce6CfEC52eF30a9372' }; // is keeper with full data
  // return { web3helper, currentAccount: '0x5f0845101857d2A91627478e302357860b1598a1' }; // has userKeeperTokenData full data
  // return { web3helper, currentAccount: '0x66600b59f86F51c0052D369433C3a1D10d87672B' }; // has userKeeperTokenData full data
  // return { web3helper, currentAccount: '0x6352f8C749954c9Df198cf72976E48994A77cCE2' }; // has userKeeperTokenData full data
  return { web3helper, currentAccount: web3helper.selectedAccount }; // TODO USE THIS ON PROD
}

export function isKp3r(address: string) {
  return address === Web3Helper.Instance.keep3rContract._address;
}
