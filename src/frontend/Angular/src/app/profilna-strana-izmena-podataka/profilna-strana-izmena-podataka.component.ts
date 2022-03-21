import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-profilna-strana-izmena-podataka',
  templateUrl: './profilna-strana-izmena-podataka.component.html',
  styleUrls: ['./profilna-strana-izmena-podataka.component.css']
})
export class ProfilnaStranaIzmenaPodatakaComponent implements OnInit {

  
  constructor(public jwtHelper: JwtHelperService) { }

  ngOnInit(): void {
    this.ucitajPodatke1();
  }

  ucitajPodatke1()
  {
    var dekodiraniToken = this.jwtHelper.decodeToken(this.jwtHelper.tokenGetter());
    (<HTMLInputElement>document.getElementById("Ime")).defaultValue = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
    (<HTMLInputElement>document.getElementById("KorisnickoIme")).defaultValue = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    (<HTMLInputElement>document.getElementById("Email")).defaultValue = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

  }
  
  url = "./assets/ikonica.png";


  onselectFile(e:any){

    if(e.target.files)
    {
        var reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = (event:any) => {
          this.url = event.target.result;
        }
    }
  }

  ukloniSliku(){

    this.url = "./assets/ikonica.png";
  }
}
