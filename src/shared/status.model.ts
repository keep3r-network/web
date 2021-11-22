export class Status {
  loading: boolean;
  error: string;

  constructor(data: any) {
    this.loading = data.loading || false;
    this.error = data.error || '';
  }
}
