import {SailsResponse} from './SailsResponse';

describe('SailsResponse', () => {
  let inst: SailsResponse;

  beforeAll(() => {
    inst = new SailsResponse(<any>{body: {foo: 'bar'}}, <any>{});
  });

  it('Body check', () => {
    expect(inst.data).toEqual({foo: 'bar'});
  });
});
