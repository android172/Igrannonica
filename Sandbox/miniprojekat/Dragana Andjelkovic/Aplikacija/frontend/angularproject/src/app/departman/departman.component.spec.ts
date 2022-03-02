import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmanComponent } from './departman.component';

describe('DepartmanComponent', () => {
  let component: DepartmanComponent;
  let fixture: ComponentFixture<DepartmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartmanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
