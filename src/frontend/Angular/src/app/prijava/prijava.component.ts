import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  prijava(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("korisnickoIme")).value;
    var sifra = (<HTMLInputElement>document.getElementById("sifra")).value;

    this.http.post('http://localhost:5008/api/Auth',{"korisnickoIme":korisnickoIme, "sifra":sifra},{responseType: 'text'}).subscribe(
      res=>console.log(res)

    );
  }
}
