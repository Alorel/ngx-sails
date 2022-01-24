import type {RequestMethod} from '../enums/RequestMethod';
import type {AnyObject} from '../util/AnyObject';

/** A Sails request */
export interface ISailsRequest {
  data?: AnyObject;

  headers?: AnyObject;

  method: RequestMethod;

  params?: AnyObject;

  url: string;
}
