import type {IRawSailsResponse} from '../interfaces/IRawSailsResponse';
import type {ISailsRequest} from '../interfaces/ISailsRequest';
import type {ISailsResponse} from '../interfaces/ISailsResponse';
import type {AnyObject} from '../util/AnyObject';

/** Abstract response class */
export abstract class Response implements Omit<ISailsResponse, 'data'> {
  public readonly config: ISailsRequest;

  public readonly headers: AnyObject;

  public readonly status: number;

  protected constructor(response: IRawSailsResponse, request: ISailsRequest) {
    const rspParsed: IRawSailsResponse = typeof response === 'string'
      ? JSON.parse(response)
      : response;
    this.config = request;
    this.headers = rspParsed.headers || {};
    this.status = rspParsed.statusCode ?? 200;
  }
}
