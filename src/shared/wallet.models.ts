export class NetworkOptionData {
  icon: string;
  value: string;

  constructor(data: any) {
    this.icon = data.icon ?? '';
    this.value = data.value ?? '';
  }
}
