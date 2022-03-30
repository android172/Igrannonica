import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
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

  public kolone: any[] = [];
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
    this.kolone  = Object.assign([], this.message);
    //this.kolone = this.message;
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


  provera(){

    let element = <any>document.getElementsByName("izl"); 
    var br = 0;
    for(let i=0; i<element.length; i++)
    {
      if(element[i].checked)
      {
        //console.log(element[i]);
        br++;
        if(br>1)
        {
          element[i].checked = false;
          //alert("Mozete izabrati samo jednu kolonu za izlaz");
          var p = (<HTMLDivElement>document.getElementById("poruka")).innerHTML = "*Mozete izabrati samo jednu kolonu"; 
         // return false;
        }
      }
    }
    //return true;
  }


  funkcija(){
    let nizK = <any>document.getElementsByName("ulz"); 
    for(let i=0; i<nizK.length; i++)
    {
      if(nizK[i].checked)
      {
        /*
        console.log(nizK[i].value);
        console.log(this.message2[i]);
        if(nizK[i].value === this.message2[i]){
          console.log("DA");
        }*/
        this.kolone.forEach((element:any,index:any) => { 
          if(element === nizK[i].value){
           // console.log(element);
            this.kolone.splice(index,1);
          }
        });
        //console.log(this.kolone);
      }
      if(!nizK[i].checked)
      {
        /*
        console.log(nizK[i].value);
        console.log(this.message2[i]);
        if(nizK[i].value === this.message2[i]){
          console.log("DA");
        }*/
        var ind = 0;
        this.kolone.forEach((element:any,index:any) => { 
          if(element === nizK[i].value){
           // console.log(element);
            ind = 1;
          }
        });
        if(ind == 0)
        {
          this.kolone.splice(i, 0, nizK[i].value);
        }
        //console.log(this.kolone);
      }
    }
    //return true;
  }
}