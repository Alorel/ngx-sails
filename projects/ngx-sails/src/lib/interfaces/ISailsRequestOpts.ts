import type {AnyObject} from '../util/AnyObject';

/** Request options for a Sails request */
export interface ISailsRequestOpts {
  headers?: AnyObject;

  params?: AnyObject;

  search?: AnyObject;
}
