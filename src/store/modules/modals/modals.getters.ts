import { GetterTree } from 'vuex';
import { AppState } from '@/store';
import { ModalsState } from './modals.state';

export const getters: GetterTree<ModalsState, AppState> = {
  selectActiveModal: (state: ModalsState): string => {
    return state.activeModal;
  },
};
