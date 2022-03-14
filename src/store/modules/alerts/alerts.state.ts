export type AlertTypes = 'success' | 'error' | 'info' | 'normal';

export interface Alert {
  id: number;
  type: AlertTypes;
  persistent: boolean;
  message: string;
}

export interface AlertsState {
  alertsList: Alert[];
  lastId: number;
}

export const state: AlertsState = {
  alertsList: [],
  lastId: 0,
};
