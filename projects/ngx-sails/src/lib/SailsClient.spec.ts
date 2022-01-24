import {inject, TestBed} from '@angular/core/testing';
import {omit} from 'lodash-es';
import {delay, firstValueFrom, lastValueFrom, noop, Observable, timer} from 'rxjs';
import {tap} from 'rxjs/operators';
import {getSocket, MockClient, MockServer} from '../../../../test/server';
import {SailsError} from './classes/SailsError';
import {SailsResponse} from './classes/SailsResponse';
import {RequestMethod} from './enums/RequestMethod';
import {ISailsResponse} from './interfaces/ISailsResponse';
import {SailsClient} from './SailsClient';
import {IO_INSTANCE} from './tokens/IO_INSTANCE';
import {NGX_SAILS_CONFIG} from './tokens/NGX_SAILS_CONFIG';

describe('SailsClientService', () => {
  let service: SailsClient;
  let client: SocketIOClient.Socket;
  let rsp: ISailsResponse<any> = <any>undefined;

  beforeAll(done => {
    client = new MockClient(MockServer);
    client.once('connect', () => {
      done();
    });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NGX_SAILS_CONFIG,
          useValue: {
            options: {
              transports: ['polling']
            },
            uri: ''
          }
        },
        {
          provide: IO_INSTANCE,
          useValue: client
        }
      ]
    });
  });

  beforeEach(inject([SailsClient], (sailsClient: SailsClient) => {
    service = sailsClient;
  }));

  it('Should be created', () => {
    expect(service instanceof SailsClient).toBe(true);
  });

  it('Should emit', done => {
    const data = Math.random();

    client.once('emission-response', (r: any) => {
      try {
        expect(r).toBe(data);
        done();
      } catch (e) {
        done.fail(e.message);
      }
    });

    service.emit('emit', data);
  });

  it('Should emit and wait', async () => {
    const data = Math.random();
    const r: any = await lastValueFrom(service.emitAndWait<{pong: number}>('ping', data));
    expect(r).toEqual({pong: data});
  });

  describe('Base success', () => {
    beforeEach(async () => {
      rsp = await lastValueFrom(service.get('success'));
    });

    it('Status should be 200', () => {
      expect(rsp.status).toBe(200);
    });

    it('Method should be GET', () => {
      expect(rsp.data.method).toBe(RequestMethod.GET);
    });
  });

  describe('Error', () => {
    let err: SailsError;

    beforeEach(async () => {
      rsp = err = undefined as any;
      try {
        rsp = await lastValueFrom(service.get('error'));
      } catch (e) {
        err = e;
      }
    });

    it('Response should be undefined', () => {
      expect(rsp).toBeFalsy();
    });

    it('Status should be 500', () => {
      expect(err.status).toBe(500);
    });

    it('Error should be ERROR', () => {
      expect(err.error).toBe('ERROR');
    });
  });

  for (const method of ['post', 'put', 'patch', 'delete'] as const) {
    describe(method.toUpperCase(), () => {
      const bodyValue = Math.random();

      beforeEach(async () => {
        const ob: Observable<SailsResponse<any>> = method === 'delete' ?
          service.delete('success', {params: {id: bodyValue}}) :
          service[method]('success', {id: bodyValue});
        rsp = await lastValueFrom(ob);
      });

      it('Status should be 200', () => {
        expect(rsp.status).toBe(200);
      });

      it(`Method should me ${method.toUpperCase()}`, () => {
        expect(rsp.data.method).toBe(method);
      });

      it('Body value should match payload', () => {
        expect(rsp.data.data).toEqual({id: bodyValue});
      });
    });
  }

  for (const method of ['head', 'options'] as const) {
    describe(method.toUpperCase(), () => {
      beforeEach(async () => {
        rsp = await lastValueFrom(service[method]('success'));
      });

      it('Status should be 200', () => {
        expect(rsp.status).toBe(200);
      });

      it(`Method should me ${method.toUpperCase()}`, () => {
        expect(rsp.data.method).toBe(method);
      });
    });
  }

  describe('Event listener', () => {
    let responses: any[];

    beforeEach(done => {
      responses = [];
      const onError = (e: any) => {
        done.fail(e);
        sub.unsubscribe();
      };
      const sub = service.on('foobar').subscribe({
        error: onError,
        next(r: any) {
          responses.push(r);
        }
      });

      getSocket().emit('foobar', 'emitted foo');

      timer(100)
        .pipe(
          tap(() => {
            getSocket().emit('foobar', 'emitted bar');
          }),
          delay(100),
          tap(() => {
            sub.unsubscribe();
            getSocket().emit('foobar', 'emitted qux');
          }),
          delay(100)
        )
        .subscribe({
          complete: () => {
            sub.unsubscribe();
            done();
          },
          error: onError,
        });
    });

    it('Should have 2 responses', () => {
      expect(responses.length).toBe(2);
    });

    it('Response 1 should be foo', () => {
      expect(responses[0]).toBe('emitted foo');
    });

    it('Response 2 should be foo', () => {
      expect(responses[1]).toBe('emitted bar');
    });
  });

  describe('Invalid json', () => {
    let err: any;

    beforeEach(async () => {
      rsp = undefined as any;
      try {
        rsp = await lastValueFrom(service.get('json-error'));
      } catch (e) {
        err = e;
      }
    });

    it('Response should be undefined', () => {
      expect(rsp).toBeFalsy();
    });

    it('Error should match regex', () => {
      expect(err).toMatch(/Unexpected token .+ in JSON at position/);
    });
  });

  it('Should lowercase headers keys', async () => {
    const r = await lastValueFrom(service.get('success', {headers: {UPPERCASE: 'YES'}}));
    expect(r.config.headers).toEqual({uppercase: 'YES'});
  });

  it('should error on 404', async () => {
    try {
      await lastValueFrom(service.get(Math.random().toString()));
    } catch (err) {
      expect(err.status).toBe(404);

      return;
    }

    throw new Error('Did not throw');
  });

  describe('Empty response', () => {
    beforeEach(async () => {
      rsp = await lastValueFrom(service.get('empty'));
    });

    it('Status should be 200', () => {
      expect(rsp.status).toBe(200);
    });

    it('Data should be empty object', () => {
      expect(rsp.data).toEqual({});
    });
  });

  it('Should default to empty config option if not provided', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: IO_INSTANCE,
          useValue: client
        }
      ]
    });

    service = TestBed.inject(SailsClient);
    expect(omit(service.configuration.options, ['transports', 'query'])).toEqual({});
  });

  it('Should assign to query', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: IO_INSTANCE,
          useValue: client
        },
        {
          provide: NGX_SAILS_CONFIG,
          useValue: {
            options: {
              query: {
                foo: 'bar.qux'
              },
              transports: ['polling']
            },
            uri: ''
          }
        }
      ]
    });

    service = TestBed.inject(SailsClient);
    expect(omit(service.configuration.options?.query)).toEqual({
      __sails_io_sdk_language: 'javascript',
      __sails_io_sdk_platform: 'browser',
      __sails_io_sdk_version: '1.1.12',
      foo: 'bar.qux'
    } as any);
  });

  it('Should default to global socket.io', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    service = TestBed.inject(SailsClient);
    expect(service.io instanceof MockClient).toBe(false);
  });

  it('Should send default headers', done => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NGX_SAILS_CONFIG,
          useValue: {
            headers: {default: 'headerino'},
            options: {
              transports: ['polling']
            },
            uri: ''
          }
        },
        {
          provide: IO_INSTANCE,
          useValue: client
        }
      ]
    });

    service = TestBed.inject(SailsClient);

    service.get('success').subscribe(
      ({config: {headers}}) => {
        try {
          expect(headers).toEqual({default: 'headerino'});
          done();
        } catch (e) {
          done.fail(e);
        }
      },
      done.fail.bind(done)
    );
  });

  it('Should notify of all errors', async () => {
    const errors$ = firstValueFrom(service.requestErrors);
    service.get('error').subscribe({error: noop});

    const {status} = await errors$;
    expect(status).toBe(500);
  });

  it('configuration should be frozen', () => {
    expect(Object.isFrozen(service.configuration)).toBe(true);
  });
});
