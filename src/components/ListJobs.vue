<template>
  <div class="box-list-jobs">
    <template v-if="selectInitateJobsListStatus.loading"> <Loading /> </template>
    <template v-if="!selectInitateJobsListStatus.loading && selectJobsBasicList.length === 0">
      <EmptyList>
        <span v-if="selectJobQuery">No jobs found matching your query.</span>
        <span v-else>No jobs to display.</span>
      </EmptyList>
    </template>
    <template v-if="!selectInitateJobsListStatus.loading && selectJobsBasicList.length > 0">
      <div v-for="(job, index) in selectJobsBasicList" class="job" :key="index" @click="selectJob(job.address)">
        <div class="job-row">
          <h2 class="job-name">{{ job.name }}</h2>
          <div class="job-number">{{ job.credits }}</div>
        </div>
        <div class="job-row">
          <div class="job-link">{{ job.address }}</div>
          <div class="job-credits">Total Credits</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Loading from '@/components/Loading.vue';
import EmptyList from '@/components/EmptyList.vue';

export default {
  name: 'ListJobs',
  components: {
    Loading,
    EmptyList,
  },
  computed: {
    ...mapGetters('jobs', ['selectJobsBasicList', 'selectInitateJobsListStatus', 'selectJobQuery']),
  },
  methods: {
    selectJob(jobAddress) {
      this.$store.dispatch('jobs/selectJob', { jobAddress });
      this.$store.dispatch('modals/openModal', { name: 'jobBond' });
    },
  },
};
</script>
