import { state } from './liquidities.state';
import { mutations } from './liquidities.mutations';
import { getters } from './liquidities.getters';
import { actions } from './liquidities.actions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
