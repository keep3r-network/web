export class JobBasicData {
  address: string;
  credits: string; // keep3rMethods.credits(jobAddress, keep3rAddress).call(),
  owner: string;
  lastWorked: string;

  constructor(data: any) {
    this.address = data.address;
    this.credits = data.credits;
    this.owner = data.owner;
    this.lastWorked = data.lastWorked;
  }
}

export class JobData extends JobBasicData {
  rewardPeriod: string;
  jobLiquidityCredits: string;
  jobPeriodCredits: string;
  liquiditiesAddresses: string[]; // keep3rV2.approvedLiquidities(jobAddress).call();

  constructor(data: any) {
    super(data);
    this.jobLiquidityCredits = data.jobLiquidityCredits;
    this.jobPeriodCredits = data.jobPeriodCredits;
    this.rewardPeriod = data.rewardPeriod;
    this.liquiditiesAddresses = data.liquiditiesAddresses || [];
  }
}

export class UserJobData {
  address: string;
  userCycle: string; // liqManagerMethods.userJobCycle(currentAccount, jobAddress).call(),

  constructor(data: any) {
    this.address = data.address;
    this.userCycle = data.userCycle;
  }
}

export class Job {
  address: string;
  owner: string;
  lastWorked: string;
  liquidityAmount: string;
  liquidityAmountRaw: string;
  pendingUnbonds: string;
  canWithdrawAfter: string;
  rewardPeriod: string;
  credits: string;
  jobLiquidityCredits: string;
  jobPeriodCredits: string;
  userBalance: string;
  userBalanceRaw: string;

  constructor(data: any) {
    this.address = data.address;
    this.owner = data.owner;
    this.lastWorked = data.lastWorked;
    this.liquidityAmount = data.liquidityAmount;
    this.liquidityAmountRaw = data.liquidityAmountRaw;
    this.pendingUnbonds = data.liquidityManagerBalance;
    this.canWithdrawAfter = data.liquidityManagerBalanceRaw;
    this.rewardPeriod = data.rewardPeriod;
    this.credits = data.credits;
    this.jobLiquidityCredits = data.jobLiquidityCredits;
    this.jobPeriodCredits = data.jobPeriodCredits;
    this.userBalance = data.userBalance;
    this.userBalanceRaw = data.userBalanceRaw;
  }
}

export class JobLiquidityData {
  address: string;
  liquidityAmount: string;
  pendingUnbonds: string;
  canWithdrawAfter: string;

  constructor(data: any) {
    this.address = data.address;
    this.liquidityAmount = data.liquidityAmount;
    this.pendingUnbonds = data.pendingUnbonds;
    this.canWithdrawAfter = data.canWithdrawAfter;
  }
}

export class UserJobLiquidityData {
  address: string;
  userLiquidity: string; // function getJobLiquidityData() on last repo
  userLockedLiquidity: string; // function getJobLiquidityData() on last repo

  constructor(data: any) {
    this.address = data.address;
    this.userLiquidity = data.userLiquidity;
    this.userLockedLiquidity = data.userLockedLiquidity;
  }
}

export interface JobLiquidityMap {
  [liqAddress: string]: JobLiquidityData;
}

export interface JobsMap {
  [jobAddress: string]: JobData;
}

export interface JobsLiquiditiesDataMap {
  [jobAddress: string]: JobLiquidityMap;
}

export interface UserJobsMap {
  [jobAddress: string]: UserJobData;
}

export interface UserJobLiquidityMap {
  [liqAddress: string]: UserJobLiquidityData;
}

export interface UserJobsLiquiditiesDataMap {
  [jobAddress: string]: UserJobLiquidityMap;
}

export interface JobBasicView {
  address: string;
  credits: string;
}
