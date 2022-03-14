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

  prijava(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;

    this.http.post('http://localhost:5008/api/Auth',{"korisnickoIme":korisnickoIme, "sifra":sifra},{responseType: 'text'}).subscribe(
      token=>{
        this.cookie.set("token",token);
      }
    );
  }
  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }

}
