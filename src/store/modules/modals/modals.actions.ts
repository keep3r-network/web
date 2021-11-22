import { ActionTree } from 'vuex';
import { AppState } from '@/store';
import { ModalsState } from './modals.state';

export const actions: ActionTree<ModalsState, AppState> = {
  openModal({ commit }, { modal }: { modal: string }) {
    commit('OPEN_MODAL', { modal });
  },
  closeModal({ commit }) {
    commit('CLOSE_MODAL');
  },
};
