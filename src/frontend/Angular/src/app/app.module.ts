import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PocetnaStranaComponent } from './pocetna-strana/pocetna-strana.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { NoviEksperimentComponent } from './novi-eksperiment/novi-eksperiment.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { ONamaComponent } from './o-nama/o-nama.component';
import { CookieService } from 'ngx-cookie-service';
import { FooterComponent } from './footer/footer.component';
import { JwtModule } from '@auth0/angular-jwt';
import { MojiEksperimentiComponent } from './moji-eksperimenti/moji-eksperimenti.component';
import { ProfilnaStranaComponent } from './profilna-strana/profilna-strana.component';
import { ProfilnaStranaIzmenaPodatakaComponent } from './profilna-strana-izmena-podataka/profilna-strana-izmena-podataka.component';

export function tokenGetter() {
  return localStorage.getItem("token");
}

@NgModule({
  declarations: [
    AppComponent,
    PocetnaStranaComponent,
    PrijavaComponent,
    RegistracijaComponent,
    HeaderComponent,
    NoviEksperimentComponent,
    KontaktComponent,
    ONamaComponent,
    FooterComponent,
    MojiEksperimentiComponent,
    ProfilnaStranaComponent,
    ProfilnaStranaIzmenaPodatakaComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:4200","localhost:5008"],
        skipWhenExpired: true
      }
    })
  ],
  providers: [
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
