import {Inject, Injectable, Injector, OnDestroy, Optional} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import * as _io from 'socket.io-client';
import {SailsError} from './classes/SailsError';
import {SailsResponse} from './classes/SailsResponse';
import {RequestMethod} from './enums/RequestMethod';
import type {IRawSailsResponse} from './interfaces/IRawSailsResponse';
import type {ISailsRequest} from './interfaces/ISailsRequest';
import type {ISailsRequestOpts} from './interfaces/ISailsRequestOpts';
import type {ISailsResponse} from './interfaces/ISailsResponse';
import type {NgxSailsConfig} from './interfaces/NgxSailsConfig';
import {IO_INSTANCE} from './tokens/IO_INSTANCE';
import {NGX_SAILS_CONFIG} from './tokens/NGX_SAILS_CONFIG';
import type {AnyObject} from './util/AnyObject';

@Injectable({providedIn: 'root'})
export class SailsClient implements OnDestroy {

  public readonly configuration: Readonly<NgxSailsConfig>;

  public readonly io: SocketIOClient.Socket;

  public readonly requestErrors: Observable<SailsError>;

  private readonly _cfg: SocketIOClient.ConnectOpts;

  private readonly _defaultHeaders: AnyObject;

  private readonly _errorsSbj: Subject<SailsError>;

  public constructor(
    inj: Injector,
    @Optional() @Inject(IO_INSTANCE) io: any | null,
    @Optional() @Inject(NGX_SAILS_CONFIG) cfg: NgxSailsConfig | null,
  ) {
    const SAILS_IO_SDK_STRING = '__sails_io_sdk';
    const SAILS_IO_SDK: AnyObject = {
      language: 'javascript',
      platform: 'browser',
      version: '1.1.12'
    };

    const query = Object.entries(SAILS_IO_SDK).reduce(
      (acc: any, [key, value]: [string, any]): any => {
        acc[`${SAILS_IO_SDK_STRING}_${key}`] = value;

        return acc;
      },
      {}
    );

    if (cfg?.options?.query) {
      Object.assign(query, cfg.options.query);
    }

    this._cfg = {
      transports: ['websocket'],
      ...cfg?.options,
      query
    };

    this.io = io || (((_io as any).default || _io) as SocketIOClientStatic)(cfg?.uri as any, this._cfg);
    this._defaultHeaders = cfg?.headers || {};
    this._errorsSbj = new Subject();
    this.requestErrors = this._errorsSbj.asObservable();
    this.configuration = Object.freeze<NgxSailsConfig>({
      headers: this._defaultHeaders,
      options: this._cfg,
    });
  }

  public delete<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this._sendRequest(url, RequestMethod.DELETE, undefined, opts);
  }

  /** Emit an event */
  public emit(event: string, ...args: any[]): void {
    this.io.emit(event, ...args);
  }

  /** Emit an event and wait for a response. */
  public emitAndWait<T = any>(event: string, ...args: any[]): Observable<T> {
    return new Observable<T>(subscriber => {
      this.io.emit(event, ...args, (response: any) => {
        subscriber.next(response);
        subscriber.complete();
      });
    });
  }

  public get<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this._sendRequest(url, RequestMethod.GET, undefined, opts);
  }

  public head<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this._sendRequest(url, RequestMethod.HEAD, undefined, opts);
  }

  /** @inheritDoc */
  public ngOnDestroy(): void {
    this._errorsSbj.complete();
  }

  public on<T = any>(event: string): Observable<T> {
    return new Observable<T>(subscriber => {
      function next(msg: any): void {
        subscriber.next(msg);
      }

      this.io.on(event, next);

      return () => {
        this.io.off(event, next);
      };
    });
  }

  public options<T = any>(url: string, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this._sendRequest(url, RequestMethod.OPTIONS, undefined, opts);
  }

  public patch<T = any>(url: string, body?: AnyObject, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this._sendRequest(url, RequestMethod.PATCH, body, opts);
  }

  public post<T = any>(url: string, body?: AnyObject, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this._sendRequest(url, RequestMethod.POST, body, opts);
  }

  public put<T = any>(url: string, body?: AnyObject, opts?: ISailsRequestOpts): Observable<ISailsResponse<T>> {
    return this._sendRequest(url, RequestMethod.PUT, body, opts);
  }

  private _sendRequest(
    url: string,
    method: RequestMethod,
    data?: AnyObject,
    options: ISailsRequestOpts = {}
  ): Observable<SailsResponse> {
    return sendRequest<any>(
      clean({
        data: clean(data),
        headers: clean({...this._defaultHeaders, ...options.headers}),
        method,
        params: clean(options.params || options.search || {}),
        url
      }),
      this.io,
      this._errorsSbj
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

  return new Observable<SailsResponse>(subscriber => {
    let unsubscribed = false;

    io.emit(method, request, (rawResponse: IRawSailsResponse) => {
      if (!unsubscribed) {
        if (rawResponse.statusCode >= 400) {
          const error = new SailsError(rawResponse, request);
          errors$.next(error);
          subscriber.error(error);
        } else {
          try {
            subscriber.next(new SailsResponse<any>(rawResponse, request));
            subscriber.complete();
          } catch (e) {
            subscriber.error(e);
          }
        }
      }
    });

    return () => {
      unsubscribed = true;
    };
  });
}

function lowerCaseHeaders(headers?: AnyObject): AnyObject {
  if (headers) {
    let lowercased: string;
    const out = {...headers};

    for (const [header, value] of Object.entries(headers)) {
      lowercased = header.toLowerCase();
      if (lowercased !== header) {
        out[lowercased] = value;
        delete out[header];
      }
    }

    return out;
  }

  return headers!;
}

function clean<T extends AnyObject>(obj?: T): T {
  if (obj) {
    const out = {...obj};
    for (const [key, value] of Object.entries(out)) {
      if (value === undefined) {
        delete out[key];
      }
    }
  }

  return obj!;
}
