import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSailsComponent } from './ngx-sails.component';

describe('NgxSailsComponent', () => {
  let component: NgxSailsComponent;
  let fixture: ComponentFixture<NgxSailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxSailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxSailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
