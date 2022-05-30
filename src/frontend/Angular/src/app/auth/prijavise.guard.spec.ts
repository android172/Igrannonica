import { TestBed } from '@angular/core/testing';

import { PrijaviseGuard } from './prijavise.guard';

describe('PrijaviseGuard', () => {
  let guard: PrijaviseGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PrijaviseGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
