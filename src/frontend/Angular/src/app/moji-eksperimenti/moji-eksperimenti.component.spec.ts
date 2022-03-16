import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MojiEksperimentiComponent } from './moji-eksperimenti.component';

describe('MojiEksperimentiComponent', () => {
  let component: MojiEksperimentiComponent;
  let fixture: ComponentFixture<MojiEksperimentiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MojiEksperimentiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MojiEksperimentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
