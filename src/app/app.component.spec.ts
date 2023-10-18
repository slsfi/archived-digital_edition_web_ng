import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DigitalEditionsApp } from './app.component';

describe('DigitalEditionsApp', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [DigitalEditionsApp],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
}).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(DigitalEditionsApp);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
