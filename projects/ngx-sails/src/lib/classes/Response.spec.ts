import {Response} from './Response';

describe('Response abstract', () => {
  class Rsp extends Response {

    public constructor(response: any, request: any) {
      super(response, request);
    }
  }

  let inst: Rsp;

  beforeAll(() => {
    inst = new Rsp({headers: {foo: 'bar'}, statusCode: 250}, {rq: 1});
  });

  it('Status should default to 200', () => {
    expect(new Rsp({}, {}).status).toBe(200);
  });

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
    }).toThrowError(/Unexpected token .+ in JSON at position/);
  });

  it('Should parse string JSON', () => {
    const i = new Rsp(JSON.stringify({headers: {foo: 'bar'}}), {});
    expect(i.headers).toEqual({foo: 'bar'});
  });
});
