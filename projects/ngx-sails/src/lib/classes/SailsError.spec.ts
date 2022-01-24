import {SailsError} from './SailsError';

describe('SailsError', () => {
  let inst: SailsError;

  beforeAll(() => {
    inst = new SailsError(<any>{body: {foo: 'bar'}}, <any>{});
  });

  it('Body check', () => {
    expect(inst.error).toEqual({foo: 'bar'});
  });
});
