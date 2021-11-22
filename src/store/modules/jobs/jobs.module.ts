import { state } from './jobs.state';
import { mutations } from './jobs.mutations';
import { getters } from './jobs.getters';
import { actions } from './jobs.actions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
