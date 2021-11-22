import { MutationTree } from 'vuex';
import { ModalsState } from './modals.state';

export const mutations: MutationTree<ModalsState> = {
  OPEN_MODAL: (state: ModalsState, { modal }: { modal: string }) => {
    state.activeModal = modal;
  },
  CLOSE_MODAL: (state: ModalsState) => {
    state.activeModal = '';
  },
};
