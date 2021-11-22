import Vue from 'vue';
import Vuex from 'vuex';

import WalletModule from './modules/wallet/wallet.module';
import { WalletState } from './modules/wallet/wallet.state';

import LiquiditiesModule from './modules/liquidities/liquidities.module';
import { LiquiditiesState } from './modules/liquidities/liquidities.state';

import JobsModule from './modules/jobs/jobs.module';
import { JobsState } from './modules/jobs/jobs.state';

import KeepersModule from './modules/keepers/keepers.module';
import { KeepersState } from './modules/keepers/keepers.state';

import ModalsModule from './modules/modals/modals.module';
import { ModalsState } from './modules/modals/modals.state';

import AlertsModule from './modules/alerts/alerts.module';
import { AlertsState } from './modules/alerts/alerts.state';

export interface AppState {
  wallet: WalletState;
  liquidities: LiquiditiesState;
  jobs: JobsState;
  keepers: KeepersState;
  modals: ModalsState;
  alerts: AlertsState;
}

const modules = {
  wallet: WalletModule,
  liquidities: LiquiditiesModule,
  jobs: JobsModule,
  keepers: KeepersModule,
  modals: ModalsModule,
  alerts: AlertsModule,
};

Vue.use(Vuex);

export default new Vuex.Store({
  modules,
});
