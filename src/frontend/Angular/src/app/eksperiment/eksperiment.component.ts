import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-eksperiment',
  templateUrl: './eksperiment.component.html',
  styleUrls: ['./eksperiment.component.css']
})
export class EksperimentComponent implements OnInit {

  podaci: boolean = true;
  model: boolean = false;
  modeli: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  ngDoCheck()
  {
  }

  primi(id:number){
    console.log(id);
this.http.get("http://localhost:5008/api/Eksperiment/Podesavanja/"+id).subscribe(
  res=>{
    console.log(res);
    (<HTMLAnchorElement>document.getElementById("nav-modeli-tab")).classList.remove("active","show");
    (<HTMLAnchorElement>document.getElementById("nav-model-tab")).classList.add("active","show");
    (<HTMLAnchorElement>document.getElementById("modeli")).classList.remove("active","show");
    (<HTMLAnchorElement>document.getElementById("model")).classList.add("active","show");
  },
  error=>{
    console.log(error);
  }
  
);


  }

  boolPodaciPromena()
  {
    this.podaci = true;
    this.model = false;
    this.modeli = false;
    /*(<HTMLAnchorElement>document.getElementById("podaci")).className = "active";
    (<HTMLAnchorElement>document.getElementById("model")).className = "";
    (<HTMLAnchorElement>document.getElementById("modeli")).className = "";*/
  }

  boolModelPromena()
  {
    this.podaci = false;
    this.model = true;
    this.modeli = false;
    /*(<HTMLAnchorElement>document.getElementById("podaci")).className = "";
    (<HTMLAnchorElement>document.getElementById("model")).className = "active";
    (<HTMLAnchorElement>document.getElementById("modeli")).className = "";*/
  }

  boolModeliPromena()
  {
    this.podaci = false;
    this.model = false;
    this.modeli = true;
    /*(<HTMLAnchorElement>document.getElementById("podaci")).className = "";
    (<HTMLAnchorElement>document.getElementById("model")).className = "";
    (<HTMLAnchorElement>document.getElementById("modeli")).className = "active";*/
  }


}
