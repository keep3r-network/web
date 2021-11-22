import { GetterTree } from 'vuex';
import { AppState } from '../..';
import { Job, JobBasicView, JobData, UserJobData } from '../../../shared/job.models';
import { Status } from '../../../shared/status.model';
import { humanizeAmount, normalizeString } from '../../../shared/utils';
import { initialJobLiquiditiyStatusMap, JobLiquiditiyStatusMap, JobsState } from './jobs.state';

export const getters: GetterTree<JobsState, AppState> = {
  selectJobsBasicList: (state: JobsState): JobBasicView[] => {
    const jobsBasic: JobBasicView[] = state.jobsAddresses.map((address) => {
      const jobData = state.jobsMap[address];
      const credits = jobData?.credits ? humanizeAmount(jobData.credits) : 'ERROR'; // using 18 decimals for default since kp3r has 18 decimals.
      return {
        address,
        name: jobData?.name || 'ERROR',
        credits,
      };
    });

    if (state.jobQuery) {
      const query = normalizeString(state.jobQuery);
      return jobsBasic.filter((job) => {
        return normalizeString(job.address).includes(query) || normalizeString(job.name).includes(query);
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
    const userJobsLiquidity = (state.user.userJobsLiquiditiesDataMap[state.selectedJobAddress] || {})[liquidityAddress];
    const userLiquidity = (rootState.liquidities.user.userLiquiditiesMap || {})[liquidityAddress];
    const jobData = state.jobsMap[state.selectedJobAddress];
    const credits = jobData?.credits ? humanizeAmount(jobData.credits) : '0'; // using 18 decimals for default since kp3r has 18 decimals.
    const currentBonds = userJobsLiquidity?.userLiquidity ? humanizeAmount(userJobsLiquidity.userLiquidity) : '0'; // using 18 decimals for default since kp3r has 18 decimals.
    const liqManagerBalance = userLiquidity?.userIdleAmount ? humanizeAmount(userLiquidity.userIdleAmount) : '0'; // using 18 decimals for default since kp3r has 18 decimals.
    const userBalance = userLiquidity?.balanceOf ? humanizeAmount(userLiquidity.balanceOf) : '0'; // using 18 decimals for default since kp3r has 18 decimals.
    return {
      address: state.selectedJobAddress,
      name: jobData?.name || 'ERROR',
      jobAdded: 'TBD', // TODO: Obtain job added date.
      credits,
      creditsRefillAt: jobData.creditsRefillAt, // TODO: Convert to timedelta.
      currentBonds,
      currentBondsRaw: userJobsLiquidity?.userLiquidity ?? '0',
      liquidityManagerBalance: liqManagerBalance,
      liquidityManagerBalanceRaw: userLiquidity?.userIdleAmount ?? '0',
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
};
