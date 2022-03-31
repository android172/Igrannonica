import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodaciComponent } from './podaci.component';

describe('PodaciComponent', () => {
  let component: PodaciComponent;
  let fixture: ComponentFixture<PodaciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodaciComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PodaciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
