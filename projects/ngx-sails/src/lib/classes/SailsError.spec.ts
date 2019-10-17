import {SailsError} from './SailsError';

//tslint:disable:no-floating-promises

describe('SailsError', () => {
  let inst: SailsError;
  const expectations: [keyof PropertyDescriptor, boolean][] = [
    ['configurable', false],
    ['enumerable', true],
    ['writable', false]
  ];

  beforeAll(() => {
    inst = new SailsError(<any>{body: {foo: 'bar'}}, <any>{});
  });

  it('Body check', () => {
    expect(inst.error).toEqual({foo: 'bar'});
  });

  for (const [prop, exp] of expectations) {
    it(`Error ${exp ? 'should' : 'shouldn\'t'} be ${prop}`, () => {
      expect(Object.getOwnPropertyDescriptor(inst, 'config')[prop]).toBe(<any>exp);
    });
  }
});
