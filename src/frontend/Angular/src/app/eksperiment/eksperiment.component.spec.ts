import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EksperimentComponent } from './eksperiment.component';

describe('EksperimentComponent', () => {
  let component: EksperimentComponent;
  let fixture: ComponentFixture<EksperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EksperimentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EksperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
