import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { url } from '../app.module';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-eksperiment',
  templateUrl: './eksperiment.component.html',
  styleUrls: ['./eksperiment.component.css']
})
export class EksperimentComponent implements OnInit {

  podaci: boolean = true;
  model: boolean = false;
  modeli: boolean = false;
  eventsSubject: Subject<number> = new Subject<number>();
  eventsSubjectModel : Subject<number> = new Subject<number>();
  eventsSubjectM : Subject<number> = new Subject<number>();

  idEksperimenta: any;
  nazivEksperimenta:any;

  snapshotovi : any = [];

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        //console.log(this.idEksperimenta);
      }
    )
  }

  ngOnInit(): void {
    this.ucitajNaziv();
    this.ucitajSnapshotove();
  }

  ngDoCheck()
  {
  }

  primi(id:number){
    this.eventsSubjectModel.next(id);
    (<HTMLAnchorElement>document.getElementById("nav-modeli-tab")).classList.remove("active","show");
    (<HTMLAnchorElement>document.getElementById("nav-model-tab")).classList.add("active","show");
    (<HTMLAnchorElement>document.getElementById("modeli")).classList.remove("active","show");
    (<HTMLAnchorElement>document.getElementById("model")).classList.add("active","show");
  }


  primiS(id:number){
    this.eventsSubject.next(id);
  }

  primiM(id:number)
  {
     this.eventsSubjectM.next(id);
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

  ucitajNaziv()
  {
    this.http.get(url+'/api/Eksperiment/Eksperiment/Naziv/' + this.idEksperimenta, {responseType: 'text'}).subscribe(
        res=>{
          //console.log(res);
          this.nazivEksperimenta = res;
          var div = (<HTMLDivElement>document.getElementById("naziveksperimenta")).innerHTML = this.nazivEksperimenta;
          //console.log(this.nazivEksperimenta);
        },error=>{
          console.log(error.error);
        }
    );
  }

  ucitajSnapshotove(){
    this.http.get(url+"/api/File/Snapshots?id="+this.idEksperimenta).subscribe(
      res=>{
        this.snapshotovi = res;
      }
    );
  }

}
