import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { MeniService } from '../meni.service';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit {

  constructor(private http:HttpClient, private prikaziMeni: MeniService) { }

  ngOnInit(): void {
    this.prikaziMeni.meni = false;
  }

  registracija(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var email = (<HTMLInputElement>document.getElementById("email")).value;
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;
    var sifra2= (<HTMLInputElement>document.getElementById("sifra2")).value;
    this.http.post('http://localhost:5008/api/Auth/register',{"KorisnickoIme":korisnickoIme,"Ime":ime,"Sifra":sifra,"Email":email},{responseType: 'text'}).subscribe(
      res=>{
        console.log(res);
      }
    );
  }

  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }
}
