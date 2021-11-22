import { MutationTree } from 'vuex';
import { Alert, AlertsState } from './alerts.state';

export const mutations: MutationTree<AlertsState> = {
  OPEN_ALERT: (state: AlertsState, alert: Alert) => {
    state.lastId = alert.id;
    state.alertsList.push(alert);
  },
  CLOSE_ALERT: (state: AlertsState, { alertId }) => {
    const alertIndex = state.alertsList.findIndex((alert) => alert.id === alertId);

    if (alertIndex > -1) {
      state.alertsList.splice(alertIndex, 1);
    }
  },
};
