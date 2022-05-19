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
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { FormsModule } from '@angular/forms';
import { ProfilnaStranaComponent } from './profilna-strana/profilna-strana.component';
import { ProfilnaStranaIzmenaPodatakaComponent } from './profilna-strana-izmena-podataka/profilna-strana-izmena-podataka.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { EksperimentComponent } from './eksperiment/eksperiment.component';
import { Header2Component } from './header2/header2.component';
import { PodaciComponent } from './podaci/podaci.component';
import { ModelComponent } from './model/model.component';
import { ModeliComponent } from './modeli/modeli.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { ModalModule } from './_modal';
import {SimpleNotificationsModule} from 'angular2-notifications';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgApexchartsModule } from 'ng-apexcharts';

export function tokenGetter() {
  return localStorage.getItem("token");
}
export const url = "http://localhost:5008";

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
    EksperimentComponent,
    Header2Component,
    PodaciComponent,
    ModelComponent,
    ModeliComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    NgxCsvParserModule,
    NgxPaginationModule,
    NgxSliderModule,
    FormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:4200","localhost:5008"],
        skipWhenExpired: true
      }
    }),
    NgbModule,
    NgChartsModule,
    ModalModule,
    NgApexchartsModule,
    SimpleNotificationsModule.forRoot()
  ],
  providers: [
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
