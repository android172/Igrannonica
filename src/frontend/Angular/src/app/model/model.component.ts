import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { SharedService } from '../shared/shared.service';
import { SignalRService } from '../services/signal-r.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tokenGetter } from '../app.module';
import { isDefined } from '@ng-bootstrap/ng-bootstrap/util/util';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  private eventsSubscription!: Subscription;

  @Input() mod!: Observable<number>;
  idEksperimenta: any;
  nazivEksperimenta: any;
  nazivModela : any;
  json: any;
  json1: any;

  public aktFunk: any[] = [];
  public hiddLay: any[] = [];

  public kolone: any[] = [];
  message: any;
  public idModela : any;

  public brojU : number = 0;
  public brojI : number = 0;
  public kolone2 : any[] = [];

 // public pom : boolean = false;
  //public brHL : number = 0;
  //public niz : any[] = [];
  public brHL : number = 0;
  public nizHL : any[] = [];
  public nizCvorova : any[] = [];
  public nizCvorovaStr: string[] = [];
  public brCvorova : any;
  public pom : string = "";
  public s: string = "";

  selectedLF: number = 0;
  selectedO: number = 0;
  selectedRM: number = 0;
  selectedPT: number = 1;

  public ulazneKolone : string[] = [];
  public izlazneKolone : string[] = [];

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared: SharedService,private signalR:SignalRService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        console.log(this.idEksperimenta);
      }
    )
  }

  sendMessage():void{
    this.shared.sendUpdate("Update");
  }

  ngOnInit(): void {
    this.ucitajNaziv();
    this.eventsSubscription = this.mod.subscribe((data)=>{this.posaljiZahtev(data);});
    let token = tokenGetter()
    if (token != null)
      this.signalR.startConnection(token);
  }
  posaljiZahtev(data:number){
    //console.log(data);
    this.aktFunk = [];
    this.hiddLay = [];
    this.brHL = 0;
    this.nizHL  = [];
    this.nizCvorova = [];
    this.nizCvorovaStr = [];
    this.selectedLF = 0;
    this.selectedO = 0;
    this.selectedRM = 0;
    this.selectedPT = 1;
    this.ulazneKolone = [];
    this.izlazneKolone = [];
    this.message = this.shared.getMessage();
    this.kolone = Object.assign([],this.message);
    this.kolone2 = Object.assign([],this.kolone);
    this.idModela = data;
    this.ucitajNazivModela(this.idModela);
    this.http.get("http://localhost:5008/api/Eksperiment/Podesavanja/"+data).subscribe(
      res=>{
        console.log(res);
        this.json1=res;
        this.aktFunk =  this.json1['activationFunctions'];
        (<HTMLInputElement>document.getElementById("bs")).defaultValue = this.json1['batchSize'];
        (<HTMLInputElement>document.getElementById("lr")).defaultValue = this.json1['learningRate'];
        this.hiddLay = this.json1['hiddenLayers'];
        this.brHL = this.hiddLay.length;
         for(let i=0; i<this.brHL;i++)
        {
          this.nizCvorova[i] = this.hiddLay[i];
        }
        this.brojU = this.json1['inputSize'];
        this.brojI = this.json1['outputSize'];
        (<HTMLInputElement>document.getElementById("noe")).defaultValue = this.json1['numberOfEpochs'];
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
        this.nazivModela = res;
        var div = (<HTMLInputElement>document.getElementById("nazivM")).value = this.nazivModela;
      },
      error=>{
        console.log(error);
      }
    )
  }

  ucitajNaziv()
  {
    this.http.get('http://localhost:5008/api/Eksperiment/Eksperiment/Naziv/' + this.idEksperimenta, {responseType: 'text'}).subscribe(
        res=>{
          console.log(res);
          this.nazivEksperimenta = res;
          var div = (<HTMLInputElement>document.getElementById("nazivE")).value = this.nazivEksperimenta;
          console.log(this.nazivEksperimenta);
        },error=>{
          console.log(error.error);
        }
    );
  }

  funkcija(){
    let nizK = <any>document.getElementsByName("ulz"); 
    var ind1;
    for(let i=0; i<nizK.length; i++)
    {
      if(nizK[i].checked)
      {
        ind1 = 0;
        for(let j=0; j<this.ulazneKolone.length; j++)
        {
            if(this.ulazneKolone[j] === nizK[i].value)
            {
                ind1 = 1;
            }
        }
        if(ind1 == 0)
        {
           this.ulazneKolone.push(nizK[i].value);
        }
        console.log(this.ulazneKolone);

        this.kolone.forEach((element:any,index:any) => { 
          if(element === nizK[i].value){
           // console.log(element);
            this.kolone.splice(index,1);
            this.brojU++;
            console.log(this.brojU);
          }
        });
        //console.log(this.kolone);
      }
      if(!nizK[i].checked)
      {
        for(let j=0; j < this.ulazneKolone.length; j++)
        {
          if(this.ulazneKolone[j] == nizK[i].value)
          {
            this.ulazneKolone.splice(j,1);
          }
        }
        console.log(this.ulazneKolone);
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
          this.brojU--;
        }
      }
    }
  }

  funkcija2(){
    let nizK = <any>document.getElementsByName("izl"); 
    var ind2;
    for(let i=0; i<nizK.length; i++)
    {
      if(nizK[i].checked)
      {
        ind2 = 0;
        for(let j=0; j<this.izlazneKolone.length; j++)
        {
            if(this.izlazneKolone[j] === nizK[i].value)
            {
                ind2 = 1;
            }
        }
        if(ind2 == 0)
        {
           this.izlazneKolone.push(nizK[i].value);
        }
        console.log(this.ulazneKolone);

        this.kolone2.forEach((element:any,index:any) => { 
          if(element === nizK[i].value){
           this.kolone2.splice(index,1);
            this.brojI++;
            return;
          }
        });
      }
      if(!nizK[i].checked)
      {
        for(let j=0; j < this.izlazneKolone.length; j++)
        {
          if(this.izlazneKolone[j] == nizK[i].value)
          {
            this.izlazneKolone.splice(j,1);
          }
        }
        console.log(this.izlazneKolone);
        var ind = 0;
        this.kolone2.forEach((element:any,index:any) => { 
          if(element === nizK[i].value){
            ind = 1;
          }
        });
        if(ind == 0)
        {
          this.kolone2.splice(i, 0, nizK[i].value);
          this.brojI--;
          return;
        }
      }
    }
  }



  submit(){

    this.izmeniPodesavanja();
    var nazivEks = (<HTMLInputElement>document.getElementById("nazivE")).value;
    if(!(nazivEks === this.nazivEksperimenta))
    {
       this.proveriE();
       this.sendMessage();
    }
    var nazivMod = (<HTMLInputElement>document.getElementById("nazivM")).value;
    if(!(nazivMod === this.nazivModela))
    {
       this.proveriM();
       this.sendMessage();
    }

  }

  proveriE(){

      var nazivE = (<HTMLInputElement>document.getElementById("nazivE")).value;
      var div = (<HTMLDivElement>document.getElementById("poruka1")).innerHTML;
      if(div === "*Eksperiment sa tim nazivom vec postoji"){
        div = (<HTMLDivElement>document.getElementById("poruka1")).innerHTML = "";
      }
      this.http.put("http://localhost:5008/api/Eksperiment/Eksperiment?ime=" + nazivE + "&id=" + this.idEksperimenta, {responseType : "text"}).subscribe(
        res=>{

        }, error=>{
          this.ucitajNaziv();
          if(error.error === "Postoji eksperiment sa tim imenom")
          {
             var div1 = (<HTMLDivElement>document.getElementById("poruka1")).innerHTML = "*Eksperiment sa tim nazivom vec postoji";
          }
        }
      )
  }

  selectLF(event: any){
    var str = event.target.value;
    this.selectedLF = Number(str);
    console.log(this.selectedLF);
  }
  selectO(event: any){
    var str = event.target.value;
    this.selectedO = Number(str);
  }
  selectRM(event: any){
    var str = event.target.value;
    this.selectedRM = Number(str);
  }
  selectPT(event: any){
    var str = event.target.value;
    this.selectedPT = Number(str);
  }

  uzmiAK(ind:any, event: any){
    for(let i=0;i<this.aktFunk.length;i++)
    {
      if(ind==i)
      {
        var str = event.target.value;
        this.aktFunk[i] = Number(str);
      }
    }
  }

  izmeniPodesavanja(){
    this.s = (<HTMLInputElement>document.getElementById("bs")).value;
    var bs = Number(this.s);
    this.s = (<HTMLInputElement>document.getElementById("lr")).value;
    var lr = Number(this.s);
    var ins = this.brojU;
    this.s = (<HTMLInputElement>document.getElementById("noe")).value;
    var noe = Number(this.s);
    var os = this.brojI;
    this.s = (<HTMLInputElement>document.getElementById("rr")).value;
    var rr = Number(this.s);

    var jsonPod = 
    {
        "ANNType":this.selectedPT,
        "BatchSize": bs,
        "LearningRate": lr,
        "InputSize": ins,
        "NumberOfEpochs": noe,
        "OutputSize": os,
        "LossFunction": this.selectedLF,
        "Optimizer": this.selectedO,
        "Regularization": this.selectedRM,
        "RegularizationRate": rr,
        "HiddenLayers":this.nizCvorova,
        "ActivationFunctions":this.aktFunk
    };
    
    this.http.put("http://localhost:5008/api/Eksperiment/Podesavanja?id=" + this.idModela,jsonPod).subscribe(
      res=>{
        
      },err=>{
        console.log(jsonPod);
        console.log(err.error);
      }
    )
  }

  
  
  proveriM(){

    var nazivE = (<HTMLInputElement>document.getElementById("nazivM")).value;
    var div = (<HTMLDivElement>document.getElementById("poruka2")).innerHTML;
    if(div === "*Model sa tim nazivom vec postoji"){
      div = (<HTMLDivElement>document.getElementById("poruka2")).innerHTML = "";
    }
    this.http.put("http://localhost:5008/api/Eksperiment/Modeli?ime=" + nazivE + "&id=" + this.idModela +"&ideksperimenta=" + this.idEksperimenta, {responseType : "text"}).subscribe(
      res=>{

      }, error=>{
        this.ucitajNazivModela(this.idModela);
        //console.log(error.error);
        if(error.error === "Vec postoji model sa tim imenom")
        {
           var div1 = (<HTMLDivElement>document.getElementById("poruka2")).innerHTML = "*Model sa tim nazivom vec postoji";
        }
      }
    )
  }

  treniraj(){
    
    // this.signalR.ZapocniTreniranje(tokenGetter(),1);
    this.http.post("http://localhost:5008/api/mltest/train", null).subscribe(
      res => {}
    )
  }

  counter1(i:number){
    
    return new Array(i);
  }

  promeni1(br : any){
    if(br == 1)
    {
      if(this.brHL < 9 ){
        this.brHL++;
        this.hiddLay.push(1);
        this.aktFunk.push(1);
        this.nizCvorova.push(1);
      }
      else{
        this.brHL = 9;
      }
    }
    else{

      if(this.brHL >= 1)
        this.brHL--;
      else{
        this.brHL = 0;
      }
      this.hiddLay.pop();
      this.aktFunk.pop();
      this.nizCvorova.pop();
    }
  }

  brojCvorova(ind:number){

    for(let i=0; i<this.brHL; i++){
    
      if(i == ind)
      {
        var x = i;
        this.pom = x.toString();
        var str = (<HTMLInputElement>document.getElementById(this.pom)).value;
        this.nizCvorova[i]=Number(str);
        console.log(this.nizCvorova[i]);
      }
    }
  }

}