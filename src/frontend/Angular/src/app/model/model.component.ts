import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { SharedService } from '../shared/shared.service';
import { SignalRService } from '../services/signal-r.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tokenGetter, url } from '../app.module';
import { isDefined } from '@ng-bootstrap/ng-bootstrap/util/util';
import { ChartData } from 'chart.js';
import { ChartOptions } from 'chart.js';
import { ChartType } from 'chart.js';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ModalService } from '../_modal';
import {Router} from '@angular/router';
import {NotificationsService} from 'angular2-notifications'; 

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  private eventsSubscription!: Subscription;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  @Input() mod!: Observable<number>;
  idEksperimenta: any;
  nazivEksperimenta: any;
  nazivModela : any;
  json: any;
  json1: any;
  jsonSnap: any;
  jsonMetrika: any;
  selectedSS: any;
  snapshots: any[] = [];
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
  public broj : number = 0;
  public crossV : number = 5;
  public flag: boolean = true;

  public pomocna: boolean = false;
  // public testC: any[] = [];
  // public trainC: any[] = [];
  cv: number = 0;

  buttonDisable : boolean = true;

  selectedLF: number = 0;
  selectedO: number = 0;
  selectedRM: number = 0;
  selectedPT: number = 1;

  public ulazneKolone : string[] = [];
  public izlazneKolone : string[] = [];
  public izabraneU : number[] = [];
  public izabraneI : number[] = [];
  public pomocni : number[] = [];

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared: SharedService,public signalR:SignalRService, public modalService : ModalService, private router: Router,private service: NotificationsService) { 
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
  onSuccess(message:any)
  {
    this.service.success('Uspešno',message,{
      position: ["top","left"],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }
  onError(message:any)
  {
    this.service.error('Neuspešno',message,{
      position: ['top','left'],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }

  onInfo(message:any)
  {
    this.service.info('Info',message,{
      position: ['top','left'],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }

  ngOnInit(): void {
    this.eventsSubscription = this.mod.subscribe((data)=>{this.posaljiZahtev(data);});
    let token = tokenGetter()
    if (token != null)
    {
      this.signalR.startConnection(token);
      this.signalR.LossListener();
      //console.log(this.signalR.data);
    }
    this.dajSnapshots();
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
    this.uzmiKolone();
    this.ucitajNazivModela(this.idModela);
    this.http.get(url+"/api/Eksperiment/Podesavanja/"+data).subscribe(
      res=>{
        console.log(res);
        this.json1=res;
        (<HTMLInputElement>document.getElementById("dd3")).value = this.json1.annType;
        this.aktFunk =  this.json1['activationFunctions'];
        (<HTMLInputElement>document.getElementById("bs")).defaultValue = this.json1['batchSize'];
        (<HTMLInputElement>document.getElementById("lr")).defaultValue = this.json1['learningRate'];
        this.hiddLay = this.json1['hiddenLayers'];
        this.brHL = this.hiddLay.length;
         for(let i=0; i<this.brHL;i++)
        {
          this.nizCvorova[i] = this.hiddLay[i];
        }
        if(this.aktFunk.length==0 && this.hiddLay.length ==0)
        {
          
          this.aktFunk[0] = 1;
          this.aktFunk[1] = 1;
          this.hiddLay[0] = 2;
          this.hiddLay[1] = 2;
          this.nizCvorova[0] = 2;
          this.nizCvorova[1] = 2;
         /* this.hiddLay.push(1);
          this.aktFunk.push(1);
          this.nizCvorova.push(1);*/
          this.brHL = 2;
        }
        console.log(this.hiddLay);
        console.log(this.aktFunk);
        this.brojU = this.json1['inputSize'];
        this.brojI = this.json1['outputSize'];
        if(this.brojU == 0 || this.brojI == 0)
        {
          this.buttonDisable = true;
        }
        else
        {
          this.buttonDisable = false;
        }
        (<HTMLInputElement>document.getElementById("noe")).defaultValue = this.json1['numberOfEpochs'];
        (<HTMLInputElement>document.getElementById("rr")).defaultValue = this.json1['regularizationRate'];
        this.crossV = this.json1['kFoldCV'];
        console.log(this.crossV);
        if(this.crossV == 0)
        {
          this.flag = false;
          (<HTMLInputElement>document.getElementById("toggle")).checked = false;
        }
        else{
          this.flag = true;
          (<HTMLInputElement>document.getElementById("toggle")).checked = true;
        }
        this.onSuccess("Zahtev uspesno poslat!");
      },
      error=>{
        console.log(error);
        this.onError("Zahtev nije poslat!");
      }
    )
  }


  ucitajNazivModela(id : any){

  this.http.get(url+"/api/Model/Model/Naziv/"+ id, {responseType: 'text'}).subscribe(
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
           (<HTMLInputElement>document.getElementById(nizK[i].value)).disabled = true;
           this.brojU++;
           if(this.brojU > 0 && this.brojI > 0)
            {
              this.buttonDisable = false;
            }
            console.log(this.brojU);
        }
      }
      if(!nizK[i].checked)
      {
        for(let j=0; j < this.ulazneKolone.length; j++)
        {
          if(this.ulazneKolone[j] === nizK[i].value)
          {
            this.ulazneKolone.splice(j,1);
            (<HTMLInputElement>document.getElementById(nizK[i].value)).disabled = false;
            //console.log(nizK[i].value);
             this.brojU--;
             console.log(this.brojU);
            if(this.brojU == 0)
            {
              this.buttonDisable = true;
            }
          }
        }
      }
    }
  }

  napraviModel()
  {
    console.log(this.idEksperimenta);
    var ime = (<HTMLInputElement>document.getElementById("bs1")).value;
    var opis = (<HTMLInputElement>document.getElementById("opisM")).value;
    var div = (<HTMLDivElement>document.getElementById("greska")).innerHTML;
    if(ime === ""){
      ime = (<HTMLInputElement>document.getElementById("greska")).innerHTML="*Polje ne sme biti prazno";
      return;
    }
    if(div === "*Model sa tim nazivom vec postoji"){
      div = (<HTMLDivElement>document.getElementById("greska")).innerHTML = "";
    }
    this.http.post(url+"/api/Model/Modeli?ime=" + ime + "&id=" + this.idEksperimenta + "&opis=" + opis + "&snapshot=" + this.selectedSS,null,{responseType: 'text'}).subscribe(
      res=>{
        console.log(res);
        ime = (<HTMLInputElement>document.getElementById("greska")).innerHTML="";
        this.onSuccess("Model je uspesno napravljen");
      },
      error=>{
        console.log(error.error);
        this.onError("Model nije napravljen!");
        if(error.error === "Vec postoji model sa tim imenom")
        {
           var div1 = (<HTMLDivElement>document.getElementById("greska")).innerHTML = "*Model sa tim nazivom vec postoji";
           this.onError("Model sa tim nazivom vec postoji");
        }
      }
    );
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
           (<HTMLInputElement>document.getElementById(nizK[i].value + "1")).disabled = true;
           this.brojI++;
           if(this.brojI > 0 && this.brojU > 0)
            {
              this.buttonDisable = false;
            }
            console.log(this.brojI);
        }
      }
      if(!nizK[i].checked)
      {
        for(let j=0; j < this.izlazneKolone.length; j++)
        {
          if(this.izlazneKolone[j] === nizK[i].value)
          {
            this.izlazneKolone.splice(j,1);
            (<HTMLInputElement>document.getElementById(nizK[i].value + "1")).disabled = false;
            //console.log(nizK[i].value);
             this.brojI--;
             console.log(this.brojI);
            if(this.brojI == 0)
            {
              this.buttonDisable = true;
            }
          }
        }
      }
    }
  }



  submit(){
    this.izmeniPodesavanja();
    this.uzmiCekirane();
    var nazivMod = (<HTMLInputElement>document.getElementById("nazivM")).value;
    if(!(nazivMod === this.nazivModela))
    {
       this.proveriM();
       this.sendMessage();
    }

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

  uzmiKolone()
  {
    console.log(this.idModela);
    this.http.get(url+"/api/Eksperiment/Podesavanja/Kolone?id=" + this.idModela).subscribe(
        res=>{
          this.pomocni=Object.assign([],res);
          this.izabraneU=Object.assign([],this.pomocni[0]);
          this.izabraneI=Object.assign([],this.pomocni[1]);
          this.cekiraj();
        },error=>{
          console.log(error.error);
        }
    );
  }

  uzmiCekirane(){
    var ulazne=[];
    var izlazne=[];
    let nizU = <any>document.getElementsByName("ulz"); 
    for(let i =0;i<nizU.length;i++){
      if(nizU[i].checked==true){
        for(let j =0;j<this.message.length;j++){
          if(nizU[i].value==this.message[j]){
            ulazne.push(j);
          }
        }
      }
    }
    let nizI = <any>document.getElementsByName("izl");
    for(let i =0;i<nizI.length;i++){
      if(nizI[i].checked==true){
        for(let j =0;j<this.message.length;j++){
          if(nizI[i].value==this.message[j])
            izlazne.push(j);
        }
      }
    }
    this.http.post(url+"/api/Eksperiment/Podesavanja/Kolone?id="+this.idModela,{ulazne,izlazne}).subscribe(
      res=>{
        console.log(res);
      }
    );
  }


  cekiraj()
  {
    for(let i=0;i<this.message.length;i++)
      for(let j=0;j<this.izabraneU.length;j++)
        if(i==this.izabraneU[j])
        {
          let nizU = <any>document.getElementsByName("ulz"); 
          for(let p=0;p<nizU.length;p++)
            if(nizU[p].value===this.message[i])
            {
              nizU[p].checked=true;
            }
        }
    for(let i=0;i<this.message.length;i++)
      for(let j=0;j<this.izabraneI.length;j++)
        if(i==this.izabraneI[j])
        {
          let nizI = <any>document.getElementsByName("izl"); 
          for(let p=0;p<nizI.length;p++)
            if(nizI[p].value===this.message[i])
            {
              nizI[p].checked=true;
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
    if(this.flag == true){
      var str = (<HTMLInputElement>document.getElementById("crossV")).value;
      this.cv = Number(str);
    }
    else{
      this.cv = 0;
    }

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
        "ActivationFunctions":this.aktFunk,
        "KFoldCV":this.cv
    };
    
    this.http.put(url+"/api/Eksperiment/Podesavanja?id=" + this.idModela,jsonPod,{responseType:"text"}).subscribe(
      res=>{
        this.onSuccess("Podesavanja uspesni izmenjena!");
      },err=>{
        console.log(jsonPod);
        console.log(err.error);
        this.onError("Podesavanja nisu izmenjena!");
      }
    )
  }

  
  
  proveriM(){

    var nazivM = (<HTMLInputElement>document.getElementById("nazivM")).value;
    var div = (<HTMLDivElement>document.getElementById("poruka2")).innerHTML;
    if(div === "*Model sa tim nazivom vec postoji"){
      div = (<HTMLDivElement>document.getElementById("poruka2")).innerHTML = "";
      this.onError("Model sa tim nazivom vec postoji");
    }
    this.http.put(url+"/api/Model/Modeli?ime=" + nazivM + "&id=" + this.idModela +"&ideksperimenta=" + this.idEksperimenta, {responseType : "text"}).subscribe(
      res=>{
          this.onSuccess("Naziv modela uspesno izmenjen!");
      }, error=>{
        this.ucitajNazivModela(this.idModela);
        //console.log(error.error);
        if(error.error === "Vec postoji model sa tim imenom")
        {
           var div1 = (<HTMLDivElement>document.getElementById("poruka2")).innerHTML = "*Model sa tim nazivom vec postoji";
           this.onError("Model sa tim nazivom vec postoji");
        }
      }
    )
  }

  treniraj(broj:number){
    
    (<HTMLDivElement>document.getElementById('grafik')).scrollIntoView();
    
    if(broj == 1){
      this.izmeniPodesavanja();
      this.uzmiCekirane();
      console.log("sacuvano");
    }
    // this.signalR.ZapocniTreniranje(tokenGetter(),1);
    this.signalR.clearChartData();
    this.chart?.update();
    this.http.get(url+"/api/Model/Model/Treniraj?id="+this.idModela,{responseType:"text"}).subscribe(
      res => {
        let subscription = this.signalR.switchChange.asObservable().subscribe(
          value=>{
            this.chart?.update();
          }
        )
        this.onInfo("Trening je zapocet.");
      }
    )
  }

  counter1(i:number){
    
    return new Array(i);
  }

  promeni1(br : any){
    if(br == 1)
    {
      if(this.brHL < 10 ){
        this.brHL++;
        this.hiddLay.push(1);
        this.aktFunk.push(1);
        this.nizCvorova.push(1);
      }
      else{
        this.brHL = 10;
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

        if(Number(str) >= 14)
        {
           this.broj = 14;
           (<HTMLInputElement>document.getElementById(this.pom)).value = "14";
        }
        else
          if(Number(str) < 1)
          {
            this.broj = 1;
            (<HTMLInputElement>document.getElementById(this.pom)).value = "1";
          }
        else{
          this.broj = Number(str);
        }
        this.nizCvorova[i]=this.broj;
        console.log(this.nizCvorova[i]);
      }
    }
  }

  public chartOptions: any = {
    scaleShowVerticalLines: true,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 18
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Vrednost loss-a',
          color: 'white'
        },
        grid: {
          display: false
        },
        ticks: {
          beginAtZero: true,
          color: 'white'
        },
      },
      x:{
        title: {
          display: true,
          text: 'Broj epoha',
          color: 'white'
        },
        grid: {
          display: false
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };
  public chartLabels: string[] = ['Real time data for the chart'];
  public chartType: string = 'line';
  public chartLegend: boolean = true;


  dugmeCV(){

    if(this.flag == true){
      this.flag = false;
      (<HTMLInputElement>document.getElementById("toggle")).checked = false;
    }
    else{
      this.flag = true;
      (<HTMLInputElement>document.getElementById("toggle")).checked = true;
    }
  }

  promeniK(){
    
    var str = (<HTMLInputElement>document.getElementById("crossV")).value;

    if(Number(str) > 20)
    {
       (<HTMLInputElement>document.getElementById("crossV")).value = "20";
     /*  (<HTMLInputElement>document.getElementById("crossV")).value = "2";*/
    }
    else
    if(Number(str) < 2)
    {
      (<HTMLInputElement>document.getElementById("crossV")).value = "2";
      /*(<HTMLInputElement>document.getElementById("crossV")).value = "";*/
    }
  }

  kreirajModel()
  {
    this.napraviModel();
    //this.submit();
  }

  dajSnapshots()
  {
    this.http.get(url+"/api/File/Snapshots?id="+this.idEksperimenta).subscribe(
      res => {
        this.jsonSnap=res;
        this.snapshots = Object.values(this.jsonSnap);
      },
      error =>{
        console.log(error.error);
      }
    )
  }

 imeS(ime: string)
 {
   (<HTMLButtonElement>document.getElementById("dropdown")).innerHTML = ime;
 }

  selectSnapshot(id: any)
  {
     this.http.get(url+"/api/Model/Kolone?idEksperimenta=" + this.idEksperimenta + "&snapshot="+ id).subscribe(
     (response: any)=>{
         console.log(response);
         this.kolone = Object.assign([],response);
         this.kolone2 = Object.assign([],this.kolone);

      },error =>{
       console.log(error.error);
     }
    );
    this.selectedSS=id;
    console.log(this.selectedSS);
  }

  dajMetriku(event: any)
  {
    this.http.get(url+"/api/Model/metrika?problemType=" + event.target.value).subscribe(
      res => {
        console.table(res);
        this.jsonMetrika = Object.values(res);
        this.checkType(event.target.value);
      },
      error => {
        console.log(error.error);
      }
    )
  }

  checkType(event: any)
  {
    if(event==1)
    {
      this.setujMetrikuK();
    }
    else if(event==0)
    {
      this.setujMetrikuR();
    }
  }

  setujMetrikuK()
  {
    var br = Number(this.jsonMetrika[0]['Accuracy']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("actest")).innerHTML = br;
    var br = Number(this.jsonMetrika[1]['Accuracy']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("actrain")).innerHTML = br;

    var br = Number(this.jsonMetrika[0]['BalancedAccuracy']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("batest")).innerHTML = br;
    var br = Number(this.jsonMetrika[1]['BalancedAccuracy']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("batrain")).innerHTML = br;

    var br = Number(this.jsonMetrika[0]['CrossEntropyLoss']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("celtest")).innerHTML = br;
    var br = Number(this.jsonMetrika[1]['CrossEntropyLoss']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("celtrain")).innerHTML = br;

    var br = Number(this.jsonMetrika[0]['F1Score']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("f1test")).innerHTML = br;
    var br = Number(this.jsonMetrika[1]['F1Score']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("f1train")).innerHTML = br;

    var br = Number(this.jsonMetrika[0]['F1Score']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("htest")).innerHTML = br;
    var br = Number(this.jsonMetrika[1]['F1Score']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("htrain")).innerHTML = br;

    var br = Number(this.jsonMetrika[0]['Precision']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("ptest")).innerHTML = br;
    var br = Number(this.jsonMetrika[1]['Precision']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("ptrain")).innerHTML = br;

    var br = Number(this.jsonMetrika[0]['Recall']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("rtest")).innerHTML = br;
    var br = Number(this.jsonMetrika[1]['Recall']).toFixed(3);
    (<HTMLTableColElement>document.getElementById("rtrain")).innerHTML = br;
  }

  setujMetrikuR()
  {
    
  }


  // dajMetriku1()
  // {
  //   this.dajMetriku(this.selectedPT);
  // }
}