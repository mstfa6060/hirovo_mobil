// @services/ApiService.ts
import { AxiosResponse } from 'axios';

export class ApiService {
  static async call<T>(promise: Promise<AxiosResponse<{ payload: T }>>): Promise<T> {
    const response = await promise;
    return response.data.payload;
  }
}
