import { state } from './wallet.state';
import { mutations } from './wallet.mutations';
import { getters } from './wallet.getters';
import { actions } from './wallet.actions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
