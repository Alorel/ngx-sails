import type {IRawSailsResponse} from '../interfaces/IRawSailsResponse';
import type {ISailsRequest} from '../interfaces/ISailsRequest';
import type {ISailsResponse} from '../interfaces/ISailsResponse';
import {Response} from './Response';

/** A sails response implementation */
export class SailsResponse<T = any> extends Response implements ISailsResponse<T> {
  public readonly data: T;

  public constructor(response: IRawSailsResponse, request: ISailsRequest) {
    super(response, request);
    this.data = (response.body ?? {}) as any;
  }
}
