import {IRawSailsResponse} from '../interfaces/IRawSailsResponse';
import {ISailsRequest} from '../interfaces/ISailsRequest';
import {defineEnumerable} from '../util/define';
import {Response} from './Response';

/** A sails response implementation */
export class SailsError extends Response {
  public readonly error: any;

  public constructor(response: IRawSailsResponse, request: ISailsRequest) {
    super(response, request);
    defineEnumerable(this, 'error', response.body || {});
  }
}
