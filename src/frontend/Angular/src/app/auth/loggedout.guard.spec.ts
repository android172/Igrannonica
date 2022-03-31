import { TestBed } from '@angular/core/testing';

import { LoggedoutGuard } from './loggedout.guard';

describe('LoggedoutGuard', () => {
  let guard: LoggedoutGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LoggedoutGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
