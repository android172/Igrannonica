import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilnaStranaComponent } from './profilna-strana.component';

describe('ProfilnaStranaComponent', () => {
  let component: ProfilnaStranaComponent;
  let fixture: ComponentFixture<ProfilnaStranaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilnaStranaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilnaStranaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
