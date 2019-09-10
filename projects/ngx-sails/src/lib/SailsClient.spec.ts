import {inject, TestBed} from '@angular/core/testing';
import {omit} from 'lodash-es';
import {noop, Observable, timer} from 'rxjs';
import {finalize, switchMapTo, take, tap} from 'rxjs/operators';
import {getSocket, MockClient, MockServer} from '../../../../test/server';
import {SailsError} from './classes/SailsError';
import {SailsResponse} from './classes/SailsResponse';
import {RequestMethod} from './enums/RequestMethod';
import {ISailsResponse} from './interfaces/ISailsResponse';
import {SailsClient} from './SailsClient';
import {IO_INSTANCE} from './tokens/IO_INSTANCE';
import {NGX_SAILS_CONFIG} from './tokens/NGX_SAILS_CONFIG';

//tslint:disable-next-line:max-line-length
//tslint:disable:no-magic-numbers no-duplicate-string no-big-function no-identical-functions max-file-line-count no-floating-promises
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

    client.once('emission-response', r => {
      try {
        expect(r).toBe(data);
        done();
      } catch (e) {
        done.fail(e.message);
      }
    });

    service.emit('emit', data);
  });

  it('Should emit and wait', done => {
    const data = Math.random();
    service.emitAndWait<{pong: number}>('ping', data)
      .subscribe(
        r => {
          try {
            expect(r).toEqual({pong: data});
            done();
          } catch (e) {
            done.fail(e.message);
          }
        },
        done.fail.bind(done)
      );
  });

  describe('Base success', () => {
    beforeEach(done => {
      service.get('success').subscribe(
        r => {
          rsp = r;
          done();
        },
        done.fail.bind(done)
      );
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

    beforeEach(cb => {
      rsp = <any>undefined;
      service.get('error')
        .pipe(
          tap(
            r => {
              rsp = r;
            },
            (e: any) => {
              err = e;
            }
          ),
          finalize(() => cb())
        )
        .subscribe(noop, noop);
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

  for (const method of ['post', 'put', 'patch', 'delete']) {
    describe(method.toUpperCase(), () => {
      const bodyValue = Math.random();

      beforeEach(done => {
        const ob: Observable<SailsResponse<any>> = method === 'delete' ?
          service.delete('success', {params: {id: bodyValue}}) :
          service[method]('success', {id: bodyValue});

        ob.subscribe(
          v => {
            rsp = v;
            done();
          },
          done.fail.bind(done)
        );
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

  for (const method of ['head', 'options']) {
    describe(method.toUpperCase(), () => {
      beforeEach(done => {
        service[method]('success').subscribe(
          v => {
            rsp = v;
            done();
          },
          done.fail.bind(done)
        );
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
      let sub = service.on('foobar').subscribe(
        r => {
          responses.push(r);
        },
        done.fail.bind(done)
      );
      getSocket().emit('foobar', 'emitted foo');
      timer(100)
        .pipe(
          tap(() => {
            getSocket().emit('foobar', 'emitted bar');
          }),
          switchMapTo(timer(100)),
          tap(() => {
            sub.unsubscribe();
            getSocket().emit('foobar', 'emitted qux');
          }),
          switchMapTo(timer(100))
        )
        .subscribe(noop, done.fail.bind(done), () => {
          done();
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

    beforeEach(done => {
      rsp = <any>undefined;
      service.get('json-error').subscribe(
        r => {
          rsp = r;
          done();
        },
        (e: any) => {
          err = e;
          done();
        }
      );
    });

    it('Response should be undefined', () => {
      expect(rsp).toBeFalsy();
    });

    it('Error should match regex', () => {
      expect(err).toMatch(/Could not be parsed to JSON$/);
    });
  });

  it('Should lowercase headers keys', done => {
    service.get('success', {headers: {UPPERCASE: 'YES'}})
      .subscribe(
        r => {
          try {
            expect(r.config.headers).toEqual({uppercase: 'YES'});
            done();
          } catch (e) {
            done.fail(e);
          }
        },
        done.fail.bind(done)
      );
  });

  it('should error on 404', done => {
    service.get(Math.random().toString()).subscribe(
      () => {
        done.fail(new Error('Did not throw'));
      },
      err => {
        try {
          expect(err.status).toBe(404);
          done();
        } catch (e) {
          done.fail(e);
        }
      }
    );
  });

  describe('Empty response', () => {
    beforeEach(done => {
      service.get('empty').subscribe(
        r => {
          rsp = r;
          done();
        },
        done.fail.bind(done)
      );
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

    service = TestBed.get(SailsClient);
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

    service = TestBed.get(SailsClient);
    expect(omit(service.configuration.options.query)).toEqual({
      __sails_io_sdk_language: 'javascript',
      __sails_io_sdk_platform: 'browser',
      __sails_io_sdk_version: '1.1.12',
      foo: 'bar.qux'
    });
  });

  it('Should default to global socket.io', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    service = TestBed.get(SailsClient);
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

    service = TestBed.get(SailsClient);

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

  it('Should notify of all errors', done => {
    service.requestErrors.pipe(take(1)).subscribe(
      ({status}) => {
        try {
          expect(status).toBe(500);
          done();
        } catch (e) {
          done.fail(e);
        }
      },
      done.fail.bind(done)
    );
    service.get('error').subscribe(noop, noop);
  });

  for (const p of ['io', 'requestErrors', 'configuration']) {
    it(`SailsClient.${p} should be non-configurable`, () => {
      expect(Object.getOwnPropertyDescriptor(service, p).configurable).toBe(false);
    });
    it(`SailsClient.${p} should be enumerable`, () => {
      expect(Object.getOwnPropertyDescriptor(service, p).enumerable).toBe(true);
    });
    it(`SailsClient.${p} should be non-writable`, () => {
      expect(Object.getOwnPropertyDescriptor(service, p).writable).toBe(false);
    });
  }

  it('configuration should be frozen', () => {
    expect(Object.isFrozen(service.configuration)).toBe(true);
  });
});
