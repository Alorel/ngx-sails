import {Inject, Injectable, Injector, OnDestroy, Optional} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import * as _io from 'socket.io-client';
import {SailsError} from './classes/SailsError';
import {SailsResponse} from './classes/SailsResponse';
import {RequestMethod} from './enums/RequestMethod';
import {IRawSailsResponse} from './interfaces/IRawSailsResponse';
import {ISailsRequest} from './interfaces/ISailsRequest';
import {ISailsRequestOpts} from './interfaces/ISailsRequestOpts';
import {ISailsResponse} from './interfaces/ISailsResponse';
import {NgxSailsConfig} from './interfaces/NgxSailsConfig';
import {IO_INSTANCE} from './tokens/IO_INSTANCE';
import {NGX_SAILS_CONFIG} from './tokens/NGX_SAILS_CONFIG';
import {AnyObject} from './util/AnyObject';
import {defineEnumerable, defineHidden} from './util/define';

const _defaultHeaders: unique symbol = Symbol('defaultHeaders');
const _uri: unique symbol = Symbol('uri');
const _cfg: unique symbol = Symbol('cfg');
const _errorsSbj: unique symbol = Symbol('errorsSbj');
const _sendRequest: unique symbol = Symbol('sendRequest');

@Injectable({providedIn: 'root'})
export class SailsClient implements OnDestroy {

  public readonly configuration: Readonly<NgxSailsConfig>;

  public readonly io: SocketIOClient.Socket;

  public readonly requestErrors: Observable<SailsError>;

  /** @internal */
  private readonly [_defaultHeaders]: AnyObject<any>;

  /** @internal */
  private readonly [_uri]: string;

  /** @internal */
  private readonly [_cfg]: SocketIOClient.ConnectOpts;

  /** @internal */
  private readonly [_errorsSbj]: Subject<SailsError>;

  public constructor(
    inj: Injector,
    @Optional() @Inject(IO_INSTANCE) io: any,
    @Optional() @Inject(NGX_SAILS_CONFIG) cfg: NgxSailsConfig
  ) {
    if (!cfg) {
      cfg = {};
    }
    const SAILS_IO_SDK_STRING = '__sails_io_sdk';
    const SAILS_IO_SDK = {
      language: 'javascript',
      platform: 'browser',
      version: '1.1.12'
    };

    const query = Object.keys(SAILS_IO_SDK).reduce(
      (acc: any, key: string): any => {
        acc[`${SAILS_IO_SDK_STRING}_${key}`] = SAILS_IO_SDK[key];

        return acc;
      },
      {}
    );

    if (cfg.options && cfg.options.query) {
      Object.assign(query, cfg.options.query);
    }

    defineHidden(this, _cfg, {
      transports: ['websocket'],
      ...(cfg.options || {}),
      query
    });

    if (!io) {
      io = (<SocketIOClientStatic>((<any>_io).default || _io))(cfg.uri, this[_cfg]);
    }

    defineEnumerable(this, 'io', io);
    defineHidden(this, _defaultHeaders, cfg.headers || {});
    defineHidden(this, _errorsSbj, new Subject<any>());
    defineEnumerable(this, 'requestErrors', this[_errorsSbj].asObservable());
    defineEnumerable(this, 'configuration', Object.freeze(<NgxSailsConfig>{
      headers: this[_defaultHeaders],
      options: this[_cfg],
      uri: this[_uri]
    }));
  }

  public delete<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this[_sendRequest](url, RequestMethod.DELETE, undefined, opts);
  }

  public get<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this[_sendRequest](url, RequestMethod.GET, undefined, opts);
  }

  public head<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this[_sendRequest](url, RequestMethod.HEAD, undefined, opts);
  }

  /** @inheritDoc */
  public ngOnDestroy(): void {
    this[_errorsSbj].complete();
  }

  public on<T = any>(event: string): Observable<T> {
    return new Observable<T>(subscriber => {
      function next(msg: any): void {
        subscriber.next(msg);
      }

      this.io.on(event, next);
      subscriber.add(() => {
        this.io.off(event, next);
      });
    });
  }

  public options<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this[_sendRequest](url, RequestMethod.OPTIONS, undefined, opts);
  }

  public patch<T = any>(url: string, body?: AnyObject, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this[_sendRequest](url, RequestMethod.PATCH, body, opts);
  }

  public post<T = any>(url: string, body?: AnyObject, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this[_sendRequest](url, RequestMethod.POST, body, opts);
  }

  public put<T = any>(url: string, body?: AnyObject, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this[_sendRequest](url, RequestMethod.PUT, body, opts);
  }

  /** @internal */
  private [_sendRequest](
    url: string,
    method: RequestMethod,
    data?: AnyObject,
    options: ISailsRequestOpts = {}
  ): Observable<SailsResponse<any>> {
    return sendRequest<any>(
      clean({
        data: clean(data),
        headers: clean({...this[_defaultHeaders], ...(options.headers || {})}),
        method,
        params: clean(options.params || options.search || {}),
        url
      }),
      this.io,
      this[_errorsSbj]
    );
  }
}

function sendRequest<T>(
  request: ISailsRequest,
  io: SocketIOClient.Socket,
  errors$: Subject<SailsError>
): Observable<SailsResponse<T>> {
  const {method} = request;
  request.headers = lowerCaseHeaders(request.headers);

  return new Observable<SailsResponse<any>>(subscriber => {
    let unsubscribed = false;

    io.emit(method, request, (rawResponse: IRawSailsResponse) => {
      if (!unsubscribed) {
        if (rawResponse.statusCode >= 400) { //tslint:disable-line:no-magic-numbers
          const error = new SailsError(rawResponse, request);
          errors$.next(error);
          subscriber.error(error);
        } else {
          subscriber.next(new SailsResponse<any>(rawResponse, request));
          subscriber.complete();
        }
      }
    });

    subscriber.add(() => {
      unsubscribed = true;
    });
  });
}

function lowerCaseHeaders(headers?: AnyObject<any>): AnyObject<any> {
  if (headers) {
    let lowercased: string;

    for (const header of Object.keys(headers)) {
      lowercased = header.toLowerCase();
      if (lowercased !== header) {
        headers[lowercased] = headers[header];
        delete headers[header];
      }
    }
  }

  return headers;
}

function clean<T extends AnyObject<any>>(obj?: T): T {
  if (obj) {
    for (const key of Object.keys(obj)) {
      !obj[key] && delete obj[key];
    }
  }

  return obj;
}
