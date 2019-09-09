import {SailsResponse} from './SailsResponse';

//tslint:disable:no-floating-promises

describe('SailsResponse', () => {
  let inst: SailsResponse;
  const expectations: [keyof PropertyDescriptor, boolean][] = [
    ['configurable', false],
    ['enumerable', true],
    ['writable', false]
  ];

  beforeAll(() => {
    inst = new SailsResponse(<any>{body: {foo: 'bar'}}, <any>{});
  });

  it('Body check', () => {
    expect(inst.data).toEqual({foo: 'bar'});
  });

  for (const [prop, exp] of expectations) {
    it(`Error ${exp ? 'should' : 'shouldn\t'} be ${prop}`, () => {
      expect(Object.getOwnPropertyDescriptor(inst, 'config')[prop]).toBe(<any>exp);
    });
  }
});
