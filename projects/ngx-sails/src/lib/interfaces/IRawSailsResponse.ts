/** A raw response from Sails */
import type {AnyObject} from '../util/AnyObject';

/** A raw sails response */
export interface IRawSailsResponse {
  body: AnyObject;

  headers: AnyObject;

  statusCode: number;
}
