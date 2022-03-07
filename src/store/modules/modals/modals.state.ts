export interface ActiveModal {
  name: string;
  closable?: boolean;
}

export interface ModalsState {
  activeModal: ActiveModal;
}

export const state: ModalsState = {
  activeModal: {
    name: '',
    closable: true,
  },
};
