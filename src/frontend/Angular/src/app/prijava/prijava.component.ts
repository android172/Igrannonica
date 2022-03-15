import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MeniService } from '../meni.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {

  constructor(private http: HttpClient, private prikaziMeni: MeniService,private cookie: CookieService,public jwtHelper: JwtHelperService, private router: Router) { }


  ngOnInit(): void {
  }

  provera1()
  {
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    if(!korisnickoIme)
    {
        var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*Ovo polje je obavezno";
    }
    else
    {
      var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "";
    }
  }

  provera2()
  {
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    if(!sifra)
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*Ovo polje je obavezno";
    }
    else
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "";
    }
  }

  prijava(){
    
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;

    var pom = false;
    if(korisnickoIme && sifra)
      pom = true;

    if(pom){

      this.http.post('http://localhost:5008/api/Auth',{"KorisnickoIme":korisnickoIme,"Sifra":sifra},{responseType: 'text'}).subscribe(
        token=>{
          localStorage.setItem("token",token); 
          this.router.navigate(['/']);  
        },error =>{
          console.log(error.error);
        }
      );
    }
    else
      if(!korisnickoIme && sifra)
      {
        var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*Ovo polje je obavezno";
      }
    else
      if(!sifra && korisnickoIme)
      {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*Ovo polje je obavezno";
      }
    else{
      var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*Ovo polje je obavezno";
      var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*Ovo polje je obavezno";
    }
  }
  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }

}
