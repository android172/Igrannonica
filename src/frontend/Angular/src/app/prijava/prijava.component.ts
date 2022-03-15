import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MeniService } from '../meni.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {

  constructor(private http: HttpClient, private prikaziMeni: MeniService,private cookie: CookieService) { }


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
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var regexp2 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$");
    var test2 = regexp2.test(sifra);
    if(!test2)
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "*Pogresan unos";
    }
    else
    {
        var div2 = (<HTMLDivElement>document.getElementById("podaci2")).innerHTML = "";
    }
  }

  prijava(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var regexp1 = new RegExp("^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$");
    var test1 = regexp1.test(korisnickoIme);
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var regexp2 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$");
    var test2 = regexp2.test(sifra); 

    var pom = false;
    if(test1 && test2)
      pom = true;

    if(pom){

      this.http.post('http://localhost:5008/api/Auth',{"KorisnickoIme":korisnickoIme,"Sifra":sifra},{responseType: 'text'}).subscribe(
        token=>{
          this.cookie.set("token",token);   
        }
      );
    }
  }
  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }

}
