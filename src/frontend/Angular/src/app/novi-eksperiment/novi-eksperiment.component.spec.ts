import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoviEksperimentComponent } from './novi-eksperiment.component';

describe('NoviEksperimentComponent', () => {
  let component: NoviEksperimentComponent;
  let fixture: ComponentFixture<NoviEksperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoviEksperimentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoviEksperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
