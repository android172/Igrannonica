import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profilna-strana',
  templateUrl: './profilna-strana.component.html',
  styleUrls: ['./profilna-strana.component.css']
})
export class ProfilnaStranaComponent implements OnInit {

  eksperimenti : any[] = [];
  ime: any;
  korisnickoIme: any;
  email: any;
  json: any;

  constructor(private http: HttpClient, public jwtHelper: JwtHelperService, private router: Router) { }

  ngOnInit(): void {
    this.ucitajPodatke();
  }

  ucitajPodatke()
  {
    var dekodiraniToken = this.jwtHelper.decodeToken(this.jwtHelper.tokenGetter());
  
    this.http.get('http://localhost:5008/api/Eksperiment/Eksperimenti').subscribe(
        res=>{
          this.json = res;
          this.eksperimenti = Object.values(this.json);
          this.ime = (<HTMLDivElement>document.getElementById("ime")).innerHTML = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
          this.korisnickoIme = (<HTMLDivElement>document.getElementById("korisnickoIme")).innerHTML = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
          this.email = (<HTMLDivElement>document.getElementById("email")).innerHTML = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

        },error =>{
          this.ime = (<HTMLDivElement>document.getElementById("ime")).innerHTML = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
          this.korisnickoIme = (<HTMLDivElement>document.getElementById("korisnickoIme")).innerHTML = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
          this.email = (<HTMLDivElement>document.getElementById("email")).innerHTML = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];     
        }
      );
  }

  otvoriEksperiment(i: any)
  {
    console.log(i);
    this.router.navigate(['/localhost:4200/eksperimenti/' + i]);
  }

}
