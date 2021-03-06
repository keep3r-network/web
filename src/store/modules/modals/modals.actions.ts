import { ActionTree } from 'vuex';
import { AppState } from '@/store';
import { ModalsState } from './modals.state';

export const actions: ActionTree<ModalsState, AppState> = {
  openModal({ commit }, { name, closable }: { name: string; closable?: boolean }) {
    commit('OPEN_MODAL', { name, closable });
  },
  closeModal({ commit }) {
    commit('CLOSE_MODAL');
  },
};
