import { TestBed } from '@angular/core/testing';

import { MeniService } from './meni.service';

describe('MeniService', () => {
  let service: MeniService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeniService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
