import type {IRawSailsResponse} from '../interfaces/IRawSailsResponse';
import type {ISailsRequest} from '../interfaces/ISailsRequest';
import {Response} from './Response';

/** A sails response implementation */
export class SailsError extends Response {
  public readonly error: any;

  public constructor(response: IRawSailsResponse, request: ISailsRequest) {
    super(response, request);
    this.error = response.body ?? {};
  }
}
