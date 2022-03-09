import { HtmlParser } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http'
@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit {

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
  }

  registracija(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var email = (<HTMLInputElement>document.getElementById("email")).value;
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var sifra2= (<HTMLInputElement>document.getElementById("sifra2")).value;
    this.http.post('http://localhost:5008/api/Auth/register',{"KorisnickoIme":korisnickoIme,"Ime":ime,"Sifra":sifra,"Email":email}).subscribe(
      res=>{
        console.log(res);
      }
    );
  }
}
