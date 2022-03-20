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
  json: any;

  constructor(private http: HttpClient, public jwtHelper: JwtHelperService, private router: Router) { }

  ngOnInit(): void {
    this.ucitajPodatke();
  }

  ucitajPodatke()
  {
    /*
    var dekodiraniToken = this.jwtHelper.decodeToken(this.jwtHelper.tokenGetter());
    var id = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
*/
    this.http.get('http://localhost:5008/api/Eksperiment/Eksperimenti').subscribe(
        res=>{
          console.log(res);
          this.json = res;
          this.eksperimenti = Object.values(this.json);
        },error =>{
          console.log(error.error);       
        }
      );
  }

}
