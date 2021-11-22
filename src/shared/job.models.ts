export class JobBasicData {
  address: string;
  name: string; // jobRegistryMethods.jobData(jobAddress).call())['_name'];
  credits: string; // keep3rMethods.credits(jobAddress, keep3rAddress).call(),

  constructor(data: any) {
    this.address = data.address || '';
    this.name = data.name || '';
    this.credits = data.credits;
  }
}

export class JobData extends JobBasicData {
  cycle: string; // liqManagerMethods.jobCycle(jobAddress).call(),
  creditsRefillAt: string; // function calculateCreditsRefill() on last repo
  jobEscrowStep1: string; // function calculateCreditsRefill() on last repo
  jobEscrowStep2: string; // function calculateCreditsRefill() on last repo
  liquiditiesAddresses: string[]; // liqManagerMethods.jobLiquidities(jobAddress).call();

  constructor(data: any) {
    super(data);
    this.cycle = data.cycle;
    this.creditsRefillAt = data.creditsRefillAt;
    this.jobEscrowStep1 = data.jobEscrowStep1;
    this.jobEscrowStep2 = data.jobEscrowStep2;
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

// TODO: Try to reuse JobData and UserJobData classes.
export class Job {
  address: string;
  name: string;
  jobAdded: string;
  liquidityManagerBalance: string;
  liquidityManagerBalanceRaw: string;
  currentBonds: string;
  currentBondsRaw: string;
  credits: string;
  userBalance: string;
  userBalanceRaw: string;
  creditsRefillAt: string;

  constructor(data: any) {
    this.address = data.address;
    this.name = data.name;
    this.jobAdded = data.jobAdded;
    this.liquidityManagerBalance = data.liquidityManagerBalance;
    this.liquidityManagerBalanceRaw = data.liquidityManagerBalanceRaw;
    this.currentBonds = data.currentBonds;
    this.currentBondsRaw = data.currentBondsRaw;
    this.credits = data.credits;
    this.userBalance = data.userBalance;
    this.creditsRefillAt = data.creditsRefillAt;
    this.userBalanceRaw = data.userBalanceRaw;
  }
}

export class JobLiquidityData {
  address: string;
  liquidityDesiredAmount: string; // function getJobLiquidityData() on last repo

  constructor(data: any) {
    this.address = data.address;
    this.liquidityDesiredAmount = data.liquidityDesiredAmount;
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
  name: string;
  credits: string;
}
