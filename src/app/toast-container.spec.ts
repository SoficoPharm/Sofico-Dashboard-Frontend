import { TestBed } from '@angular/core/testing';

import { ToastContainer } from './toast-container';

describe('ToastContainer', () => {
  let service: ToastContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastContainer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
