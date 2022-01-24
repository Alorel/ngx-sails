import type {AnyObject} from '../util/AnyObject';
import type {ISailsRequest} from './ISailsRequest';

/** A processed Sails response */
export interface ISailsResponse<T = any> {
  readonly config: ISailsRequest;

  readonly data: T;

  readonly headers: AnyObject;

  readonly status: number;
}
