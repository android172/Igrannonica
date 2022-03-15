import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { MeniService } from '../meni.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit {

  constructor(private http:HttpClient, private prikaziMeni: MeniService, private router: Router) { }

  ngOnInit(): void {
  }

  provera1()
  {
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var regexp1 = new RegExp("^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$");
    var test1 = regexp1.test(korisnickoIme);
    if(!test1)
    {
        var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "*Pogresan unos";
    }
    else
    {
        var div1 = (<HTMLDivElement>document.getElementById("podaci1")).innerHTML = "";
    }
  }

  provera2()
  {
    var email = (<HTMLInputElement>document.getElementById("email")).value;
    var regexp2 = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
    var test2 = regexp2.test(email);
    if(!test2)
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*Pogresan unos";
    }
    else
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "";
    }
  }

  provera3()
  {
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    var regexp3 = new RegExp("^[A-Z]{1}[a-z]+[ ]{1}[A-Z]{1}[a-z]+$");
    var test3 = regexp3.test(ime);
    if(!test3)
    {
        var div3 = (<HTMLDivElement>document.getElementById("podaci3")).innerHTML = "*Pogresan unos";
    }
    else
    {
        var div3 = (<HTMLDivElement>document.getElementById("podaci3")).innerHTML = "";
    }
  }

  provera4()
  {
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var regexp4 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$");
    var test4 = regexp4.test(sifra);
    if(!test4)
    {
        var div4 = (<HTMLDivElement>document.getElementById("podaci4")).innerHTML = "*Pogresan unos";
    }
    else
    {
        var div4 = (<HTMLDivElement>document.getElementById("podaci4")).innerHTML = "";
    }
  }

  provera5()
  {
    var sifra2 = (<HTMLInputElement>document.getElementById("sifra2")).value;
    var regexp5 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$");
    var test5 = regexp5.test(sifra2);
    if(!test5)
    {
        var div5 = (<HTMLDivElement>document.getElementById("podaci5")).innerHTML = "*Pogresan unos";
    }
    else
    {
        var div5 = (<HTMLDivElement>document.getElementById("podaci5")).innerHTML = "";
    }
  }

  registracija(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var regexp1 = new RegExp("^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$");
    var test1 = regexp1.test(korisnickoIme);
    var email = (<HTMLInputElement>document.getElementById("email")).value;
    var regexp2 = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
    var test2 = regexp2.test(email);
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    var regexp3 = new RegExp("^[A-Z]{1}[a-z]+[ ]{1}[A-Z]{1}[a-z]+$");
    var test3 = regexp3.test(ime);
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var regexp4 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$");
    var test4 = regexp4.test(sifra); 
    var sifra2= (<HTMLInputElement>document.getElementById("sifra2")).value;
    var regexp5 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$");
    var test5 = regexp5.test(sifra2); 

    var pom = false;
    if(test1 && test2 && test3 && test4 && test5)
      pom = true;

    if(pom){

      this.http.post('http://localhost:5008/api/Auth/register',{"KorisnickoIme":korisnickoIme,"Ime":ime,"Sifra":sifra,"Email":email},{responseType: 'text'}).subscribe(
        res=>{
          console.log(res);
          this.router.navigate(['/prijava']);
        }
      );
    }
  }

  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }
}
