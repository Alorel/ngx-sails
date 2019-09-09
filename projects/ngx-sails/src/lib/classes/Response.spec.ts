import {AnyObject} from '../util/AnyObject';
import {Response} from './Response';

//tslint:disable:no-magic-numbers no-floating-promises

describe('Response abstract', () => {
  class Rsp extends Response {

    public constructor(response: any, request: any) {
      super(response, request);
    }
  }

  let inst: Rsp;
  const props = ['config', 'headers', 'status'];
  const descs: AnyObject<PropertyDescriptor> = {};
  const expectations: [keyof PropertyDescriptor, boolean][] = [
    ['configurable', false],
    ['enumerable', true],
    ['writable', false]
  ];

  beforeAll(() => {
    inst = new Rsp({headers: {foo: 'bar'}, statusCode: 250}, {rq: 1});
    for (const p of props) {
      descs[p] = Object.getOwnPropertyDescriptor(inst, p);
    }
  });

  it('Status should default to 200', () => {
    expect(new Rsp({}, {}).status).toBe(200);
  });

  for (const instProp of props) {
    for (const [prop, exp] of expectations) {
      it(`${instProp} ${exp ? 'should' : 'shouldn\t'} be ${prop}`, () => {
        expect(descs[instProp][prop]).toBe(exp);
      });
    }
  }

  it('Status should be 250', () => {
    expect(inst.status).toBe(250);
  });

  it('Headers should be {foo: \'bar\'}', () => {
    expect(inst.headers).toEqual({foo: 'bar'});
  });

  it('Config should be {rq: 1}', () => {
    expect(inst.config).toEqual(<any>{rq: 1});
  });

  it('Should throw on invalid JSON', () => {
    expect(() => {
      new Rsp('foo}', 1);
    }).toThrowError(/Could not be parsed to JSON$/);
  });

  it('Should parse string JSON', () => {
    const i = new Rsp(JSON.stringify({headers: {foo: 'bar'}}), {});
    expect(i.headers).toEqual({foo: 'bar'});
  });
});
