import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { SharedService } from '../shared/shared.service';
import { SignalRService } from '../services/signal-r.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tokenGetter } from '../app.module';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  private eventsSubscription!: Subscription;

  @Input() mod!: Observable<number>;
  idEksperimenta: any;
  naziv: any;
  json: any;
  json1: any;

  public aktFunk: any[] = [];
  public hiddLay: any[] = [];

  public kolone: any[] = [];
 message: any;


  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared: SharedService,private signalR:SignalRService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        console.log(this.idEksperimenta);
      }
    )
  }

  ngOnInit(): void {
    this.ucitajNaziv();
    this.eventsSubscription = this.mod.subscribe((data)=>{this.posaljiZahtev(data);})
    this.signalR.startConnection();
  }
  posaljiZahtev(data:number){
    console.log(data);
    this.http.get("http://localhost:5008/api/Eksperiment/Podesavanja/"+data).subscribe(
      res=>{
        console.log(res);
        this.json1=res;
        this.aktFunk =  this.json1['activationFunctions'];
        (<HTMLInputElement>document.getElementById("bs")).defaultValue = this.json1['batchSize'];
        (<HTMLInputElement>document.getElementById("lr")).defaultValue = this.json1['learningRate'];
        this.hiddLay = this.json1['hiddenLayers'];
        (<HTMLInputElement>document.getElementById("is")).defaultValue = this.json1['inputSize'];
        (<HTMLInputElement>document.getElementById("noe")).defaultValue = this.json1['numberOfEpochs'];
        (<HTMLInputElement>document.getElementById("os")).defaultValue = this.json1['outputSize'];
        (<HTMLInputElement>document.getElementById("lf")).defaultValue = this.json1['lossFunction'];
        (<HTMLInputElement>document.getElementById("o")).defaultValue = this.json1['optimizer'];
        (<HTMLInputElement>document.getElementById("rm")).defaultValue = this.json1['regularization'];
        (<HTMLInputElement>document.getElementById("rr")).defaultValue = this.json1['regularizationRate'];
      },
      error=>{
        console.log(error);
      }
    )
  }


  ucitajNazivModela(id : any){

  this.http.get("http://localhost:5008/api/Eksperiment/Model/Naziv/"+ id, {responseType: 'text'}).subscribe(
      res=>{
        console.log(res);
        this.naziv = res;
        var div = (<HTMLDivElement>document.getElementById("nazivM")).innerHTML = this.naziv;
      },
      error=>{
        console.log(error);
      }
    )
  }
  ucitajKolone(){
    this.message = this.shared.getMessage();
    console.log(this.message);
    this.kolone  = Object.assign([], this.message);
  }


  ucitajNaziv()
  {
    this.http.get('http://localhost:5008/api/Eksperiment/Eksperiment/Naziv/' + this.idEksperimenta, {responseType: 'text'}).subscribe(
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


  provera(pom : any){

    let element = <any>document.getElementsByName("izl"); 
    console.log(pom);
    var ind = -1;
    for(let i=0; i<element.length; i++)
    {
      if(element[i].checked)
      {
        if(pom === element[i].value){
          ind = i;
        }
      }
    }
    var br = 0;
    for(let i=0; i<element.length; i++)
    {
      if(element[i].checked)
      {
        console.log(element[i]);
        br++;
        if(br>1)
        {
          if(ind == i)
            element[i].checked = false;
          else{
            element[ind].checked = false;
          }
          //console.log(element[i]);
          alert("Mozete izabrati samo jednu kolonu za izlaz");
          //var p = (<HTMLDivElement>document.getElementById("poruka")).innerHTML = "*Mozete izabrati samo jednu kolonu"; 
        }
      }
    }
  }


  funkcija(){
    let nizK = <any>document.getElementsByName("ulz"); 
    for(let i=0; i<nizK.length; i++)
    {
      if(nizK[i].checked)
      {
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
      }
    }
  }

  treniraj(){
    
    this.signalR.ZapocniTreniranje(tokenGetter(),1);
  }
}