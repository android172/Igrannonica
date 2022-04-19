import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { url } from '../app.module';

@Component({
  selector: 'app-moji-eksperimenti',
  templateUrl: './moji-eksperimenti.component.html',
  styleUrls: ['./moji-eksperimenti.component.css']
})
export class MojiEksperimentiComponent implements OnInit {

  eksperimenti : any[] = [];
  json: any;
  id: any;
  constructor(private http: HttpClient,public router: Router) { }

  ngOnInit(): void {
    this.ucitajEksp();
  }

  ucitajEksp()
  {
  
    this.http.get(url+'/api/Eksperiment/Eksperimenti').subscribe(
        res=>{
          console.log(res);
          this.json = res;
          this.eksperimenti = Object.values(this.json);
        }
    );
  }

  otvoriEksperiment(i: any)
  {
    this.router.navigate(['/eksperiment'],{ queryParams: { id: i } });
  }

  obrisiE(id: number)
  {
    if(confirm("Da li ste sigurni da zelite da obrisete ovaj eksperiment?"))
    {
      this.http.delete(url+'/api/Eksperiment/Eksperiment/' + id,{responseType: 'text'}).subscribe(
        res=>{
          console.log(res);
          this.ucitajEksp();
          var div = (<HTMLDivElement>document.getElementById("e")).style.visibility="hidden";
        },
        error=>{
          console.log(error.error);
      }
      
      )
    }
  }
}
