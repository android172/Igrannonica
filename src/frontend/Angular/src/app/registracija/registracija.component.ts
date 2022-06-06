import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { MeniService } from '../meni.service';
import {Router} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { url } from '../app.module';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit {

  constructor(private http:HttpClient, private prikaziMeni: MeniService, private router: Router,public jwtHelper: JwtHelperService) { }

  ngOnInit(): void {
    this.prikaziMeni.meni = false;
    if(!this.jwtHelper.isTokenExpired())
    {
        this.router.navigate(['/']); 
    }
  }

  provera1()
  {
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var regexp1 = new RegExp("^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$");
    var test1 = regexp1.test(korisnickoIme);
    if(!test1 && korisnickoIme)
    {
        var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*Invalid input";
    }
    else if(!korisnickoIme)
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
    var email = (<HTMLInputElement>document.getElementById("email")).value;
    var regexp2 = new RegExp("^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
    var test2 = regexp2.test(email);
    if(!test2 && email)
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*Invalid input";
    }
    else if(!email)
    {
       var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*This field is required";
    }
    else
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "";
    }
  }

  provera3()
  {
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    var regexp3 = new RegExp("^[A-Za-z][A-Za-z ]+$"); //^[A-Z]{1}[a-z]+[ ]{1}[A-Z]{1}[a-z]+$
    var test3 = regexp3.test(ime);
    if(!test3 && ime)
    {
        var div3 = (<HTMLDivElement>document.getElementById("podaci3")).innerHTML = "*Invalid input";
    }
    else if(!ime)
    {
       var div3 = (<HTMLDivElement>document.getElementById("podaci3")).innerHTML = "*This field is required";
    }
    else
    {
        var div3 = (<HTMLDivElement>document.getElementById("podaci3")).innerHTML = "";
    }
  }

  provera4()
  {
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var regexp4 = new RegExp("^(?!.* )(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,60}$");
    var test4 = regexp4.test(sifra);
    if(!test4 && sifra.indexOf(' ') >= 0)
    {
      var div4 = (<HTMLDivElement>document.getElementById("podaci4")).innerHTML = "*Invalid input";
    }
    else if(!test4 && sifra)
    {
        var div4 = (<HTMLDivElement>document.getElementById("podaci4")).innerHTML = "*Password must be at least 8 characters and must contain 1 uppercase letter and 1 number";
    }
    else if(!sifra)
    {
       var div4 = (<HTMLDivElement>document.getElementById("podaci4")).innerHTML = "*This field is required";
    }
    else
    {
        var div4 = (<HTMLDivElement>document.getElementById("podaci4")).innerHTML = "";
    }
  }

  provera5()
  {
    var sifra2 = (<HTMLInputElement>document.getElementById("sifra2")).value;
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    if(sifra2 != sifra)
    {
        var div5 = (<HTMLDivElement>document.getElementById("podaci5")).innerHTML = "*Password doesn't match";
    }
    else if(!sifra2)
    {
       var div5 = (<HTMLDivElement>document.getElementById("podaci5")).innerHTML = "*This field is required";
    }
    else
    {
        var div5 = (<HTMLDivElement>document.getElementById("podaci5")).innerHTML = "";
    }
  }

  registracija(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var regexp1 = new RegExp("^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$");
    var test1 = regexp1.test(korisnickoIme);
    var email = (<HTMLInputElement>document.getElementById("email")).value;
    var regexp2 = new RegExp("^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
    var test2 = regexp2.test(email);
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    var regexp3 = new RegExp("^[A-Za-z][A-Za-z ]+$");
    var test3 = regexp3.test(ime);
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var regexp4 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,60}$"); 
    var test4 = regexp4.test(sifra); 
    var sifra2= (<HTMLInputElement>document.getElementById("sifra2")).value;
    var regexp5 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,60}$");
    var test5 = regexp5.test(sifra2); 

    var pom = false;
    if(test1 && test2 && test3 && test4 && test5)
      pom = true;

    if(pom){

      this.http.post(url+'/api/Auth/register',{"KorisnickoIme":korisnickoIme,"Ime":ime,"Sifra":sifra,"Email":email},{responseType: 'text'}).subscribe(
        res=>{
          console.log(res);
          //alert("Uspesna registracija");
          this.router.navigate(['/prijava']);
        },error =>{
         // console.log(error);
          if(error.error === "1"){
            var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*Username already exists";
            var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*User with this email already exists";
          }
          if(error.error === "2"){
            var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*Username already exists";
          }
          if(error.error === "3"){
            var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*User with this email already exists";
          }
        }
      );
    }
    else{
      if(!korisnickoIme){
          var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*This field is required";
      }
      if(!email){
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*This field is required";
      }
      if(!ime){
        var div3 = (<HTMLDivElement>document.getElementById("podaci3")).innerHTML = "*This field is required";
      }
      if(!sifra){
        var div4 = (<HTMLDivElement>document.getElementById("podaci4")).innerHTML = "*This field is required";
      }
      if(!sifra2){
        var div5 = (<HTMLDivElement>document.getElementById("podaci5")).innerHTML = "*This field is required";
      }
    }
  }

  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }
}
