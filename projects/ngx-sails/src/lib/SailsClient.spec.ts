import { TestBed } from '@angular/core/testing';

import { NgxSailsService } from './ngx-sails.service';

describe('NgxSailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxSailsService = TestBed.get(NgxSailsService);
    expect(service).toBeTruthy();
  });
});
