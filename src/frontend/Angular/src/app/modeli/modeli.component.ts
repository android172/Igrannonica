import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-modeli',
  templateUrl: './modeli.component.html',
  styleUrls: ['./modeli.component.css']
})

export class ModeliComponent implements OnInit {
  @Output() PosaljiModel = new EventEmitter<number>();
  json: any;
  modeli : any[] = [];
  id: any;
  ActivateAddEdit: boolean = false;

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.id = params['id'];
        console.log(this.id);
      }
    )
  }

  ngOnInit(): void {
    this.ucitajImeE();
    this.ucitajModel();
  }

  send(id:number){
    this.PosaljiModel.emit(id);
  napraviModel(){
    console.log(this.id);
    var ime = (<HTMLInputElement>document.getElementById("imeM")).value;
    if(ime==""){
      //(<HTMLInputElement>document.getElementById("greska")).innerHTML="Polje ne sme biti prazno";
      alert("Ovo polje mora biti ppopunjeno!");
      return;
    }
    this.http.post("http://localhost:5008/api/Eksperiment/Modeli?ime=" + ime + "&id=" + this.id,null,{responseType: 'text'}).subscribe(
      res=>{
        console.log(res);
        this.ucitajModel();
      },
      error=>{
        console.log(error.error);
        alert("Vec postoji model sa tim imenom!");
      }
    );
  }

  ucitajModel()
  {
    this.ActivateAddEdit=true;
    this.http.get('http://localhost:5008/api/Eksperiment/Modeli/' + this.id).subscribe(
        res=>{
          console.log(res);
          this.json = res;
          this.modeli = Object.values(this.json);
        },
        error=>{
          console.log(error.error);
        }
    );
  }

  ucitajImeE(){
    this.http.get('http://localhost:5008/api/Eksperiment/Eksperiment/Naziv/' + this.id,{responseType: 'text'}).subscribe(
        res=>{
          var div = (<HTMLDivElement>document.getElementById("imeE")).innerHTML = res;
        },
        error=>{
          console.log(error.error);
        }
    );
  }

  obrisiModel(i:any)
  {
    if(confirm("Da li ste sigurni da zelite da obrisete ovaj model?"))
    {
      this.http.delete('http://localhost:5008/api/Eksperiment/Modeli/' + i,{responseType: 'text'}).subscribe(
       res=>{
         console.log(res);
            this.ucitajModel();
            var div = (<HTMLDivElement>document.getElementById("m")).style.visibility="hidden";
       },
       error=>{
         console.log(error.error);
       }
     )
    }
  }

}
