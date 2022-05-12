import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { url } from '../app.module';

@Component({
  selector: 'app-profilna-strana-izmena-podataka',
  templateUrl: './profilna-strana-izmena-podataka.component.html',
  styleUrls: ['./profilna-strana-izmena-podataka.component.css']
})
export class ProfilnaStranaIzmenaPodatakaComponent implements OnInit {

  
  constructor(public jwtHelper: JwtHelperService, public http: HttpClient, public router: Router) { }

  ngOnInit(): void {
    this.ucitajPodatke1();
  }

  prov1()
  {
    var ime = (<HTMLInputElement>document.getElementById("Ime")).value;
    var regexp3 = new RegExp("^[A-Za-z][A-Za-z ]+$"); //^[A-Z]{1}[a-z]+[ ]{1}[A-Z]{1}[a-z]+$
    var test3 = regexp3.test(ime);
    if(!test3 && ime)
    {
        var div3 = (<HTMLDivElement>document.getElementById("podatak1")).innerHTML = "*Pogresan unos";
    }
    else if(!ime)
    {
       var div3 = (<HTMLDivElement>document.getElementById("podatak1")).innerHTML = "*Ovo polje je obavezno";
    }
    else
    {
        var div3 = (<HTMLDivElement>document.getElementById("podatak1")).innerHTML = "";
    }
  }

  prov2()
  {
    var korisnickoIme = (<HTMLInputElement>document.getElementById("KorisnickoIme")).value;
    var regexp1 = new RegExp("^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$");
    var test1 = regexp1.test(korisnickoIme);
    if(!test1 && korisnickoIme)
    {
        var div1 = (<HTMLDivElement>document.getElementById("podatak2")).innerHTML = "*Pogresan unos";
    }
    else if(!korisnickoIme)
    {
       var div1 = (<HTMLDivElement>document.getElementById("podatak2")).innerHTML = "*Ovo polje je obavezno";
    }
    else
    {
        var div1 = (<HTMLDivElement>document.getElementById("podatak2")).innerHTML = "";
    }
  }

  prov3()
  {
    var email = (<HTMLInputElement>document.getElementById("Email")).value;
    var regexp2 = new RegExp("^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
    var test2 = regexp2.test(email);
    if(!test2 && email)
    {
        var div2 = (<HTMLDivElement>document.getElementById("podatak3")).innerHTML = "*Pogresan unos";
    }
    else if(!email)
    {
       var div2 = (<HTMLDivElement>document.getElementById("podatak3")).innerHTML = "*Ovo polje je obavezno";
    }
    else
    {
        var div2 = (<HTMLDivElement>document.getElementById("podatak3")).innerHTML = "";
    }
  }

  prov5()
  {
    var lozinka = (<HTMLInputElement>document.getElementById("novaLozinka")).value;
    var regexp4 = new RegExp("^(?!.* )(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,60}$");
    var test4 = regexp4.test(lozinka);
    if(!test4 && lozinka.indexOf(' ') >= 0)
    {
      var div4 = (<HTMLDivElement>document.getElementById("podatak5")).innerHTML = "*Pogresan unos";
    }
    else if(!test4 && lozinka)
    {
        var div4 = (<HTMLDivElement>document.getElementById("podatak5")).innerHTML = "*Lozinka mora da sadrzi najmanje 8 karaktera, jedno veliko slovo i jedan broj";
    }
    else if(!lozinka)
    {
       var div4 = (<HTMLDivElement>document.getElementById("podatak5")).innerHTML = "*Ovo polje je obavezno";
    }
    else
    {
        var div4 = (<HTMLDivElement>document.getElementById("podatak5")).innerHTML = "";
    }
  }

  prov6()
  {
    var lozinka2 = (<HTMLInputElement>document.getElementById("ponovljenaLozinka")).value;
    var lozinka = (<HTMLInputElement>document.getElementById("novaLozinka")).value;
    if(lozinka2 != lozinka)
    {
        var div5 = (<HTMLDivElement>document.getElementById("podatak6")).innerHTML = "*Lozinke se ne poklapaju";
    }
    else if(!lozinka2)
    {
       var div5 = (<HTMLDivElement>document.getElementById("podatak6")).innerHTML = "*Ovo polje je obavezno";
    }
    else
    {
        var div5 = (<HTMLDivElement>document.getElementById("podatak6")).innerHTML = "";
    }
  }

  sacuvajIzmene(){
    var korisnickoIme = (<HTMLInputElement>document.getElementById("KorisnickoIme")).value;
    var regexp1 = new RegExp("^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$");
    var test1 = regexp1.test(korisnickoIme);
    var email = (<HTMLInputElement>document.getElementById("Email")).value;
    var regexp2 = new RegExp("^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
    var test2 = regexp2.test(email);
    var ime = (<HTMLInputElement>document.getElementById("Ime")).value;
    var regexp3 = new RegExp("^[A-Za-z][A-Za-z ]+$");
    var test3 = regexp3.test(ime);
    var sifra = (<HTMLInputElement>document.getElementById("staraLozinka")).value;
    /*var regexp4 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,60}$");
    var test4 = regexp4.test(sifra); */
    var sifra2= (<HTMLInputElement>document.getElementById("novaLozinka")).value;
    var regexp5 = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,60}$");
    var test5 = regexp5.test(sifra2); 

      this.http.post(url+'/api/Auth/update',{"KorisnickoIme":korisnickoIme,"Ime":ime,"StaraSifra":sifra,"Sifra":sifra2,"Email":email},{responseType: 'text'}).subscribe(
        token=>{
          localStorage.clear();
          localStorage.setItem("token",token);
          this.router.navigate(['/profilna-strana']);
        },error =>{
          if(error.error === "Netacna stara sifra"){
            var div1 = (<HTMLDivElement>document.getElementById("podatak4")).innerHTML = "*Netacna stara lozinka";
          }
          if(error.error === "Korisnicko ime vec postoji"){
            var div1 = (<HTMLDivElement>document.getElementById("podatak2")).innerHTML = "*Korisnicko ime vec postoji";
          }
          if(error.error === "Email vec postoji"){
            var div1 = (<HTMLDivElement>document.getElementById("podatak3")).innerHTML = "*Korisnik sa ovim email-om vec postoji";
          }
        }
      );
    }


  ucitajPodatke1()
  {
    var dekodiraniToken = this.jwtHelper.decodeToken(this.jwtHelper.tokenGetter());
    (<HTMLInputElement>document.getElementById("Ime")).defaultValue = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
    (<HTMLInputElement>document.getElementById("KorisnickoIme")).defaultValue = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    (<HTMLInputElement>document.getElementById("Email")).defaultValue = dekodiraniToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

  }
  
  url = "./assets/ikonica.png";


  onselectFile(e:any){

    if(e.target.files)
    {
        var reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = (event:any) => {
          this.url = event.target.result;
        }
    }
  }

  ukloniSliku(){

    this.url = "./assets/ikonica.png";
  }
}
