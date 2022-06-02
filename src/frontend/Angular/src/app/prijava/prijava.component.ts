import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MeniService } from '../meni.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { url } from '../app.module';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {

  constructor(private http: HttpClient, private prikaziMeni: MeniService,private cookie: CookieService,public jwtHelper: JwtHelperService, private router: Router) { }


  ngOnInit(): void {
    this.prikaziMeni.meni = false;
    if(!this.jwtHelper.isTokenExpired())
    {
        this.router.navigate(['/pocetna-strana']);
    }
  }

  provera1()
  {
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    if(!korisnickoIme)
    {
        var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*This field is required";
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
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*This field is required";
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

      this.http.post(url+'/api/Auth',{"KorisnickoIme":korisnickoIme,"Sifra":sifra},{responseType: 'text'}).subscribe(
        token=>{
          localStorage.setItem("token",token); 
          console.log(token)
          this.router.navigate(['/eksperimenti']);  
        },error =>{
          console.log(error.error);
          var div = (<HTMLDivElement>document.getElementById("poruka")).innerHTML = "*Incorrect username or password";
        }
      );
    }
    else
      if(!korisnickoIme && sifra)
      {
        var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*This field is required";
      }
    else
      if(!sifra && korisnickoIme)
      {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*This field is required";
      }
    else{
      var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*This field is required";
      var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*This field is required";
    }
  }
  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }

  promeniVidljivost()
  {
    var password = (<HTMLInputElement>document.getElementById("sifra")); 
    var eye =  (<HTMLElement>document.getElementById("eye")); 

    if(password.type === "password")
    {
      password.setAttribute("type","text");
      eye.classList.replace("fa-eye","fa-eye-slash");
    }
    else
    {
      password.setAttribute("type","password");
      eye.classList.replace("fa-eye-slash","fa-eye");
    }

  }
}
