import {RequestMethod} from '../enums/RequestMethod';
import {AnyObject} from '../util/AnyObject';

/** A Sails request */
export interface ISailsRequest {
  data?: AnyObject;

  headers?: AnyObject;

  method: RequestMethod;

  params?: AnyObject;

  url: string;
}
