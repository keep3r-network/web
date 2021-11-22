import { MutationTree } from 'vuex';
import {
  JobData,
  JobLiquidityMap,
  JobsLiquiditiesDataMap,
  JobsMap,
  UserJobLiquidityData,
  UserJobLiquidityMap,
  UserJobData,
  UserJobsLiquiditiesDataMap,
} from '../../../shared/job.models';
import { Status } from '../../../shared/status.model';

import { initialJobLiquiditiyStatusMap, JobsState } from './jobs.state';

export const mutations: MutationTree<JobsState> = {
  INITIATE_JOBS_LIST: (state: JobsState) => {
    state.statusMap.initiateJobsList = new Status({ loading: true });
  },
  INITIATE_JOBS_LIST_SUCCESS: (state: JobsState) => {
    state.statusMap.initiateJobsList = new Status({});
  },
  INITIATE_JOBS_LIST_FAILURE: (state: JobsState, { error }) => {
    state.statusMap.initiateJobsList = new Status({ error: error.message ?? error });
  },
  GET_JOBS_ADDRESSES: (state: JobsState) => {
    state.statusMap.getJobsAddresses = new Status({ loading: true });
  },
  GET_JOBS_ADDRESSES_SUCCESS: (
    state: JobsState,
    { addresses, jobsWithLiquidity }: { addresses: string[]; jobsWithLiquidity: string[] }
  ) => {
    state.jobsAddresses = addresses;
    state.jobsWithLiquidity = jobsWithLiquidity;
    state.statusMap.getJobsAddresses = new Status({});
  },
  GET_JOBS_ADDRESSES_FAILURE: (state: JobsState, { error }) => {
    state.statusMap.getJobsAddresses = new Status({ error: error.message ?? error });
  },
  GET_JOBS_BASIC_DATA: (state: JobsState) => {
    state.statusMap.getJobsBasicData = new Status({ loading: true });
  },
  GET_JOBS_BASIC_DATA_SUCCESS: (state: JobsState, { jobsMap }: { jobsMap: JobsMap }) => {
    const newJobsMap: JobsMap = {};
    Object.entries(jobsMap).forEach(([jobAddress, job]) => {
      newJobsMap[jobAddress] = {
        ...(state.jobsMap[jobAddress] || {}),
        ...job,
      };
    });
    state.jobsMap = newJobsMap;
    state.statusMap.getJobsBasicData = new Status({});
  },
  GET_JOBS_BASIC_DATA_FAILURE: (state: JobsState, { error }) => {
    state.statusMap.getJobsBasicData = new Status({ error: error.message ?? error });
  },
  SELECT_JOB: (state: JobsState, { jobAddress }: { jobAddress: string }) => {
    state.selectedJobAddress = jobAddress;
  },
  GET_JOB_DATA: (state: JobsState) => {
    state.statusMap.getJobData = new Status({ loading: true });
  },
  GET_JOB_DATA_SUCCESS: (
    state: JobsState,
    { jobData, liquiditiesDataMap }: { jobData: JobData; liquiditiesDataMap: JobLiquidityMap }
  ) => {
    state.jobsMap = {
      ...state.jobsMap,
      [jobData.address]: {
        ...(state.jobsMap[jobData.address] || {}),
        ...jobData,
      },
    };

    state.jobsLiquiditiesDataMap = {
      ...state.jobsLiquiditiesDataMap,
      [jobData.address]: {
        ...(state.jobsLiquiditiesDataMap[jobData.address] || {}),
        ...liquiditiesDataMap,
      },
    };
    state.statusMap.getJobData = new Status({});
  },
  GET_JOB_DATA_FAILURE: (state: JobsState, { error }) => {
    state.statusMap.getJobData = new Status({ error: error.message ?? error });
  },
  GET_USER_JOB_DATA: (state: JobsState) => {
    state.statusMap.user.getUserJobData = new Status({ loading: true });
  },
  GET_USER_JOB_DATA_SUCCESS: (
    state: JobsState,
    { userJob, userLiquiditiesDataMap }: { userJob: UserJobData; userLiquiditiesDataMap: UserJobLiquidityMap }
  ) => {
    state.user.userJobsMap = {
      ...state.user.userJobsMap,
      [userJob.address]: {
        ...(state.user.userJobsMap[userJob.address] || {}),
        ...userJob,
      },
    };

    state.user.userJobsLiquiditiesDataMap = {
      ...state.user.userJobsLiquiditiesDataMap,
      [userJob.address]: {
        ...(state.user.userJobsLiquiditiesDataMap[userJob.address] || {}),
        ...userLiquiditiesDataMap,
      },
    };
    state.statusMap.user.getUserJobData = new Status({});
  },
  GET_USER_JOB_DATA_FAILURE: (state: JobsState, { error }) => {
    state.statusMap.user.getUserJobData = new Status({ error: error.message ?? error });
  },
  ADD_JOB_TO_JOBS_WITH_LIQUIDITIES: (state: JobsState, { jobAddress }) => {
    state.jobsWithLiquidity = state.jobsWithLiquidity.concat(jobAddress);
  },
  SET_JOB_LIQUIDITY: (state: JobsState, { jobAddress, liqAddress }) => {
    checkAndInitJobLiquidityStatus(state, jobAddress, liqAddress);
    state.statusMap.jobsLiquiditiesStatusMap[jobAddress][liqAddress].set = new Status({ loading: true });
  },
  SET_JOB_LIQUIDITY_SUCCESS: (state: JobsState, { jobAddress, liqAddress }) => {
    state.statusMap.jobsLiquiditiesStatusMap[jobAddress][liqAddress].set = new Status({});
  },
  SET_JOB_LIQUIDITY_FAILURE: (state: JobsState, { error, jobAddress, liqAddress }) => {
    state.statusMap.jobsLiquiditiesStatusMap[jobAddress][liqAddress].set = new Status({
      error: error.message ?? error,
    });
  },
  REMOVE_JOB_LIQUIDITY: (state: JobsState, { jobAddress, liqAddress }) => {
    checkAndInitJobLiquidityStatus(state, jobAddress, liqAddress);
    state.statusMap.jobsLiquiditiesStatusMap[jobAddress][liqAddress].remove = new Status({ loading: true });
  },
  REMOVE_JOB_LIQUIDITY_SUCCESS: (state: JobsState, { jobAddress, liqAddress }) => {
    state.statusMap.jobsLiquiditiesStatusMap[jobAddress][liqAddress].remove = new Status({});
  },
  REMOVE_JOB_LIQUIDITY_FAILURE: (state: JobsState, { error, jobAddress, liqAddress }) => {
    state.statusMap.jobsLiquiditiesStatusMap[jobAddress][liqAddress].remove = new Status({
      error: error.message ?? error,
    });
  },
  SET_JOB_QUERY: (state: JobsState, { query }: { query: string }) => {
    state.jobQuery = query;
  },
};

function checkAndInitJobLiquidityStatus(state: JobsState, jobAddress: string, liqAddress: string) {
  const jobLiquiditiesStatusMap = state.statusMap.jobsLiquiditiesStatusMap[jobAddress];
  if (!jobLiquiditiesStatusMap || !jobLiquiditiesStatusMap[liqAddress]) {
    const statusMap = state.statusMap.jobsLiquiditiesStatusMap;
    state.statusMap.jobsLiquiditiesStatusMap = {
      ...statusMap,
      [jobAddress]: {
        ...(jobLiquiditiesStatusMap || {}),
        [liqAddress]: { ...initialJobLiquiditiyStatusMap },
      },
    };
  }
}
