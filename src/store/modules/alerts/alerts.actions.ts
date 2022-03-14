import { ActionTree } from 'vuex';
import { AppState } from '@/store';
import { Alert, AlertsState, AlertTypes } from './alerts.state';

export interface AlertProps {
  type?: AlertTypes;
  persistent?: boolean;
  message: string;
  timeout?: number;
}

const DEFAULT_ALERT_TIMEOUT = 3000;

export const actions: ActionTree<AlertsState, AppState> = {
  openAlert({ commit, dispatch, state }, alert: AlertProps) {
    const alertData = {
      id: (state.lastId || 0) + 1,
      type: alert.type || 'normal',
      persistent: !!alert.persistent,
    };

    const newAlert: Alert = { ...alert, ...alertData };
    commit('OPEN_ALERT', newAlert);

    if (!alert.persistent) {
      setTimeout(() => {
        dispatch('closeAlert', newAlert.id);
      }, alert.timeout || DEFAULT_ALERT_TIMEOUT);
    }
  },
  closeAlert({ commit }, alertId: number) {
    commit('CLOSE_ALERT', { alertId });
  },
};
