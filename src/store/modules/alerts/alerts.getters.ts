import { GetterTree } from 'vuex';
import { AppState } from '@/store';
import { Alert, AlertsState } from './alerts.state';

export const getters: GetterTree<AlertsState, AppState> = {
  selectAlerts: (state: AlertsState): Alert[] => {
    return state.alertsList;
  },
};
