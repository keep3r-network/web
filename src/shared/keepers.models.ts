export interface ExternalKeeperToken {
  bonded: string;
}

export class ExternalKeeperData {
  address: string;
  isKeeper: boolean;
  firstSeen: string;
  lastJob: string;
  completedJobs: string;
  keeperTokensMap: { [tokenAddres: string]: ExternalKeeperToken };

  constructor(data: any) {
    this.address = data.address;
    this.isKeeper = data.isKeeper;
    this.firstSeen = data.firstSeen;
    this.lastJob = data.lastJob;
    this.completedJobs = data.completedJobs;
    this.keeperTokensMap = data.keeperTokensMap;
  }
}

export class KeeperTokenData {
  address: string;
  symbol: string;
  decimals: string;

  constructor(data: any) {
    this.address = data.address ?? '0';
    this.symbol = data.symbol ?? '';
    this.decimals = data.decimals ?? '';
  }
}

export class UserKeeperTokenBasicData {
  address: string;
  balanceOf: string; // erc20.balanceOf(account);
  balanceOfRaw: string; // erc20.balanceOf(account);
  bonded: string; //  keep3r.bonds(account, tokenAddress);
  bondedRaw: string; //  keep3r.bonds(account, tokenAddress);
  completedJobs: string; // keep3r.workCompleted(account);

  constructor(data: any) {
    this.address = data.address;
    this.balanceOf = data.balanceOf; // erc20.balanceOf(account);
    this.balanceOfRaw = data.balanceOf; // erc20.balanceOf(account);
    this.bonded = data.bonded;
    this.bondedRaw = data.bonded;
    this.completedJobs = data.completedJobs;
  }
}

export class UserKeeperTokenData extends UserKeeperTokenBasicData {
  address: string;
  pendingBondAmount: string; // keep3r.pendingBonds(account, tokenAddress);
  pendingBondTimestamp: string; // keep3r.bondings(account, tokenAddress);
  pendingUnbondAmount: string; // keep3r.partianUnbonding(account, tokenAddress);
  pendingUnbondTimestamp: string; // keep3r.unbondings(account, tokenAddress);
  allowance: string;

  constructor(data: any) {
    super(data);
    this.address = data.address;
    this.pendingBondAmount = data.pendingBondAmount;
    this.pendingBondTimestamp = data.pendingBondTimestamp;
    this.pendingUnbondAmount = data.pendingUnbondAmount;
    this.pendingUnbondTimestamp = data.pendingUnbondTimestamp;
    this.allowance = data.allowance;
  }
}
