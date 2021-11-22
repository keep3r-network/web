import { state } from './alerts.state';
import { mutations } from './alerts.mutations';
import { getters } from './alerts.getters';
import { actions } from './alerts.actions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
