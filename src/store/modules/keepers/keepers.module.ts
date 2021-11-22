import { state } from './keepers.state';
import { mutations } from './keepers.mutations';
import { getters } from './keepers.getters';
import { actions } from './keepers.actions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
