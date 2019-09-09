import {IRawSailsResponse} from '../interfaces/IRawSailsResponse';
import {ISailsRequest} from '../interfaces/ISailsRequest';
import {ISailsResponse} from '../interfaces/ISailsResponse';
import {AnyObject} from '../util/AnyObject';
import {defineEnumerable} from '../util/define';

/** Abstract response class */
export abstract class Response implements Omit<ISailsResponse, 'data'> {
  public readonly config: ISailsRequest;

  public readonly headers: AnyObject;

  public readonly status: number;

  protected constructor(response: IRawSailsResponse, request: ISailsRequest) {
    if (typeof <any>response === 'string') {
      try {
        response = JSON.parse(<any>response);
      } catch {
        throw new Error(`Malformed response ${response}. Could not be parsed to JSON`);
      }
    }
    defineEnumerable(this, 'config', request);
    defineEnumerable(this, 'headers', response.headers || {});
    //tslint:disable-next-line:no-magic-numbers
    defineEnumerable(this, 'status', response.statusCode || 200);
  }
}
