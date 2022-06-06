import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { Observable, Subscription } from 'rxjs';
import { url } from '../app.module';
import {NotificationsService} from 'angular2-notifications';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-modeli',
  templateUrl: './modeli.component.html',
  styleUrls: ['./modeli.component.css']
})

export class ModeliComponent implements OnInit {
  private eventsSubscription!: Subscription;
 // @Output() PosaljiModel = new EventEmitter<number>();

  @Input() primljenM! : Observable<any>;

  @Output() PosaljiIzabranModel:EventEmitter<number> = new EventEmitter<number>();
  
  bla: string = 'p0';

  json: any;
  json1: any;
  jsonStatistika1: any;
  jsonStatistika: any;
  jsonStatistikaR: any[] = [];
  uporediviM:  any[] = [];
  modeli : any[] = [];
  id: any;
  trenId: any;
  date: String ='';
  imeModela: String ='';
  nizD: any[] = [];
  selektovanModel: string = '';
  ActivateAddEdit: boolean = false;
  messageReceived: any;
  subscriptionName: Subscription = new Subscription;
  izabranId: number = -1;
  type: any;
  brUp: number = 0;
  imenaK: string [] = [];
  imaTestni: boolean = true;
  public testR: any[] = [];
  public trainR: any[] = [];
  public mtest: any[] = [];
  public mtrain: any[] = [];
  public nizPoljaTest: any[] = [];
  public nizPoljaTrain: any[] = [];
  public maxNizaT: any;
  public maxNizaTr: any;
  public matTrainData: any[] = [];
  public indeksiData: any[]=[];
  public charts: any;
  public nizGlavni: any[] = [];
  public glavniNiz: any[] = [];

  public sortedBy: string = 'd';
  public descending: boolean = true;

  public accuracyBest: number = Number.MIN_VALUE;
  public balancedAccuracyBest: number = Number.MIN_VALUE;
  public crossEntropyLossBest: number = Number.MAX_VALUE;
  public hammingLossBest: number = Number.MAX_VALUE;
  public precisionBest: number = Number.MIN_VALUE;
  public recallBest: number = Number.MIN_VALUE;
  public f1ScoreBest: number = Number.MIN_VALUE;

  public maeBest: number = Number.MAX_VALUE;
  public mseBest: number = Number.MAX_VALUE;
  public rseBest: number = Number.MAX_VALUE;
  public r2Best: number = Number.MIN_VALUE;
  public adjustedR2Best: number = Number.MIN_VALUE;

