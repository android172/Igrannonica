import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../shared/shared.service';


@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {

  idEksperimenta: any;
  naziv: any;
  json: any;

  //public kolone: any[] = [];
 message: any;

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared: SharedService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        console.log(this.idEksperimenta);
      }
    )
  }

  ngOnInit(): void {
    this.ucitajNaziv();
  }

  ucitajKolone(){
    this.message = this.shared.getMessage();
    console.log(this.message);
  }

  ucitajNaziv()
  {
    this.http.get('http://localhost:5008/api/Eksperiment/Eksperiment/' + this.idEksperimenta, {responseType: 'text'}).subscribe(
        res=>{
          console.log(res);
          this.naziv = res;
          var div = (<HTMLDivElement>document.getElementById("nazivE")).innerHTML = this.naziv;
          console.log(this.naziv);
        },error=>{
          console.log(error.error);
        }
    );
  }



}
