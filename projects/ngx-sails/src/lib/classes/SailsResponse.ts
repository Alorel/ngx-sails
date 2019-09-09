import {IRawSailsResponse} from '../interfaces/IRawSailsResponse';
import {ISailsRequest} from '../interfaces/ISailsRequest';
import {ISailsResponse} from '../interfaces/ISailsResponse';
import {defineEnumerable} from '../util/define';
import {Response} from './Response';

/** A sails response implementation */
export class SailsResponse<T = any> extends Response implements ISailsResponse<T> {
  public readonly data: T;

  public constructor(response: IRawSailsResponse, request: ISailsRequest) {
    super(response, request);
    defineEnumerable(this, 'data', response.body || {});
  }
}
