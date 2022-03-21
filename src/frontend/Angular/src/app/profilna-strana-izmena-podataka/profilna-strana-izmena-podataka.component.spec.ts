import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilnaStranaIzmenaPodatakaComponent } from './profilna-strana-izmena-podataka.component';

describe('ProfilnaStranaIzmenaPodatakaComponent', () => {
  let component: ProfilnaStranaIzmenaPodatakaComponent;
  let fixture: ComponentFixture<ProfilnaStranaIzmenaPodatakaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilnaStranaIzmenaPodatakaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilnaStranaIzmenaPodatakaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