  public flag : boolean = false;

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared:SharedService,private service: NotificationsService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.id = params['id'];
        // console.log(this.id);
      }
    )
  }

  ngOnInit(): void {
    this.eventsSubscription = this.primljenM.subscribe((data)=>{this.primiModel(data);});
    this.ucitajImeE();
    this.subscriptionName = this.shared.getUpdate().subscribe
    (
      message => {
        this.ActivateAddEdit = false;
        this.messageReceived = message;
        // console.log(this.messageReceived);
       // this.ocisti();
        this.ngOnInit();
      }
    );
    // console.log("Zovem se sad!!!");
  }

  primiModel(data : any){
    this.ucitajModel();
  }
  onSuccess(message:any)
  {
    this.service.success('Success',message,{
      position: ["top","left"],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }
  onError(message:any)
  {
    this.service.error('Unsuccessful',message,{
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

  ucitaj(){
    this.ucitajImeE();
  }

  // send(id:number){
  //   this.PosaljiModel.emit(id);
  // }

  ocisti(){
    (<HTMLInputElement>document.getElementById("imeM")).value='';
  }

  // napraviModel(){
  //   // console.log(this.id);
  //   var ime = (<HTMLInputElement>document.getElementById("imeM")).value;
  //   var div = (<HTMLDivElement>document.getElementById("greska")).innerHTML;
  //   if(ime === ""){
  //     ime = (<HTMLInputElement>document.getElementById("greska")).innerHTML="*This field can not be empty.";
  //     return;
  //   }
  //   if(div === "*Model sa tim nazivom vec postoji"){
  //     div = (<HTMLDivElement>document.getElementById("greska")).innerHTML = "";
  //   }
  //   this.http.post(url+"/api/Model/Modeli?ime=" + ime + "&id=" + this.id,null,{responseType: 'text'}).subscribe(
  //     res=>{
  //       // console.log(res);
  //       this.ucitajModel();
  //       ime = (<HTMLInputElement>document.getElementById("greska")).innerHTML="";
  //       this.onSuccess("Model was successfully created.");
  //     },
  //     error=>{
  //       console.log(error.error);
  //       this.onError("Model nije napravljen!");
  //       if(error.error === "Model with that name already exists.")
  //       {
  //          var div1 = (<HTMLDivElement>document.getElementById("greska")).innerHTML = "*Model sa tim nazivom vec postoji";
  //          this.onError("Model sa tim nazivom vec postoji");
  //       }
  //     }
  //   );
  // }

  // treba da se zove ucitaj model
  ucitajModel()
  {
    this.ActivateAddEdit=true;
    this.http.get(url+'/api/Model/Modeli/' + this.id).subscribe(
        res=>{
          this.json = res;
          this.modeli = Object.values(this.json);
          
          this.formatirajDatum();
          this.sortModels();
          
          if (this.modeli.length > 0) {
            var id = this.modeli[0].id;
            this.modelDetaljnije(id);
            this.uzmiId(id);
            this.selektovanModel = 'p0';
            if(this.flag == false)
            {
              this.flag = true;
            }
          }
          else
          {
            if(this.flag == true)
            {
              this.flag = false;
            }
          }
        },
        error=>{
          console.error(error.error);

              if(this.flag == true)
              {
                this.flag = false;
              }
        }
    );
  }

  sortModels() {
    var ret = 1;
    if (this.descending) {
      ret = -1
    }
    if (this.sortedBy == 'd') {
      this.modeli.sort((a, b) => {
        const date1Splits = a.createdDate.split(".");
        const date2Splits = b.createdDate.split(".");
        const date1 = new Date(date1Splits[2], date1Splits[1], date1Splits[0]);
        const date2 = new Date(date2Splits[2], date2Splits[1], date2Splits[0]);
        
        if (date1.getTime() > date2.getTime()) return ret;
        else if (date1.getTime() < date2.getTime()) return -ret;
        else return 0;
      });
    }
    else if (this.sortedBy == 'n') {
      this.modeli.sort((a, b) => {
        if (a.name > b.name) return ret;
        else if (a.name < b.name) return -ret;
        else return 0;
      });
    }
  }

  changeSort(SortBy: string) {
    if (this.sortedBy == SortBy)
    this.descending = !this.descending;
    else {
      this.sortedBy = SortBy;
      this.descending = true;
    }
    console.log(this.descending);
    this.sortModels();
  }

  formatirajDatum()
  {
    for(let i=0;i<this.modeli.length;i++)
    {
      this.date=this.modeli[i].createdDate.split('T')[0];
      this.nizD=this.date.split('-');
      this.swap(this.nizD);
      this.modeli[i].createdDate=this.nizD.join('.');
    }
  }

  swap(niz: any[])
  {
     var x=niz[2];
     var y=niz[0];
     niz[0]=x;
     niz[2]=y+'.';
  }

  ucitajImeE(){
    this.http.get(url+'/api/Eksperiment/Eksperiment/Naziv/' + this.id,{responseType: 'text'}).subscribe(
        res=>{
          this.ucitajModel();
        },
        error=>{
          console.log(error.error);
        }
    );
  }

  handleKeyUp(event: any){
     if(event.keyCode === 13){
      // this.napraviModel();
      this.ocisti();
     }
  }

  modelDetaljnije(id: any)
  {
    this.ucitajStatistiku(id);
    this.compareModels(id);
    this.http.get(url+"/api/Model/Detaljnije?id=" + id).subscribe(
      res => {
        this.json1=res;
        console.log(this.json1);
        (<HTMLDivElement>document.getElementById("n")).innerHTML=this.json1['name'];
        (<HTMLDivElement>document.getElementById("opis")).innerHTML=this.json1['opis'];
        (<HTMLDivElement>document.getElementById("ann")).innerHTML=this.json1['problemType'];
        (<HTMLDivElement>document.getElementById("opt")).innerHTML=this.json1['optimizacija'];
        (<HTMLDivElement>document.getElementById("eph")).innerHTML=this.json1["epohe"];
        (<HTMLDivElement>document.getElementById("snap")).innerHTML=this.json1["snapshot"];
        (<HTMLDivElement>document.getElementById("ce")).innerHTML=this.json1["trenutnaEpoha"];
        for(let i=0;i<this.modeli.length;i++)
        {
          if(this.modeli[i].id==id)
            (<HTMLDivElement>document.getElementById("d")).innerHTML=this.modeli[i].createdDate;
        }
        if((<HTMLDivElement>document.getElementById("ann")).innerHTML=="Regression")
        {
          this.type=0;
          console.log(this.type);
          (<HTMLDivElement>document.getElementById("statistikaK")).style.display="none";
          //(<HTMLDivElement>document.getElementById("statistikaR")).style.display="block";
          // (<HTMLDivElement>document.getElementById("statistikaK")).style.visibility="hidden";
          // (<HTMLDivElement>document.getElementById("statistikaR")).style.visibility="visible";

          // (<HTMLDivElement>document.getElementById("ar2Data")).innerHTML=this.jsonStatistika['adjustedR2'];
          // (<HTMLDivElement>document.getElementById("maeData")).innerHTML=this.jsonStatistika['mae'];
          // (<HTMLDivElement>document.getElementById("mseData")).innerHTML=this.jsonStatistika['mse'];
          // (<HTMLDivElement>document.getElementById("r2Data")).innerHTML=this.jsonStatistika['r2'];
          // (<HTMLDivElement>document.getElementById("rseData")).innerHTML=this.jsonStatistika['rse'];
        }
        else if((<HTMLDivElement>document.getElementById("ann")).innerHTML=="Classification")
        {
          this.type=1;
          // console.log(this.type);
          // (<HTMLDivElement>document.getElementById("statistikaR")).style.display="none";
          (<HTMLDivElement>document.getElementById("statistikaK")).style.display="block";
          // (<HTMLDivElement>document.getElementById("statistikaR")).style.visibility="hidden";
          // (<HTMLDivElement>document.getElementById("statistikaK")).style.visibility="visible";

          (<HTMLDivElement>document.getElementById("aData")).innerHTML=this.jsonStatistika['accuracy'];
          (<HTMLDivElement>document.getElementById("bData")).innerHTML=this.jsonStatistika['balancedAccuracy'];
          (<HTMLDivElement>document.getElementById("cData")).innerHTML=this.jsonStatistika['crossEntropyLoss'];
          (<HTMLDivElement>document.getElementById("fData")).innerHTML=this.jsonStatistika['f1Score'];
          (<HTMLDivElement>document.getElementById("hData")).innerHTML=this.jsonStatistika['hammingLoss'];
          (<HTMLDivElement>document.getElementById("pData")).innerHTML=this.jsonStatistika['precision'];
          (<HTMLDivElement>document.getElementById("rData")).innerHTML=this.jsonStatistika['recall'];
          
          var max = this.nadjiMaxTrain();

          this.matTrainData = this.jsonStatistika['confusionMatrix'];

          var nizJson = [];
          (<HTMLButtonElement>document.getElementById("dugmeMetrika")).style.pointerEvents='unset';
          if (this.matTrainData == null)
          {
            this.matTrainData = [];
            (<HTMLButtonElement>document.getElementById("dugmeMetrika")).style.pointerEvents='none';
          }
          for(let i=this.matTrainData.length-1; i>=0; i--)
          {
            for(let j=this.matTrainData.length-1; j>=0; j--)
              this.matTrainData[i][j]=Number(Number(this.matTrainData[i][j]/max).toFixed(3));
            this.indeksiData[i]=i;  
            nizJson.push({name: this.indeksiData[i] + '', data: this.matTrainData[i]});
          }
          // console.log(this.matTrainData);

          var options = {
            chart: {
              type: 'heatmap',
              foreColor: '#ffffff'
            },
            series: nizJson,
            xaxis: {
              categories: this.indeksiData
            },
            legend: {
              labels: {
                  colors: '#ffffff',
                  useSeriesColors: false
              }
            },
            title: {
              text: undefined,
              align: 'left',
              margin: 10,
              offsetX: 0,
              offsetY: 0,
              floating: false,
              style: {
                fontSize:  '14px',
                fontWeight:  'bold',
                fontFamily:  undefined,
                color:  '#ffffff'
              },
          },
            theme: {
              mode: 'light', 
              palette: 'palette10', 
              monochrome: {
                  enabled: true,
                  color: '#1c0e5c',
                  shadeTo: '#fca2ac',
                  shadeIntensity: 0.25
              }
          },
          plotOptions: {
            heatmap: {
              colorScale: {
                ranges: [{
                    from: 0,
                    to: 0.25,
                    color: '#ff70a7'
                  },
                  {
                    from: 0.26,
                    to: 0.50,
                    color: '#bd20ba'
                  },
                  {
                    from: 0.51,
                    to: 0.75,
                    color: '#630585'
                  },
                  {
                    from: 0.76,
                    to: 1,
                    color: '#490661'
                  }]
              }}
            }

          }
          this.charts = new ApexCharts(document.querySelector("#chart2"), options);

        }
      },
      error => {
        console.log(error.error);
      }
    )
  }

  nadjiMaxTrain()
  {
    var p=0;
    var t;
    this.mtrain = this.jsonStatistika['confusionMatrix'];
    if (this.mtrain == null) this.mtrain = [];
    // console.log(this.mtrain);
    for(let i=0;i<this.mtrain.length;i++)
       for(let j=0;j<this.mtrain[i].length;j++)
       {
          this.nizPoljaTrain[p]=this.mtrain[i][j];
          p++;
       }

    for(let i=0;i<this.nizPoljaTrain.length-1;i++)
    {
      for(let j=1;j<this.nizPoljaTrain.length;j++)
       {
         if(this.nizPoljaTrain[i]<this.nizPoljaTrain[j])
         {
           t=this.nizPoljaTrain[i];
           this.nizPoljaTrain[i]=this.nizPoljaTrain[j];
           this.nizPoljaTrain[j]=t;
         }
       }
    }
     this.maxNizaTr=this.nizPoljaTrain[0];
    //  console.log(this.maxNizaTr);
     return this.maxNizaTr; 
  }

  prikaziMatrice()
  {
      this.charts.render();
  }

  

  //  checkType()
  //  {
  //    if((<HTMLDivElement>document.getElementById("ann")).innerHTML==="Regression")
  //      this.type=0;
  //    else if((<HTMLDivElement>document.getElementById("ann")).innerHTML==="Classification")
  //     this.type=1;
  //    console.log(this.type);
  //  }

  ucitajStatistiku(id: any)
  {
    this.http.get(url+"/api/Statistics/Model?id=" + id).subscribe(
      res => {
        this.jsonStatistika1=res;
        if(this.jsonStatistika1.length>=1)
        {
           this.jsonStatistikaR=this.jsonStatistika1;
           console.log(this.jsonStatistikaR);
        }
        else
           this.jsonStatistika=this.jsonStatistika1;
        // // console.log(this.jsonStatistika['ConfusionMatrix']);
        // // this.trainR=Object.assign([],this.jsonStatistika[1]);
        // // this.testR=Object.assign([],this.jsonStatistika[0]);
        // // console.log(this.trainR);
        
      },
      error => {
        console.log(error.error);
      }
    )
  }

  promeni(event:any){
    if(this.selektovanModel != ""){
      (<HTMLDivElement>document.getElementById(this.selektovanModel)).className = "model-selected-false";
      // (<HTMLDivElement>document.getElementById(this.selektovanModel)).style.background="#C4C4C4";
      // (<HTMLDivElement>document.getElementById(this.selektovanModel)).style.color="white";
      // (<HTMLDivElement>document.getElementById(this.selektovanModel)).style.transform="scale(1)";
    }
    this.selektovanModel = event.target.id;
    (<HTMLDivElement>document.getElementById(event.target.id)).className = "model-selected-true";
    // (<HTMLDivElement>document.getElementById(event.target.id)).style.background="linear-gradient(162.06deg,#fa7795 -16.65%,#f0859e 97.46%)";
    // (<HTMLDivElement>document.getElementById(event.target.id)).style.transform="scale(1.04)";
  }

  Izmeni()
  {
    for(let i=0;i<this.modeli.length;i++)
    {
      if(this.modeli[i].id==this.izabranId)
      {
        (<HTMLDivElement>document.getElementById("bodyc")).innerHTML=this.modeli[i].opis;
      }
    }
  }

  izmeniOpis()
  {
    var a = (<HTMLDivElement>document.getElementById("bodyc")).innerHTML;
    for(let i=0;i<this.modeli.length;i++)
    {
      if(this.modeli[i].id==this.izabranId)
      {
        this.http.put(url+"/api/Model/Modeli/Opis?id=" + this.modeli[i].id + "&opis=" + a, {responseType : "text"}).subscribe(
          res=>{
          },error=>{
            (<HTMLDivElement>document.getElementById("opis")).innerHTML=a;
            this.ucitajModel();
            this.onSuccess("Description was successfully edited.");
          }
        );
      }
    }
  }

  uzmiId(id: number)
  {
    this.izabranId=id;
    sessionStorage.setItem('idModela',id+"");
  }

  obrisiModel()
  {
    for(let i=0;i<this.modeli.length;i++)
    {
      if(this.modeli[i].id==this.izabranId)
      {
        this.http.delete(url+'/api/Model/Modeli/' + this.modeli[i].id).subscribe(
          res=>{
              //console.log(res);
               this.onSuccess("Model je uspesno obrisan");
          },
          error=>{
            console.log(error.error);
            this.ucitajModel();
            var div = (<HTMLDivElement>document.getElementById("m")).style.visibility="hidden";
            // this.onError("Model nije obrisan!");
            this.onSuccess("Model was successfully deleted.");
          }
        )
      }
    }
  }

  downloadModel()
  {
    for(let i=0;i<this.modeli.length;i++)
    {
      if(this.izabranId==this.modeli[i].id)
        this.imeModela = this.modeli[i].name;
    }
    this.http.post(url+"/api/File/downloadModel/" + this.id + "?modelName=" + this.imeModela, null, {responseType: 'text'}).subscribe(
      res=>{
        saveAs(new Blob([res]), this.imeModela + ".pt");
        this.onSuccess("Model was successfully downloaded.")
      },
      error=>{
        console.log(error.error);
      }
      
    );
  }

  public K:any[] = [];
  compareModels(idM: any)
  {
    this.nizGlavni = [];
    this.glavniNiz = [];
    var idKolonaPoredjenje: any[] = [];
    var imeKolonaPoredjenje: any[] = [];
    var brUporedivihPoK=0;
    var brK=0;

    this.http.get(url+"/api/Statistics/Comparison?experimentId=" + this.id + "&modelId=" + idM).subscribe(
      res=>{
        this.uporediviM=Object.assign([],res);
        
        for(let i=0;i<this.uporediviM.length;i++)
        {
          if(idM!==this.uporediviM[i]["id"])
            brUporedivihPoK++;

          else
          {
            this.imenaK[brK]=this.uporediviM[i]["kolona"];
            brK++;
          }
        }
        this.brUp=brUporedivihPoK/brK;
        
        for(let i=0;i<this.uporediviM.length;i=i+brK)
          idKolonaPoredjenje.push(this.uporediviM[i].id);

        for(let i=0;i<idKolonaPoredjenje.length;i++)
        {
          for(let j=0;j<this.modeli.length;j++)
          {
            if(this.modeli[j].id==idKolonaPoredjenje[i])
              imeKolonaPoredjenje.push(this.modeli[j].name);
          }
        }
        var pom=[];
        for(let i=0;i<brK;i++)
        {
          pom=[];
          for(let j=i;j<this.uporediviM.length;j=j+brK)
            pom.push(this.uporediviM[j]);
          this.glavniNiz.push(pom);
        }
        
        var pom1 = [];
        if(brK==this.uporediviM.length)
        {
          for(let i=0;i<this.uporediviM.length;i++)
          {
            pom1.push(Object.assign([],this.uporediviM[i]));
            this.nizGlavni.push(pom1);
            pom1=[];
          }
          
        }
        else
          this.nizGlavni=this.glavniNiz;
        
        for(let i=0;i<this.nizGlavni.length;i++)
        {
          for(let j=0;j<this.modeli.length;j++)
            for(let k=0;k<this.brUp+1;k++)
              if(this.nizGlavni[i][k].id==this.modeli[j].id)
                this.nizGlavni[i][k].id=this.modeli[j].name;  
        }
        
        this.K=this.nizGlavni[0];
        
        
        // Compute best scores
        if (this.type == 0) {
          for (const el of this.nizGlavni) {
            if (el.mae * el.mse * el.rse * el.r2 != 0.0) {
              if (el.mae < this.maeBest)
                this.maeBest = el.mae;
              if (el.mse < this.mseBest)
                this.mseBest = el.mse;
              if (el.rse < this.rseBest)
                this.rseBest = el.rse;
              if (el.r2 > this.r2Best)
                this.r2Best = el.r2;
              if (el.adjustedR2 > this.adjustedR2Best)
                this.adjustedR2Best = el.adjustedR2;
            }
            else {
              console.log(el.id);
            }
          }
        }
        else {
          for (const el of this.nizGlavni[0]) {
            if (el.accuracy * el.balancedAccuracy * el.crossEntropyLoss * el.hammingLoss * el.precision != 0) {
              if (el.accuracy > this.accuracyBest)
                this.accuracyBest = el.accuracy;
              if (el.balancedAccuracy > this.balancedAccuracyBest)
                this.balancedAccuracyBest = el.balancedAccuracy;
              if (el.crossEntropyLoss < this.crossEntropyLossBest)
                this.crossEntropyLossBest = el.crossEntropyLoss;
              if (el.hammingLoss < this.hammingLossBest)
                this.hammingLossBest = el.hammingLoss;
              if (el.precision > this.precisionBest)
                this.precisionBest = el.precision;
              if (el.recall > this.recallBest)
                this.recallBest = el.recall;
              if (el.f1Score > this.f1ScoreBest)
                this.f1ScoreBest = el.f1Score;
            }
          }
        }
      },
      error=>{
        console.log(error.error);
      }
    );
  }



  nastaviTreniranje(){

    this.PosaljiIzabranModel.emit(this.izabranId);
  }
}


