import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { max, Observable, Subscription } from 'rxjs';
import { SharedService } from '../shared/shared.service';
import { SignalRService } from '../services/signal-r.service';
import { tokenGetter, url } from '../app.module';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ModalService } from '../_modal';
import {Router} from '@angular/router';
import {NotificationsService} from 'angular2-notifications'; 
import * as ApexCharts from 'apexcharts';
import { WebglPlot, WebglLine, ColorRGBA, WebglThickLine, WebglPolar, WebglStep, WebglSquare } from "webgl-plot";

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  private eventsSubscription!: Subscription;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  @Input() idS! : Observable<number>;

  @Input() idM! : Observable<number>;

  @Output() PosaljiSnapshot2:EventEmitter<number> = new EventEmitter<number>();

  @Output() PosaljiModel:EventEmitter<number> = new EventEmitter<number>();

  @Input() snapshots!: any[];

   @Input() mod!: Observable<number>;

  idEksperimenta: any;
  nazivEksperimenta: any;
  nazivModela : any;
  json: any;
  json1: any;
  jsonSnap: any;
  jsonMetrika: any;
  jsonModel: any;
  selectedSS: any;
  selectedimeSS : string = "";
  tip: number=1;
  imaTestni: boolean = true;
  // snapshots: any[] = [];
  public aktFunk: any[] = [];
  public hiddLay: any[] = [];


  private weights: number[][][] = [];
  private absoluteWeightMean: number[] = [];

  
  public kolone: any[] = [];
  message: any;
  public idModela : any;

  public brojU : number = 0;
  public brojI : number = 0;
  public kolone2 : any[] = [];
  public pomocniNizKolone: any[] = [];
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

  public momentum: boolean=false;
  public pomocna: boolean = false;
  public prikazi: boolean = false;
  public prikazi1: boolean = false;
  public testR: any[] = [];
  public trainR: any[] = [];
  public mtest: any[] = [];
  public mtrain: any[] = [];
  public nizPoljaTest: any[] = [];
  public nizPoljaTrain: any[] = [];
  public maxNizaT: any;
  public maxNizaTr: any;
  cv: number = 0;

  buttonDisable : boolean = true;
  buttonPlay:boolean = true;
  buttonPause: boolean = false;
  buttonContinue: boolean= false;

  flagP : boolean = false;

  selectedLF: number = 4;
  selectedO: number = 0;
  selectedRM: number = 0;
  selectedPT: number = 1;

  public ulazneKolone : string[] = [];
  public izlazneKolone : string[] = [];
  public izabraneU : number[] = [];
  public izabraneI : number[] = [];
  public pomocni : number[] = [];

  public atest: String = "";
  public atrain: String = "";
  public btest: String = "";
  public btrain: String = "";
  public ctest: String = "";
  public ctrain: String = "";
  public ftest: String = "";
  public ftrain: String = "";
  public htest: String = "";
  public htrain: String = "";
  public ptest: String = "";
  public ptrain: String = "";
  public rtest: String = "";
  public rtrain: String = "";
  public optimizationParams: any[] = [];

  public prikaziPredikciju: boolean = false;

  public klasifikacija: boolean = true;

  public MAE1: number[]=[];
  public Adj1: number[]=[];
  public MSE1: number[]=[];
  public R21: number[]=[];
  public RSE1: number[]=[];
  public MAE: number[]=[];
  public Adj: number[]=[];
  public MSE: number[]=[];
  public R2: number[]=[];
  public RSE: number[]=[];

  public modelData: any;

  public snapshot: number = -1;
  public annSettings: any;
  public ioColumns: any;
  public nizAnnSettings : any;
  public general: any;
  public nizGeneral : any;
  public charts: any;
  public charts1: any;
  public inputCol: any[]=[];
  public outputCol: any[]=[];
  public matTrainData: any[] = [];
  public matTestData: any[] = [];
  public indeksiData: any[]=[];
  public indeksiData1: any[]=[];

  // Loss plot
  public lossPlot: WebglPlot | null = null;
  public lossPlotWidth: number = 0;
  public lossPlotHeight: number = 0;

  public lossPoints: any[] = [];
  public maxPointX: number = 0;
  public maxPointY: number = 0;
  public minPointY: number = 99999;

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared: SharedService,public signalR:SignalRService, public modalService : ModalService, private router: Router,private service: NotificationsService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        //console.log(this.idEksperimenta);
      }
    )
    this.signalR.componentMethodCalled$.subscribe((id:number)=>{
      this.dajMetriku(id);
      this.prikaziPredikciju = true;

      this.buttonPlay = true;
      this.buttonPause = false;
      this.buttonContinue= false;
      //this.idModela = id;
      // //console.log("ID MODELA: " + this.idModela);
    });
    this.signalR.componentMethodLossCalled$.subscribe((res: any) => {
      
      if (res.modelId != this.idModela)
        return;

      var epochRes = res.epochRes;
      
      // loss
      if (epochRes.epoch > this.maxPointX)
        this.maxPointX = epochRes.epoch;
      if (epochRes.loss > this.maxPointY)
        this.maxPointY = epochRes.loss;
      if (epochRes.valLoss > this.maxPointY)
        this.maxPointY = epochRes.valLoss;
      if (epochRes.loss < this.minPointY)
        this.minPointY = epochRes.loss;
      if (epochRes.valLoss < this.minPointY)
        this.minPointY = epochRes.valLoss;

      this.lossPoints.push({
        fold : epochRes.fold,
        loss : epochRes.loss,
        valLoss : epochRes.valLoss
      })
      this.updateInfo();
      
      // Weights
      var weights = epochRes.weights;
      this.weights = weights;
      
      this.absoluteWeightMean = []
      for (let a of this.weights) {
        var sum = 0.0;
        var count = 0;
        for (let b of a) {
          for (let weight of b) {
            sum += Math.abs(weight);
            count++;
          }
        }
        this.absoluteWeightMean.push(count / sum)
      }
      this.drawCanvas();
    });
  }
  sendMessage():void{
    this.shared.sendUpdate("Update");
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

  ngOnInit(): void {
    // this.eventsSubscription = this.mod.subscribe((data)=>{this.posaljiZahtev(data);});
    this.eventsSubscription = this.idS.subscribe((data)=>{this.primiSnapshot(data);});
    this.eventsSubscription = this.idM.subscribe((data2)=>{this.ucitajModel(data2);});
    let token = tokenGetter()
    if (token != null)
    {
      this.signalR.startConnection(token);
      this.signalR.LossListener();
      this.signalR.FinishModelTrainingListener();
      this.signalR.StartModelTrainingListener();
      ////console.log(this.signalR.data);
    }
    (<HTMLInputElement>document.getElementById("toggle")).checked = true;

  }

  addSquares(points: number[], color: ColorRGBA) {
    if (this.lossPlot == null) return;
    var maxY = 2.0 / this.lossPlot.gXYratio - 0.05;
    const sqHalfWidth = 0.02;

    for (let i = 0; i < points.length; i++) {
      const pointX = 2 * i / this.maxPointX - 1;
      const YDiff = this.maxPointY - this.minPointY;
      const pointY = maxY * (points[i] - this.minPointY) / YDiff - maxY / 2;
      
      const pointSq = new WebglSquare(color);
      pointSq.setSquare(pointX - sqHalfWidth, pointY - sqHalfWidth, pointX + sqHalfWidth, pointY + sqHalfWidth);

      this.lossPlot.addSurface(pointSq);
    }
  }

  addCircles(points: number[], color: ColorRGBA) {
    if (this.lossPlot == null) return;
    var maxY = 2.0 / this.lossPlot.gXYratio - 0.05;
    const np = 100;
    const r = 0.008;
    
    for (let i = 0; i < points.length; i++) {
      const pointX = 2 * i / this.maxPointX - 1;
      const YDiff = this.maxPointY - this.minPointY;
      const pointY = maxY * (points[i] - this.minPointY) / YDiff - maxY / 2;

      const point = new WebglThickLine(color, np, 2 * r);

      for (let i = 0; i < np; i++) {
        const theta = i / (2 * Math.PI);
        const x = r*Math.cos(theta) + pointX;
        const y = r*Math.sin(theta) + pointY;
  
        point.setX(i, x);
        point.setY(i, y);
      }

      this.lossPlot.addThickLine(point);
    }

  }

  addLossLine(points: number[], color: ColorRGBA) {
    if (this.lossPlot == null) return;
    if (points.length == 0) return;

    
    var line = null;
    if (this.maxPointX <= 50) {
      const r = color.r + 100/255;
      const g = color.g + 112/255;
      const b = color.b + 95 /255;

      const pointColor = new ColorRGBA(r, g, b, 1);

      line = new WebglThickLine(color, points.length, 0.01);
      this.lossPlot.addThickLine(line);
      this.addCircles(points, pointColor);
    }
    else {
      line = new WebglLine(color, points.length);
      this.lossPlot.addLine(line);
    }

    // Scale X points
    line.lineSpaceX(-1, 2 / this.maxPointX);

    // Scale Y points
    var maxY = 2.0 / this.lossPlot.gXYratio - 0.05;
    var inputs: number[] = []
    const YDiff = this.maxPointY - this.minPointY;
    for (let i = 0; i < points.length; i++)
      inputs.push(maxY * (points[i] - this.minPointY) / YDiff - maxY / 2);
    for (let index = 0; index < inputs.length; index++)
      line.setY(index, inputs[index]);
  }

  initializeDrawer() {
    const canvas = <HTMLCanvasElement>document.getElementById("loss-graph");
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width  = 1920 * devicePixelRatio * 0.6;
    canvas.height = 1080 * devicePixelRatio * 0.6;
    
    this.lossPlot = new WebglPlot(canvas);
    this.lossPlot.gXYratio = canvas.width / canvas.height;

    this.lossPoints = [];
    this.minPointY = 99999;
    this.maxPointX = 0;
    this.maxPointY = 0;

    this.lossPlot.update();

    // setTimeout(() => this.demo(), 500);
  }

  updateInfo() {
    if (this.lossPlot == null) return;
    this.lossPlot.removeAllLines();

    const points: number[][] = [];
    if (this.lossPoints[0].fold === undefined) {
      points.push([])
      for (const point of this.lossPoints) {
        points[0].push(point.loss)
      }
      if (this.lossPoints[0].valLoss !== undefined) {
        points.push([])
        for (const point of this.lossPoints) {
          points[1].push(point.valLoss)
        }
      }
    }
    else {
      const noOfFolds = this.lossPoints[this.lossPoints.length - 1].fold + 1;
      for (let i = 0; i < noOfFolds; i++) {
        points.push([]);
        points.push([]);
      }
      for (const point of this.lossPoints) {
        points[point.fold].push(point.loss)
        points[noOfFolds + point.fold].push(point.valLoss)
      }
    }

    const step_r = Math.floor(250 / points.length);
    const step_g = Math.floor(20  / points.length);
    const step_b = Math.floor(40  / points.length);

    for (let i = 0; i < points.length; i++) {
      var r = 202 - i * step_r;
      var g = 42  + i * step_g;
      var b = 80  + i * step_b;

      r = Math.min(255, Math.max(0, r)) / 255;
      g = Math.min(255, Math.max(0, g)) / 255;
      b = Math.min(255, Math.max(0, b)) / 255;
      
      const line = points[i];
      const color = new ColorRGBA(r, g, b, 1);
      
      this.addLossLine(line, color);
    }

    this.lossPlot.update();
  }

  ucitajModel(data2: number){

    let idmodela = sessionStorage.getItem('idModela');
    if(Number(idmodela) != -1)
    {
      this.http.get(url+"/api/Model/LoadSelectedModel?idEksperimenta="+ this.idEksperimenta + "&idModela=" + data2, {responseType: 'text'}).subscribe(
        res=>{
          this.modelData =  JSON.parse(res);
           //console.log(res);
          this.snapshot = this.modelData.Snapshot;
          this.annSettings = this.modelData.NetworkSettings;
          this.ioColumns = this.modelData.IOColumns;
          //console.log(this.modelData.IOColumns);
          this.general = this.modelData.General;
          this.nizGeneral = Object.values(this.general);
          (<HTMLInputElement>document.getElementById("bs2")).value = this.nizGeneral[1];
          (<HTMLTextAreaElement>document.getElementById("opisModela")).value = this.nizGeneral[5];
          //console.log(this.nizGeneral[1]);
          //console.log(this.snapshot);
          //console.log(this.annSettings);
          /*  SNAPSHOT  */
          if(this.snapshot == 0)
          {
            this.imeS("Default snapshot");
            sessionStorage.setItem('idSnapshota',"Default snapshot");
            sessionStorage.setItem('idS',"0");
          }
          else
          {
            for(let i = 0; i < this.snapshots.length; i++)
            {
              if(this.snapshot == this.snapshots[i].id)
              {
                this.imeS(this.snapshots[i].ime);
                sessionStorage.setItem('idSnapshota', this.snapshots[i].ime);
                sessionStorage.setItem('idS', this.snapshot + "");
                break;
              }
            }
          }

          this.http.get(url+"/api/Model/Kolone?idEksperimenta=" + this.idEksperimenta + "&snapshot="+ this.snapshot).subscribe(
            (response: any)=>{
                this.kolone = Object.assign([],response);   //imena kolona
                this.kolone2 = [];
                this.pomocniNizKolone = [];
                this.ulazneKolone = [];
                this.izlazneKolone = [];
                let nizUlazi = this.ioColumns[0];
                let nizIzlazi = this.ioColumns[1];
                /* ULAZNE/IZLAZNE KOLONE */
                for(let j = 0; j < nizUlazi.length; j++)
                {
                  for(let i = 0; i < this.kolone.length; i++)
                  {
                    if(nizUlazi[j] == i)
                    {
                      this.pomocniNizKolone.push({value : this.kolone[i], type : "Input"});
                    }
                  }
                }
                for(let j = 0; j < nizIzlazi.length; j++)
                {
                  for(let i = 0; i < this.kolone.length; i++)
                  {
                    if(nizIzlazi[j] == i)
                    {
                      this.pomocniNizKolone.push({value : this.kolone[i], type : "Output"});
                    }
                  }
                }
                for(let i = 0; i < this.kolone.length; i++)
                {
                  let ind = 0;
                  for(let j = 0; j < this.pomocniNizKolone.length; j++)
                  {
                    if(this.kolone[i] === this.pomocniNizKolone[j].value)
                      ind=1;
                  }
                  if(ind == 0)
                  {
                    this.pomocniNizKolone.push({value : this.kolone[i], type : "None"});
                  }
                }
                for(let i = 0; i < this.kolone.length; i++)
                {
                  for(let j = 0; j < this.pomocniNizKolone.length; j++)
                  {
                    if(this.kolone[i] === this.pomocniNizKolone[j].value)
                    {
                      this.kolone2.push(this.pomocniNizKolone[j]);
                    }
                  }
                }

                for(let i=0; i<this.kolone.length-1; i++)
                {
                  this.ulazneKolone[i] = this.kolone[i];
                }
                this.izlazneKolone[0] = this.kolone[this.kolone.length-1];
                this.brojU = this.ulazneKolone.length;
                this.brojI = 1;
                //console.log(this.brojU);
                this.buttonDisable = false;
                /* ANN SETTINGS */
                
                this.nizAnnSettings = Object.values(this.annSettings);
                //console.log(this.nizAnnSettings);
                (<HTMLSelectElement>document.getElementById("dd4")).value = this.nizAnnSettings[0]+"";
                (<HTMLInputElement>document.getElementById("lr")).value = this.nizAnnSettings[1]+"";
                (<HTMLInputElement>document.getElementById("bs")).value = this.nizAnnSettings[2]+"";
                (<HTMLInputElement>document.getElementById("noe")).value = this.nizAnnSettings[3]+"";
                // current epoch - 4
                this.brojU = this.nizAnnSettings[5];
                this.brojI = this.nizAnnSettings[6];
                this.hiddLay = [];
                this.aktFunk = [];
                this.nizCvorova = [];
                this.brHL = 0;
                this.hiddLay =  this.nizAnnSettings[7];
                this.nizCvorova = Object.assign([], this.hiddLay);
                this.brHL = this.nizCvorova.length;
                //console.log("CVOROVI: " + this.nizCvorova);
                //console.log("BR HL : " + this.brHL);
                this.recreateNetwork();
                this.aktFunk = this.nizAnnSettings[8];
                (<HTMLSelectElement>document.getElementById("dd1")).value = this.nizAnnSettings[9]+"";
                (<HTMLInputElement>document.getElementById("rr")).value = this.nizAnnSettings[10]+"";
                if(this.nizAnnSettings[0] == 1)
                {
                  this.klasifikacija = true;
                  this.tip = 1;
                  this.selectedLF = this.nizAnnSettings[11];
                  //console.log(this.selectedLF);
                   (<HTMLSelectElement>document.getElementById("dd2")).selectedIndex = this.selectedLF;
                  // (<HTMLSelectElement>document.getElementById("dd2")).value = this.selectedLF+"";
                }
                else
                {
                  this.klasifikacija = false;
                  this.tip = 0;
                  this.selectedLF = this.nizAnnSettings[11];
                  //console.log(this.selectedLF);
                   (<HTMLSelectElement>document.getElementById("dd2")).selectedIndex = this.selectedLF;
                  // (<HTMLSelectElement>document.getElementById("dd2")).value = this.selectedLF+"";
                }
                (<HTMLSelectElement>document.getElementById("dd3")).value = this.nizAnnSettings[12]+"";
                if(this.nizAnnSettings[13].length != 0)
                {
                  (<HTMLInputElement>document.getElementById("momentum")).value = this.nizAnnSettings[13]+"";
                }
                if(this.nizAnnSettings[14] == 0){
                  this.flag = false;
                  (<HTMLInputElement>document.getElementById("toggle")).checked = false;
                }
                else{
                  this.flag = true;
                  (<HTMLInputElement>document.getElementById("toggle")).checked = true;
                  (<HTMLInputElement>document.getElementById("crossV")).value == this.nizAnnSettings[14]+"";
                }
                // //console.log("ULAZNE KOLONE: " + this.ulazneKolone);
                this.ulazneKolone = [];
                this.izlazneKolone = [];
                for(let i = 0; i < this.kolone.length; i++)
                {
                  for(let j = 0; j < nizUlazi.length; j++)
                  {
                    if(i == nizUlazi[j])
                      this.ulazneKolone.push(this.kolone[i]);
                  }
                }
                for(let i = 0; i < this.kolone.length; i++)
                {
                  for(let j = 0; j < nizIzlazi.length; j++)
                  {
                    if(i == nizIzlazi[j])
                      this.izlazneKolone.push(this.kolone[i]);
                  }
                }
                this.prikaziPredikciju = true;
                this.PosaljiSnapshot2.emit(this.snapshot);
              },error =>{
              console.log(error.error);
            }
            );
            this.selectedSS=this.snapshot;
            //console.log(this.selectedSS);
        },
        error=>{
          console.log(error.error);
        }
      )
    }
    
  }

  primiSnapshot(data:number){

    let snap = sessionStorage.getItem('idSnapshota');
    let idsnap = sessionStorage.getItem('idS');
    //console.log(snap);
    //console.log((<HTMLButtonElement>document.getElementById("dropdownMenuButton2")).innerHTML);
    if( (<HTMLButtonElement>document.getElementById("dropdownMenuButton2")).innerHTML != snap)
    {
      this.selectSnapshotM(data);
      for(let i=0; i<this.snapshots.length; i++)
      {
        if(this.snapshots[i].id == data)
        {
          this.imeS(this.snapshots[i].ime);
          return;
        }
      }
      this.imeS("Default snapshot");
    }
  }

  ucitajNazivModela(id : any){

  this.http.get(url+"/api/Model/Model/Naziv/"+ id, {responseType: 'text'}).subscribe(
      res=>{
        //console.log(res);
        this.nazivModela = res;
        var div = (<HTMLInputElement>document.getElementById("nazivM")).value = this.nazivModela;
      },
      error=>{
        console.log(error);
      }
    )
  }

  funkcija(e: any){

    this.flagP = true;
    if (e.type === 'None'){
      e.type = 'Output';
      this.izlazneKolone.push(e.value);
      this.brojI++;
      if(this.ulazneKolone.length == 0)
      {
        this.buttonDisable = true;
      }
      else
      {
        this.buttonDisable = false;
      }
    }
    else if (e.type === 'Output'){
      e.type = 'Input';
      for(let j=0; j < this.izlazneKolone.length; j++)
        {
          if(this.izlazneKolone[j] === e.value)
          {
            this.izlazneKolone.splice(j,1);
            this.brojI--;
          }
        }
      this.ulazneKolone.push(e.value);
      this.brojU++;
      if(this.izlazneKolone.length == 0)
      {
        this.buttonDisable = true;
      }
      else
      {
        this.buttonDisable = false;
      }
    }
    else
    {
      e.type = 'None';
      for(let j=0; j < this.ulazneKolone.length; j++)
        {
          if(this.ulazneKolone[j] === e.value)
          {
            this.ulazneKolone.splice(j,1);
            this.brojU--;
          }
        }
        if(this.ulazneKolone.length == 0 || this.izlazneKolone.length == 0)
        {
          this.buttonDisable = true;
          //console.log("TRUE-------------------------------");
        }
        else if(this.ulazneKolone.length == 0 && this.izlazneKolone.length == 0)
        {
          this.buttonDisable = true;
        }
        else
        {
          this.buttonDisable = false;
        }
    }
    this.recreateNetwork();
    // let nizK = <any>document.getElementsByName("ulz"); 
    // var ind1;
    // for(let i=0; i<nizK.length; i++)
    // {
    //   if(nizK[i].checked)
    //   {

    //     ind1 = 0;
    //     for(let j=0; j<this.ulazneKolone.length; j++)
    //     {
    //         if(this.ulazneKolone[j] === nizK[i].value)
    //         {
    //             ind1 = 1;
    //         }
    //     }
    //     if(ind1 == 0)
    //     {
    //        this.ulazneKolone.push(nizK[i].value);
    //        this.izabraneU.push(i);
    //        //console.log(this.izabraneU);
    //        (<HTMLInputElement>document.getElementById(nizK[i].value)).disabled = true;
    //        this.brojU++;
    //        if(this.brojU > 0 && this.brojI > 0)
    //         {
    //           this.buttonDisable = false;
    //         }
    //         //console.log(this.brojU);
    //     }
    //   }
    //   else
    //   {
    //     for(let j=0; j < this.ulazneKolone.length; j++)
    //     {
    //       if(this.ulazneKolone[j] === nizK[i].value)
    //       {
    //         this.ulazneKolone.splice(j,1);
    //         this.izabraneU.splice(j,1);
    //         //console.log(this.izabraneU);
    //         (<HTMLInputElement>document.getElementById(nizK[i].value)).disabled = false;
    //         ////console.log(nizK[i].value);
    //          this.brojU--;
    //          //console.log(this.brojU);
    //         if(this.brojU == 0)
    //         {
    //           this.buttonDisable = true;
    //         }
    //       }
    //     }
    //   }
    // }
  }


  napraviModel()
  {
    //console.log(this.idEksperimenta);
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
        //console.log(res);
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
    //console.log(this.selectedLF);
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
    this.check();
    if((<HTMLSelectElement>document.getElementById("dd4")).value == "1")
    {
      this.klasifikacija = true;
      this.selectedLF = 4;
    }
    else
    {
      this.klasifikacija = false;
      this.selectedLF = 0;
    }
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

  check()
  {
    if(this.selectedPT==0)
      this.tip=0;
    else
      this.tip=1;
  }

  // uzmiKolone()
  // {
  //   //console.log(this.idModela);
  //   this.http.get(url+"/api/Eksperiment/Podesavanja/Kolone?id=" + this.idModela).subscribe(
  //       res=>{
  //         this.pomocni=Object.assign([],res);
  //         this.izabraneU=Object.assign([],this.pomocni[0]);
  //         this.izabraneI=Object.assign([],this.pomocni[1]);
  //         this.cekiraj();
  //       },error=>{
  //         //console.log(error.error);
  //       }
  //   );
  // }

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
        //console.log(res);
      }
    );
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
        this.onSuccess("Podesavanja uspesno izmenjena!");
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
        // console.log(error.error);
        if(error.error === "Vec postoji model sa tim imenom")
        {
           var div1 = (<HTMLDivElement>document.getElementById("poruka2")).innerHTML = "*Model sa tim nazivom vec postoji";
           this.onError("Model sa tim nazivom vec postoji");
        }
      }
    )
  }

  treniraj(broj:number){
    
    if(this.idModela == undefined)
    {
      this.onInfo("You have to save the model before training");
      return;
    }
    
    (<HTMLDivElement>document.getElementById('grafik')).scrollIntoView();
    
    if(broj == 1){
      this.izmeniPodesavanja();
      this.uzmiCekirane();
      //console.log("sacuvano");
    }
    // loading ... 
    this.http.get(url+"/api/Model/Model/Treniraj?id="+ this.idModela + "&idEksperimenta=" + this.idEksperimenta,{responseType:"text"}).subscribe(
      res => {
        this.onInfo("Trening je zapocet.");
        // pauza   
        this.buttonPause = true;
        this.buttonPlay = false;
        this.buttonContinue = false; 

        // Initialize loss draw
        this.initializeDrawer();
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
        this.aktFunk.push(0);
        this.nizCvorova.push(1);
        this.recreateNetwork();
      }
      else{
        this.brHL = 10;
      }
    }
    else{

      if(this.brHL >= 2){
        this.brHL--;
        this.hiddLay.pop();
        this.aktFunk.pop();
        this.nizCvorova.pop();
        this.recreateNetwork();
      }
      else{
        this.brHL = 1;
      }
    }
    //this.recreateNetwork();
  }

  recreateNetwork() {
    var ic = 0;
    var oc = 0;
    for (let kolona of this.kolone2) {
      if      (kolona.type === 'Input')  ic += 1;
      else if (kolona.type === 'Output') oc += 1;
    }

    var counts = [];
    counts.push(ic);
    for (let i = 0; i < this.brHL; i++)
      counts.push(this.nizCvorova[i]);
    counts.push(oc);
    
    this.weights = [];
    this.absoluteWeightMean = []
    for (let i = 0; i < counts.length - 1; i++) {
      const count_c = counts[i];
      const count_n = counts[i + 1];
      
      this.weights.push([]);
      for (let j = 0; j < count_n; j++) {
        this.weights[i].push([]);
        for (let k = 0; k < count_c; k++) {
          this.weights[i][j].push(this.sampleNormalDistribution(0, 1));
        }
      }
      this.absoluteWeightMean.push(1.0)
    }


    this.drawCanvas();
  }

  sampleNormalDistribution(mean: number, std: number) {
    const u = Math.random();
    const v = Math.random();

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * u);
    
    return z * std + mean;
  }

  drawCanvas() {
    var canvas = <HTMLCanvasElement>document.getElementById("model-canvas");
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width  = 1920 * devicePixelRatio * 0.7;
    const height = 1080 * devicePixelRatio * 0.7;
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    if (ctx == null) return;

    var ic = 0;
    var oc = 0;
    for (let kolona of this.kolone2) {
      if      (kolona.type === 'Input')  ic += 1;
      else if (kolona.type === 'Output') oc += 1;
    }

    var node_count = this.brHL + 1;
    var bonus = 1;
    if (ic > 0) {
      node_count++;
      bonus = 2;
    }
    if (oc > 0) node_count++;

    // Draw input layer
    if (ic > 0) {
      var node_x = 1 / (node_count);
      var node_x1 = 2 / (node_count);
      var no_nodes_n = 0;
      if (this.brHL > 0)
        no_nodes_n = this.nizCvorova[0];
      else if(oc > 0)
        no_nodes_n = oc;

      for (let j = 0; j < ic; j++) {
        var node_y = (j + 1) / (ic + 1);

        // Draw connections
        for (let k = 0; k < no_nodes_n; k++) {
          var node_y1 = (k + 1) / (no_nodes_n + 1);
          var weight = this.weights[0][k][j]
          this.draw_connection(ctx, 0, node_x, node_y, node_x1, node_y1, weight, width, height);
        }

        // Draw circle
        this.draw_node(ctx, 'i', node_x, node_y, width, height);
      }
    }

    // Draw hidden layers
    for (let i = 0; i < this.brHL; i++) {
      var node_x = (i + bonus) / (node_count);
      var node_x1 = (i + 1 + bonus) / (node_count);
      
      var no_nodes_c = this.nizCvorova[i];
      var no_nodes_n = 0;
      if (i != this.brHL - 1)
        no_nodes_n = this.nizCvorova[i + 1];
      else if (oc > 0)
        no_nodes_n = oc

      for (let j = 0; j < no_nodes_c; j++) {
        var node_y = (j + 1) / (no_nodes_c + 1);

        // Draw connections
        for (let k = 0; k < no_nodes_n; k++) {
          var node_y1 = (k + 1) / (no_nodes_n + 1);
          var weight = this.weights[i + bonus - 1][k][j]
          this.draw_connection(ctx, i + bonus - 1, node_x, node_y, node_x1, node_y1, weight, width, height);
        }

        // Draw circle
        this.draw_node(ctx, 'd', node_x, node_y, width, height);
      }
    }

    // Draw output layer
    if (oc > 0) {
      node_x = (this.brHL + bonus) / (node_count);
      for (let j = 0; j < oc; j++) {
        var node_y = (j + 1) / (oc + 1);

        // Draw circle
        this.draw_node(ctx, 'o', node_x, node_y, width, height);
      }
    }
  }

  draw_node(ctx: any, kind: string, node_x: number, node_y: number, width: number, height: number) {
    ctx.strokeStyle = "#5C6A8D42";
    ctx.lineWidth = 3;

    if (kind === "i")
      ctx.fillStyle = "#323272";
    else if (kind === "o")
      ctx.fillStyle = "#703352";
    else
      ctx.fillStyle = "#5C6A8D";

    ctx.beginPath();
    ctx.arc(node_x * width, node_y  * height, 20, 0,2*Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  draw_connection(ctx: any, i:number, node_x1: number, node_y1: number, node_x2: number, node_y2: number, weight: number, width: number, height: number) {
    var r = 255;
    var g = 255;
    var b = 255;
    if (weight > 0) { r = 202; g = 42;  b = 80;  }
    else            { r = 0;   g = 133; b = 190; }

    var x = Math.abs(weight);
    var alpha = 1 - 1 / Math.exp(this.absoluteWeightMean[i] * x);
    alpha *= alpha;

    ctx.strokeStyle = `rgb(${r},${g},${b},${alpha})`;
    ctx.lineWidth = 4 * alpha;

    ctx.beginPath();
    ctx.moveTo(node_x1 * width, node_y1 * height);
    const middle_point = node_x1 + (node_x2 - node_x1) / 2;
    ctx.bezierCurveTo(
      middle_point * width, node_y1 * height,
      middle_point * width, node_y2 * height,
      node_x2 * width, node_y2 * height
    );
    ctx.stroke()
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
          if(Number(str) <= 1)
          {
            this.broj = 1;
            (<HTMLInputElement>document.getElementById(this.pom)).value = "1";
          }
        else{
          this.broj = Number(str);
          //this.recreateNetwork();
        }
        this.nizCvorova[i]=this.broj;
        this.recreateNetwork();
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
          text: 'Loss value',
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
          text: 'Epoch',
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

  kreirajModelCuvanje()
  {
    this.prikaziPredikciju = false;
    var crossVK;
    if(this.flag == false)
      crossVK = 0;
    else
      crossVK = Number((<HTMLInputElement>document.getElementById("crossV")).value);

    var inputs = [];
    var outputs = [];

    for (let i in this.kolone2) {
      var kolona = this.kolone2[i];
      if (kolona.type === 'Input')
        inputs.push(i);
      else if (kolona.type === 'Output')
        outputs.push(i);
    }

    this.inputCol=inputs;
    this.outputCol=outputs;

    if(this.momentum==true)
      this.optimizationParams[0]=Number((<HTMLInputElement>document.getElementById("momentum")).value);

    this.jsonModel = 
    {
        "naziv": (<HTMLInputElement>document.getElementById("bs2")).value,
        "opis": (<HTMLTextAreaElement>document.getElementById("opisModela")).value,
        "snapshot": this.selectedSS,
        "podesavalja": {  
        "annType":this.selectedPT,
        "learningRate": Number((<HTMLInputElement>document.getElementById("lr")).value),
        "batchSize": Number((<HTMLInputElement>document.getElementById("bs")).value),
        "numberOfEpochs": Number((<HTMLInputElement>document.getElementById("noe")).value),
        "currentEpoch":0,
        "inputSize": inputs.length,
        "outputSize": outputs.length,
        "hiddenLayers":this.nizCvorova,
        "activationFunctions":this.aktFunk,
        "regularization": this.selectedRM,
        "regularizationRate": Number((<HTMLInputElement>document.getElementById("rr")).value),
        "lossFunction": this.selectedLF,
        "optimizer": this.selectedO,
        "optimizationParams": this.optimizationParams,
        "kFoldCV":crossVK
        },
        "kolone":{
          "ulazne":inputs,
          "izlazne":outputs
        }
    };
    //console.log((<HTMLInputElement>document.getElementById("bs2")).value);
    //console.log(this.jsonModel);
    this.http.post(url+"/api/Model/NoviModel?idEksperimenta="+this.idEksperimenta, this.jsonModel, {responseType: 'text'}).subscribe(
      res => {
        //console.log(res);
        this.idModela=res;
        this.onSuccess("Model was successfully created.");
        this.PosaljiModel.emit(this.selectedSS);
      },
      error =>{
        console.log(error.error);
        this.onError("Model was not created.");
        if(error.error === "Model sa tim imenom vec postoji.")
        {
          (<HTMLDivElement>document.getElementById("greska")).innerHTML = "*Model sa tim nazivom vec postoji";
          this.onError("Model with that name already exists.");
        }
      }
    )
  }

  // dajSnapshots()
  // {
  //   this.http.get(url+"/api/File/Snapshots?id="+this.idEksperimenta).subscribe(
  //     res => {
  //       this.jsonSnap=res;
  //       this.snapshots = Object.values(this.jsonSnap);
  //     },
  //     error =>{
  //       //console.log(error.error);
  //     }
  //   )
  // }

 imeS(ime: string)
 {
   (<HTMLButtonElement>document.getElementById("dropdownMenuButton2")).innerHTML = ime;
 }

  selectSnapshot(id: any,ime:string)
  {
    if(id==0)
    {
      sessionStorage.setItem('idSnapshota',"Default snapshot");
      sessionStorage.setItem('idS',"0");
    }
    else{ 
      
      sessionStorage.setItem('idSnapshota',ime);
      sessionStorage.setItem('idS',id+"");
    }
     this.http.get(url+"/api/Model/Kolone?idEksperimenta=" + this.idEksperimenta + "&snapshot="+ id).subscribe(
     (response: any)=>{
         this.kolone = Object.assign([],response);   //imena kolona
         this.kolone2 = [];
         //console.log("----------------------" + this.kolone);
         this.ulazneKolone = [];
         this.izlazneKolone = [];
         for (var kolona of this.kolone) {
            this.kolone2.push({value : kolona, type : "Input"});
         }
         this.kolone2[this.kolone2.length - 1].type = "Output";
        // this.PosaljiSnapshot2.emit(id);
         for(let i=0; i<this.kolone.length-1; i++)
         {
           this.ulazneKolone[i] = this.kolone[i];
         }
         this.izlazneKolone[0] = this.kolone[this.kolone.length-1];
         this.brojU = this.ulazneKolone.length;
         this.brojI = 1;
         //console.log(this.brojU);
         this.buttonDisable = false;
         this.buttonDisable = false;
         this.hiddLay = [3,3,3,3,3];
         this.nizCvorova = [3,3,3,3,3];
         this.brHL = 5;
         this.aktFunk = [0,0,0,0,0];
         this.PosaljiSnapshot2.emit(id);
         this.recreateNetwork();
      },error =>{
       console.log(error.error);
     }
    );
    this.selectedSS=id;
    //console.log(this.selectedSS);
  }

  selectSnapshotM(id: any)
  {
     this.http.get(url+"/api/Model/Kolone?idEksperimenta=" + this.idEksperimenta + "&snapshot="+ id).subscribe(
     (response: any)=>{
        //console.log("SELECT SNAPSHOT M");
         //console.log(response);
         this.kolone = Object.assign([],response);
         this.kolone2 = [];
         this.brojI = 0;
         this.brojU = 0;
         this.ulazneKolone = [];
         this.izlazneKolone = [];
         if(this.kolone2.length == 0)
         {
          for (var kolona of this.kolone) {
            this.kolone2.push({value : kolona, type : "Input"});
           }
           this.kolone2[this.kolone2.length - 1].type = "Output";
         }
         if(this.flagP == false) 
         {
          for(let i=0; i<this.kolone.length-1; i++)
          {
            this.ulazneKolone[i] = this.kolone[i];
          }
          this.izlazneKolone[0] = this.kolone[this.kolone.length-1];
          this.brojU = this.ulazneKolone.length;
          this.brojI = 1;
         }
         this.buttonDisable = false;
         this.hiddLay = [3,3,3,3,3];
         this.nizCvorova = [3,3,3,3,3];
         this.brHL = 5;
         this.aktFunk = [0,0,0,0,0];
         this.recreateNetwork();
      },error =>{
       console.log(error.error);
     }
    );
    this.selectedSS=id;
  }

  dajMetriku(modelId:number)
  {
    this.http.get(url+"/api/Model/metrika?modelId="+ modelId + "&idEksperimenta=" + this.idEksperimenta).subscribe(
      res => {
        console.table(res);
        this.jsonMetrika = Object.values(res);
        //console.log(this.jsonMetrika);
        this.trainR=Object.assign([],this.jsonMetrika[1]);
        this.testR=Object.assign([],this.jsonMetrika[0]);
        this.checkType();
      },
      error => {
        console.log(error.error);
      }
    )
  }

  checkMomentum()
  {
    if(this.selectedO==8 || this.selectedO==9)
      this.momentum=true;
    else
      this.momentum=false;
  }

  checkType()
  {
    if(this.selectedPT==1)
    {
      if(this.pomocna==true)
        this.pomocna=false;
      this.setujMetrikuK();

    }
    else if(this.selectedPT==0)
    {
      if(this.pomocna==false)
        this.pomocna=true;
      this.setujMetrikuR();
    }
  }

  setujMetrikuK()
  {
    if(this.testR.length==0)
        this.imaTestni=false; 
    else if(this.testR.length==1)
        this.imaTestni=true;
    
    //console.log(this.imaTestni);   
    //console.log(this.testR.length);

    var max = this.nadjiMaxTrain();
    

    this.atrain = (Number(this.jsonMetrika[1][0]['Accuracy'])).toFixed(3);
    this.btrain = (Number(this.jsonMetrika[1][0]['BalancedAccuracy'])).toFixed(3);
    this.ctrain = (Number(this.jsonMetrika[1][0]['CrossEntropyLoss'])).toFixed(3);
    this.ftrain = (Number(this.jsonMetrika[1][0]['F1Score'])).toFixed(3);
    this.htrain = (Number(this.jsonMetrika[1][0]['HammingLoss'])).toFixed(3);
    this.ptrain = (Number(this.jsonMetrika[1][0]['Precision'])).toFixed(3);
    this.rtrain = (Number(this.jsonMetrika[1][0]['Recall'])).toFixed(3);

    this.matTrainData = this.jsonMetrika[1][0]['ConfusionMatrix'];

    //console.log(max);
    var nizJson = [];
    for(let i=this.matTrainData.length-1; i>=0; i--)
    {
      for(let j=this.matTrainData.length-1; j>=0; j--)
        this.matTrainData[i][j]=Number(Number(this.matTrainData[i][j]/max).toFixed(3));
      this.indeksiData[i]=i;  
      nizJson.push({name: this.indeksiData[i] + '', data: this.matTrainData[i]});
    }

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
    this.charts = new ApexCharts(document.querySelector("#chart"), options);
    
    if(this.imaTestni==false)
      return;
    
      this.matTestData = this.jsonMetrika[0][0]['ConfusionMatrix'];
      var max1 = this.nadjiMaxTest();
      var nizJson1 = [];
      for(let i=this.matTestData.length-1; i>=0; i--)
      {
        for(let j=this.matTestData.length-1; j>=0; j--)
          this.matTestData[i][j]=Number(Number(this.matTestData[i][j]/max1).toFixed(3));
        this.indeksiData1[i]=i;  
        nizJson1.push({name: this.indeksiData1[i] + '', data: this.matTestData[i]});
      }
      var options1 = {
        chart: {
          type: 'heatmap',
          foreColor: '#ffffff'
        },
        series: nizJson1,
        xaxis: {
          categories: this.indeksiData1
        },
        legend: {
          labels: {
              colors: '#ffffff',
              useSeriesColors: false
          },
        onItemHover: {
            highlightDataSeries: false
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
                color: '#bd21ba'
              },
              {
                from: 0.51,
                to: 0.75,
                color: '#630584'
              },
              {
                from: 0.76,
                to: 1,
                color: '#490661'
              }]
          }}
        }
  
      }
      this.atest = (Number(this.jsonMetrika[0][0]['Accuracy'])).toFixed(3);
      this.btest = (Number(this.jsonMetrika[0][0]['BalancedAccuracy'])).toFixed(3);
      this.ctest = (Number(this.jsonMetrika[0][0]['CrossEntropyLoss'])).toFixed(3);
      this.ftest = (Number(this.jsonMetrika[0][0]['F1Score'])).toFixed(3);
      this.htest = (Number(this.jsonMetrika[0][0]['HammingLoss'])).toFixed(3);
      this.ptest = (Number(this.jsonMetrika[0][0]['Precision'])).toFixed(3);
      this.rtest = (Number(this.jsonMetrika[0][0]['Recall'])).toFixed(3);

    this.charts1 = new ApexCharts(document.querySelector("#chart1"), options1);
    
  }

  prikaziMatrice()
  {
    if(this.imaTestni==true)
    {
      this.charts.render();
      this.charts1.render();
      (<HTMLDivElement>document.getElementById("chart1")).style.visibility = "visible";
      (<HTMLDivElement>document.getElementById("bodymodal")).style.height = '680px';
      //console.log("Prikazao sam obe");
    }
    else
    {
      this.charts.render();
      (<HTMLDivElement>document.getElementById("chart1")).style.visibility = "hidden";
      (<HTMLDivElement>document.getElementById("bodymodal")).style.height = '340px';
    }
  }

  setujMetrikuR()
  {
    if(this.testR.length==0)
        this.imaTestni=false; 
      else
        this.imaTestni==true;
    //console.log(this.imaTestni);
    for(let i=0;i<this.trainR.length;i++)
    {
      this.MAE[i]=Number(Number(this.trainR[i]['MAE']).toFixed(3));
      this.MSE[i]=Number(Number(this.trainR[i]['MSE']).toFixed(3));
      this.Adj[i]=Number(Number(this.trainR[i]['AdjustedR2']).toFixed(3));;
      this.R2[i]=Number(Number(this.trainR[i]['R2']).toFixed(3));
      this.RSE[i]=Number(Number(this.trainR[i]['RSE']).toFixed(3));
    }

    for(let i=0;i<this.testR.length;i++)
    {
      this.MAE1[i]=Number(Number(this.testR[i]['MAE']).toFixed(3));
      this.MSE1[i]=Number(Number(this.testR[i]['MSE']).toFixed(3));
      this.Adj1[i]=Number(Number(this.testR[i]['AdjustedR2']).toFixed(3));;
      this.R21[i]=Number(Number(this.testR[i]['R2']).toFixed(3));
      this.RSE1[i]=Number(Number(this.testR[i]['RSE']).toFixed(3));
    }
  }
  
  nadjiMaxTrain()
  {
    var p=0;
    var t;
    this.mtrain = this.jsonMetrika[1][0]['ConfusionMatrix'];
    // //console.log(this.mtest[0].length);//'(2)array[array(2),array(2)]';
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
     return this.maxNizaTr; 
  }

  nadjiMaxTest()
  {
    var p=0;
    var t;
    this.mtest = this.jsonMetrika[0][0]['ConfusionMatrix'];
    // //console.log(this.mtest[0].length);//'(2)array[array(2),array(2)]';
    for(let i=0;i<this.mtest.length;i++)
       for(let j=0;j<this.mtest[i].length;j++)
       {
          this.nizPoljaTest[p]=this.mtest[i][j];
          p++;
       }

    for(let i=0;i<this.nizPoljaTest.length-1;i++)
    {
      for(let j=1;j<this.nizPoljaTest.length;j++)
       {
         if(this.nizPoljaTest[i]<this.nizPoljaTest[j])
         {
           t=this.nizPoljaTest[i];
           this.nizPoljaTest[i]=this.nizPoljaTest[j];
           this.nizPoljaTest[j]=t;
         }
       }
    }
     this.maxNizaT=this.nizPoljaTest[0];
     return this.maxNizaT; 
  }

  colapseLoss()
  {
    this.prikazi=true;
    // (<HTMLHeadElement>document.getElementById('loss')).style.display='none';
  }
  
  colapseStatistics()
  {
    this.prikazi1=true;
  }

  pripremiPredikciju()
  {
    //console.log("PRIPREMI PREDIKCIJU");
    if((<HTMLSelectElement>document.getElementById("dd4")).value == "1")
    {
      (<HTMLInputElement>document.getElementById("vrednostIzlaza0")).value = "";
      (<HTMLInputElement>document.getElementById("nazivIzlaza0")).innerHTML = "Output";
      for(let i = 1; i < this.izlazneKolone.length; i++)
      {
        (<HTMLInputElement>document.getElementById("vrednostIzlaza" + i)).style.display = "none";
        (<HTMLInputElement>document.getElementById("nazivIzlaza" + i)).style.display = "none";
      }
    }
  }

  predikcija()
  {
    let nizVrednosti: string[] = [];
    let ind = 0;

    //ciscenje ako su ostale vrednosti od prethodne predikcije
    if((<HTMLSelectElement>document.getElementById("dd4")).value == "1")
    {
      (<HTMLInputElement>document.getElementById("vrednostIzlaza")).value = "";
    }
    else
    {
      for(let i = 0; i < this.izlazneKolone.length; i++)
      {
        (<HTMLInputElement>document.getElementById("vrednostIzlaza" + i)).value = "";
      }
    }

    for(let i = 0; i < this.ulazneKolone.length; i++)
    {
      let vrednost = (<HTMLInputElement>document.getElementById("vrednostUlaza" + i)).value;
      // //console.log(vrednost.length);
      let vrednostTrim = vrednost.trim();
      // //console.log(vrednostTrim.length);
      if(vrednostTrim == "")
      {
        (<HTMLDivElement>document.getElementById("greskaIspis" + i)).style.visibility = "visible";
        ind = 1;
      }
      else
      {
        nizVrednosti.push(vrednostTrim);
        (<HTMLDivElement>document.getElementById("greskaIspis" + i)).style.visibility = "hidden";
      }
    }
    if(ind == 1)
      return;

    //console.log(nizVrednosti);
    //console.log(this.idModela);
    this.http.post(url+"/api/Model/predict?idEksperimenta=" + this.idEksperimenta + "&modelId=" + this.idModela, nizVrednosti, {responseType : "text"}).subscribe(
      res=>{
        //console.log("USPESNO");
        //console.log(res);
        if((<HTMLSelectElement>document.getElementById("dd4")).value == "1")
        {
          (<HTMLInputElement>document.getElementById("vrednostIzlaza")).value = res;
        }
        else
        {
          let resPodaci = res.slice(1, res.length-1);
          //console.log(resPodaci);
          if(resPodaci.indexOf(","))
          {
            let podaci = resPodaci.split(", ");
            //console.log(podaci);
            for(let i = 0; i < res.length; i++)
            {
              (<HTMLInputElement>document.getElementById("vrednostIzlaza" + i)).value = Number(podaci[i]).toFixed(4) + "";
            }
          }
          else
          {
            (<HTMLInputElement>document.getElementById("vrednostIzlaza0")).value = resPodaci;
          }
          for(let i = 0; i < res.length; i++)
          {
            (<HTMLInputElement>document.getElementById("vrednostIzlaza" + i)).value = res[i];
          }
        }
      },
      error => {
        console.log(error.error);
      }
    );
  }

  pauzirajTrening()
  {
    this.http.post(url+"/api/Model/Model/Pauziraj?idEksperimenta=" + this.idEksperimenta + "&idModela=" + this.idModela, null ,{responseType:'text'}).subscribe(
      res => {
        console.table(res);

        // nastavi trening 
        this.buttonContinue = true;
        this.buttonPause = false;
        this.buttonPlay = false; 
        this.onInfo("Training is paused.");
      },
      error => {
        console.log(error.error);
      }
    )
  }

  nastaviTrening()
  {
    this.http.post(url+"/api/Model/Model/NastaviTrening?idEksperimenta=" + this.idEksperimenta + "&idModela=" + this.idModela, null ,{responseType:'text'}).subscribe(
      res => {
        console.table(res);
        //console.log("Nastavljam"); 

        this.buttonPause = true;
        this.buttonPlay = false;
        this.buttonContinue = false; 
        this.onInfo("Training continues.");
      },
      error => {
        console.log(error.error);
      }
    )
  }
}