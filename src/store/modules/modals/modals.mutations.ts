import { MutationTree } from 'vuex';
import { ActiveModal, ModalsState } from './modals.state';

export const mutations: MutationTree<ModalsState> = {
  OPEN_MODAL: (state: ModalsState, { name, closable }: ActiveModal) => {
    state.activeModal = {
      name,
      closable: closable ?? true,
    };
  },
  CLOSE_MODAL: (state: ModalsState) => {
    state.activeModal = {
      name: '',
      closable: true,
    };
  },
};
