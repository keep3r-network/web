import moment from 'moment';
import { GetterTree } from 'vuex';
import { AppState } from '../..';
import { Job, JobBasicView, JobData, UserJobData } from '../../../shared/job.models';
import { Status } from '../../../shared/status.model';
import { humanizeAmount, normalizeString } from '../../../shared/utils';
import { initialJobLiquiditiyStatusMap, JobLiquiditiyStatusMap, JobRegistry, JobRegistryData, JobsState } from './jobs.state';

export const getters: GetterTree<JobsState, AppState> = {
  selectJobsBasicList: (state: JobsState): JobBasicView[] => {
    const jobsBasic: JobBasicView[] = state.jobsAddresses.map((address) => {
      const jobData = state.jobsMap[address];
      const credits = jobData?.credits ? humanizeAmount(jobData.credits) : 'ERROR'; // using 18 decimals for default since kp3r has 18 decimals.
      return {
        address,
        credits,
      };
    });

    if (state.jobQuery) {
      const query = normalizeString(state.jobQuery);
      return jobsBasic.filter((job) => {
        return normalizeString(job.address).includes(query);
      });
    }

    return jobsBasic;
  },
  selectInitateJobsListStatus: (state: JobsState): Status => {
    return state.statusMap.initiateJobsList;
  },
  selectSelectedJob: (state: JobsState, _, rootState: AppState): Job | null => {
    if (!state.selectedJobAddress) return null;
    const liquidityAddress = rootState.liquidities.selectedLiquidityAddress;
    const userLiquidity = (rootState.liquidities.user.userLiquiditiesMap || {})[liquidityAddress];
    const jobData = state.jobsMap[state.selectedJobAddress];
    const credits = jobData?.credits ? humanizeAmount(jobData.credits) : '0'; // using 18 decimals for default since kp3r has 18 decimals.
    const jobLiquidityAmount =
      state.jobsLiquiditiesDataMap[state.selectedJobAddress][rootState.liquidities.selectedLiquidityAddress]
        .liquidityAmount;
    const jobLiquidityUnbonds =
      state.jobsLiquiditiesDataMap[state.selectedJobAddress][rootState.liquidities.selectedLiquidityAddress]
        .pendingUnbonds;
    const jobCanWithdrawAfter =
      state.jobsLiquiditiesDataMap[state.selectedJobAddress][rootState.liquidities.selectedLiquidityAddress]
        .canWithdrawAfter;
    const userBalance = userLiquidity?.balanceOf ? humanizeAmount(userLiquidity.balanceOf) : '0'; // using 18 decimals for default since kp3r has 18 decimals.
    const lastWorked = jobData?.lastWorked;
    const lastWorkedDate = new Date(Number(lastWorked) * 1000).toLocaleDateString('en-UK');
    return {
      address: state.selectedJobAddress,
      owner: jobData?.owner,
      lastWorked: lastWorked != '0' ? lastWorkedDate : 'Never worked',
      rewardPeriod: moment.duration(jobData?.rewardPeriod, 'seconds').humanize(),
      credits: credits || '0',
      liquidityAmount: humanizeAmount(jobLiquidityAmount) || '0',
      liquidityAmountRaw: jobLiquidityAmount,
      pendingUnbonds: humanizeAmount(jobLiquidityUnbonds) || '0',
      canWithdrawAfter: jobCanWithdrawAfter,
      jobLiquidityCredits: humanizeAmount(jobData?.jobLiquidityCredits) || '0',
      jobPeriodCredits: humanizeAmount(jobData?.jobPeriodCredits) || '0',
      userBalance,
      userBalanceRaw: userLiquidity?.balanceOf ?? '0',
    };
  },
  selectGetJobDataStatus: (state: JobsState): Status => {
    return state.statusMap.getJobData;
  },
  selectGetUserJobDataStatus: (state: JobsState): Status => {
    return state.statusMap.user.getUserJobData;
  },
  selectGetJobLiquidityDataStatus: (state: JobsState): Status => {
    return state.statusMap.getJobData;
  },
  selectCurrentJobLiqAnyLoading: (state: JobsState, _, rootState: AppState): boolean => {
    const jobAddress = state.selectedJobAddress;
    const liqAddress = rootState.liquidities.selectedLiquidityAddress;
    const jobLiquiditiesStatusMap = state.statusMap.jobsLiquiditiesStatusMap[jobAddress];

    if (!jobLiquiditiesStatusMap || !jobLiquiditiesStatusMap[liqAddress]) {
      return false;
    }
    const jobLiqStatusesMap = jobLiquiditiesStatusMap[liqAddress];
    return jobLiqStatusesMap.set.loading || jobLiqStatusesMap.remove.loading;
  },
  selectCurrentJobLiqStatusMap: (state: JobsState, _, rootState: AppState): JobLiquiditiyStatusMap => {
    const jobAddress = state.selectedJobAddress;
    const liqAddress = rootState.liquidities.selectedLiquidityAddress;
    const jobLiquiditiesStatusMap = state.statusMap.jobsLiquiditiesStatusMap[jobAddress];

    if (!jobLiquiditiesStatusMap || !jobLiquiditiesStatusMap[liqAddress]) {
      return { ...initialJobLiquiditiyStatusMap };
    }

    return jobLiquiditiesStatusMap[liqAddress];
  },
  selectJobQuery: (state: JobsState): string => {
    return state.jobQuery;
  },
  selectJobRegistry: (state: JobsState): JobRegistry => {
    return state.registry;
  },
  selectSelectedJobRegistryData: (state: JobsState, _, rootState: AppState): JobRegistryData | undefined => {
    return state.registry[state.selectedJobAddress];
  }
};
