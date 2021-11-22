import {
  JobsLiquiditiesDataMap,
  JobsMap,
  UserJobLiquidityData,
  UserJobsLiquiditiesDataMap,
  UserJobsMap,
} from '@/shared/job.models';
import { Status } from '@/shared/status.model';

export interface JobLiquiditiyStatusMap {
  set: Status;
  remove: Status;
}
export const initialJobLiquiditiyStatusMap = {
  set: new Status({}),
  remove: new Status({}),
};
export interface JobsState {
  jobsAddresses: string[];
  jobsWithLiquidity: string[];
  jobsMap: JobsMap;
  jobsLiquiditiesDataMap: JobsLiquiditiesDataMap;
  selectedJobAddress: string;
  jobQuery: string;
  user: {
    userJobsMap: UserJobsMap;
    userJobsLiquiditiesDataMap: UserJobsLiquiditiesDataMap;
  };
  statusMap: {
    initiateJobsList: Status;
    getJobsAddresses: Status;
    getJobsBasicData: Status;
    getJobData: Status;
    jobsLiquiditiesStatusMap: { [jobAddress: string]: { [liqAddress: string]: JobLiquiditiyStatusMap } };
    user: {
      getUserJobData: Status;
    };
  };
}

export const state: JobsState = {
  jobsAddresses: [],
  jobsWithLiquidity: [],
  jobsMap: {},
  jobsLiquiditiesDataMap: {},
  selectedJobAddress: '',
  jobQuery: '',
  user: {
    userJobsMap: {},
    userJobsLiquiditiesDataMap: {},
  },
  statusMap: {
    initiateJobsList: new Status({}),
    getJobsAddresses: new Status({}),
    getJobsBasicData: new Status({}),
    getJobData: new Status({}),
    jobsLiquiditiesStatusMap: {},
    user: {
      getUserJobData: new Status({}),
    },
  },
};
