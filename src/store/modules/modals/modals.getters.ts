import { GetterTree } from 'vuex';
import { AppState } from '@/store';
import { ActiveModal, ModalsState } from './modals.state';

export const getters: GetterTree<ModalsState, AppState> = {
  selectActiveModal: (state: ModalsState): ActiveModal => {
    return state.activeModal;
  },
};
