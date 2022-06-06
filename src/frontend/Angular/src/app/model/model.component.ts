import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { max, Observable, Subscription } from 'rxjs';
import { SharedService } from '../shared/shared.service';
import { SignalRService } from '../services/signal-r.service';
import { tokenGetter, url } from '../app.module';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { saveAs } from 'file-saver';
import { ModalService } from '../_modal';
import {Router} from '@angular/router';
import {NotificationsService} from 'angular2-notifications'; 
import * as ApexCharts from 'apexcharts';
import { WebglPlot, WebglLine, ColorRGBA, WebglThickLine, WebglPolar, WebglStep, WebglSquare } from "webgl-plot";
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

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

  public inputsLocked: boolean = false;
  public saveModelLocked : boolean = false;

  public forkUponSave : boolean = false;
  
  public kolone: any[] = [];
  message: any;
  public idModela : number = 0;

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
  public broj : number = 0;
  public crossV : number = 5;
  public flag: boolean = true;

  public modelName: string = "";
  public modelDescription: string = "";

  public currentEpoch: number = 0;
  public numberOfEpoch: number = 15;

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

  public parallelModels: any[] = []

  public modelStateTexts: string[] = ["Start model training", "Pause training", "Continue training"]
  public modelText: string = this.modelStateTexts[0];

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

  public xAxis: CanvasRenderingContext2D | null = null;
  public yAxis: CanvasRenderingContext2D | null = null;

  public xAxisWidth:  number = 0;
  public xAxisHeight: number = 0;
  public yAxisWidth:  number = 0;
  public yAxisHeight: number = 0;

  public lossPoints: any[] = [];
  public maxPointX: number = 0;
  public maxPointY: number = 0;
  public minPointY: number = 99999;
  
  public lossLineParams: string[][] = [];
  public lossLineEnabled: boolean[] = [];

  public nizNedozvoljenih : string[] = [];
  jsonPom : any;

  @ViewChild('overridemodela') overridemodela:any;
  closeResult = '';

  @ViewChild('btnexitoverridemodel') btnexitoverridemodel:any;

  @ViewChild('parallel') parallel :any;
  @ViewChild('notSaved') notSaved :any;
  
  @ViewChild('saveModel') saveModelDialog :any;

  public modalToCloseOverride:any;

  // progress bar
  public numOfEpochsTotal : number = 0;
  public currentEpochPercent : number = 0;

  // show/disable statistics after training
  public showStat : boolean = false;
  public predictionDisabled = true;

  //parallel models
  public modelparallel:any;
  currentEpochPercentParallel : number = 0;
  numOfEpochsTotalParallel : number = 0;

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared: SharedService,public signalR:SignalRService, public modalService : ModalService, private ngbModalService: NgbModal, private router: Router,private service: NotificationsService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        //console.log(this.idEksperimenta);
      }
    )
    this.signalR.componentMethodCalled$.subscribe((id:number)=>{

      for (const m of this.parallelModels) {
        if (m.modelId == id) {
          return;
        }
      }
      if (id != this.idModela)
        return;

      this.dajMetriku(id);
      this.prikaziPredikciju = true;
      this.predictionDisabled = false;

      this.buttonPlay = true;
      this.buttonPause = false;
      this.buttonContinue= false;
      //this.idModela = id;
      // //console.log("ID MODELA: " + this.idModela);

      this.modelText = this.modelStateTexts[0];
    });
    this.signalR.componentMethodLossCalled$.subscribe((res: any) => {
      
      var epochRes = res.epochRes;

      var epoch = epochRes.epoch + 1;
      if (epochRes.fold !== undefined) {
        epoch += this.numberOfEpoch * epochRes.fold;
      }
      
      for (const m of this.parallelModels) {
        if (m.modelId == res.modelId) {
          m.jsonModel.podesavalja.currentEpoch = epoch;

          // Progress Bar - Paraller Training 
          m.currentTrainStatus = m.jsonModel.podesavalja.currentEpoch;
          m.currentTrainStatus = Math.floor( m.currentTrainStatus / m.numOfEpochsTotal * 100);
          return;
        }
      }
      if (res.modelId != this.idModela)
        return;

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
      const weights = epochRes.weights;
      this.setWeights(weights);
      this.drawCanvas();

      this.currentEpoch = epoch;
      // progress bar
      this.currentEpochPercent = this.currentEpoch;
      this.currentEpochPercent = Math.floor(this.currentEpochPercent / this.numOfEpochsTotal * 100); 
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
    var modelValue = sessionStorage.getItem('models');
    if(modelValue != null){
      this.parallelModels = JSON.parse(modelValue);
    }  

    (<HTMLInputElement>document.getElementById("toggle")).checked = true;

  }

  setWeights(weights: number[][][]) {
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
  }

  addSquares(points: number[], color: ColorRGBA) {
    if (this.lossPlot == null) return;
    var maxY = 2.0 / this.lossPlot.gXYratio - 0.05;
    const sqHalfWidth = 0.02;

    for (let i = 0; i < points.length; i++) {
      const pointX = 1.9 * i / this.maxPointX - 1 + 0.05;
      const YDiff = this.maxPointY - this.minPointY;
      var pointY = 0;
      if (YDiff > 10e-7)
        pointY = maxY * (points[i] - this.minPointY) / YDiff - maxY / 2;
      
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
      const pointX = 1.9 * i / this.maxPointX - 1 + 0.05;
      const YDiff = this.maxPointY - this.minPointY;
      var pointY = 0;
      if (YDiff > 10e-7)
        pointY = maxY * (points[i] - this.minPointY) / YDiff - maxY / 2;

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
    line.lineSpaceX(-1 + 0.05, 1.9 / this.maxPointX);

    // Scale Y points
    var maxY = 2.0 / this.lossPlot.gXYratio - 0.05;
    var inputs: number[] = []
    const YDiff = this.maxPointY - this.minPointY;
    var pointY = 0;
    if (YDiff > 10e-7)
      for (let i = 0; i < points.length; i++)
        inputs.push(maxY * (points[i] - this.minPointY) / YDiff - maxY / 2);
    else
      for (let i = 0; i < points.length; i++)
        inputs.push(0);
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

    // Legend
    this.lossLineParams = [];
    this.lossLineEnabled = [];

    // X axis
    const canvasX = <HTMLCanvasElement>document.getElementById("loss-x-axis");
    this.xAxisWidth  = canvasX.clientWidth * devicePixelRatio;
    this.xAxisHeight = canvasX.clientHeight * devicePixelRatio;
    // this.xAxisHeight = this.xAxisWidth / 1728 * 108;
    canvasX.width  = this.xAxisWidth;
    canvasX.height = this.xAxisHeight;

    this.xAxis = canvasX.getContext("2d");
    if (this.xAxis) {
      this.xAxis.font = "18px Courier New";
      this.xAxis.fillStyle = "white";
      this.xAxis.strokeStyle = "white";
      this.xAxis.lineWidth = 2;
    }
    
    // Y axis
    const canvasY = <HTMLCanvasElement>document.getElementById("loss-y-axis");
    this.yAxisWidth  = canvasY.clientWidth  * devicePixelRatio;
    this.yAxisHeight = canvasY.clientHeight * devicePixelRatio;
    canvasY.width  = this.yAxisWidth;
    canvasY.height = this.yAxisHeight;

    this.yAxis = canvasY.getContext("2d");
    if (this.yAxis) {
      this.yAxis.font = "18px Courier New";
      this.yAxis.fillStyle = "white";
      this.yAxis.strokeStyle = "white";
      this.yAxis.lineWidth = 2;
    }
  }

  updateInfo() {
    if (this.lossPlot == null) return;
    this.lossPlot.removeAllLines();

    const lineNames = [];

    const points: number[][] = [];
    if (this.lossPoints[0].fold === undefined) {
      lineNames.push("Loss");
      points.push([]);
      for (const point of this.lossPoints) {
        points[0].push(point.loss);
      }
      if (this.lossPoints[0].valLoss !== undefined) {
        lineNames.push("Loss (test)");
        points.push([]);
        for (const point of this.lossPoints) {
          points[1].push(point.valLoss);
        }
      }
    }
    else {
      const noOfFolds = this.lossPoints[this.lossPoints.length - 1].fold + 1;
      for (let i = 0; i < noOfFolds; i++) {
        points.push([]);
        points.push([]);
        lineNames.push(`Loss${i} (train)`);
      }
      for (let i = 0; i < noOfFolds; i++)
        lineNames.push(`Loss${i} (val)`);
      for (const point of this.lossPoints) {
        points[point.fold].push(point.loss)
        points[noOfFolds + point.fold].push(point.valLoss)
      }
    }

    for (let i = this.lossLineEnabled.length; i < points.length; i++)
      this.lossLineEnabled.push(true);

    this.lossLineParams = [];

    const step_r = Math.floor(250 / points.length);
    const step_g = Math.floor(20  / points.length);
    const step_b = Math.floor(40  / points.length);

    for (let i = 0; i < points.length; i++) {
      var r = 202 - i * step_r;
      var g = 42  + i * step_g;
      var b = 80  + i * step_b;

      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      
      const line = points[i];
      const color = new ColorRGBA(r / 255, g / 255, b / 255, 1);
      
      if (this.lossLineEnabled[i] == true) {
        this.addLossLine(line, color);
        this.lossLineParams.push([lineNames[i], `${r}, ${g}, ${b}`]);
      }
      else
        this.lossLineParams.push([lineNames[i], `${69}, ${69}, ${69}`]);
    }

    this.lossPlot.update();
    (<HTMLDivElement>document.getElementById('spinner')).style.display = "none";
    this.updateXAxis();
    this.updateYAxis();
  }

  toggleLineEnable(index: number) {
    this.lossLineEnabled[index] = !this.lossLineEnabled[index];
    this.updateInfo();
  }

  updateXAxis() {
    if (this.xAxis == null) return
    this.xAxis.clearRect(0, 0, this.xAxisWidth, this.xAxisHeight);
    this.xAxis.beginPath();

    this.xAxis.moveTo(0, 0);
    this.xAxis.lineTo(this.xAxisWidth, 0);
    this.xAxis.stroke();
    
    var step = 1;
    if (this.maxPointX > 16)
      step = Math.floor(this.maxPointX / 16);

    for (let i = 0; i < this.maxPointX + 1; i += step) {
      // 0.05 to 1.95 (0 - 2)
      const xNorm = 1.9 * i / this.maxPointX + 0.05;
      // 0 to maxW
      const x = this.xAxisWidth * xNorm / 2;
      
      const leftShift = (i + 1).toString().length * 5;
      
      var xLab = (i + 1).toString()
      if (xLab.length > 4)
        xLab = (i + 1).toPrecision(4);
      this.xAxis.fillText(`${xLab}`, x - leftShift, 25)
      this.xAxis.moveTo(x, 0);
      this.xAxis.lineTo(x, 10);
      this.xAxis.stroke();
    }
  }

  updateYAxis() {
    if (this.yAxis == null) return
    if (this.lossPlot == null) return;
    this.yAxis.clearRect(0, 0, this.yAxisWidth, this.yAxisHeight);
    this.yAxis.beginPath();

    this.yAxis.moveTo(this.yAxisWidth, 0);
    this.yAxis.lineTo(this.yAxisWidth, this.yAxisHeight);
    this.yAxis.stroke();

    var numberOfDvs = 1;

    var temp = this.maxPointX;
    temp = Math.floor(temp / 2);
    while (temp > 0) {
      numberOfDvs *= 2;
      temp = Math.floor(temp / 2);
    }
    numberOfDvs = Math.min(numberOfDvs, 16);

    const maxY = 2.0 / this.lossPlot.gXYratio - 0.05;
    const actualMaxY = 2.0 / this.lossPlot.gXYratio;
    
    for (let i = 0; i < numberOfDvs + 1; i++) {
      // const pointY = maxY * (points[i] - this.minPointY) / YDiff - maxY / 2;
      // 0.05 to maxY
      const yNorm = maxY * i / numberOfDvs - maxY / 2;
      const y = this.yAxisHeight * (yNorm + actualMaxY / 2) / actualMaxY;
      
      const yDiff = this.maxPointY - this.minPointY;
      const yLab = (yDiff * (1 - i / numberOfDvs) + this.minPointY).toPrecision(2);
      
      const leftShift = yLab.toString().length * 5;
      
      this.yAxis.fillText(`${yLab}`, this.yAxisWidth - 50 - leftShift, y + 5)
      this.yAxis.moveTo(this.yAxisWidth, y);
      this.yAxis.lineTo(this.yAxisWidth - 10, y);
      this.yAxis.stroke();
    }
  }

  checkLR(){
    if(Number((<HTMLInputElement>document.getElementById("lr")).value)>1000)
      (<HTMLInputElement>document.getElementById("lr")).value='1000';
    
  }

  ucitajModel(data2: number){

    const idRead = sessionStorage.getItem('idModela')

    if (idRead == null) return;

    const id = Number.parseInt(idRead);
    for (const model of this.parallelModels) {
      if (model.modelId == id) {
        this.onError("Model with this id is already being trained in parallel.")
        return;
      }
    }
    this.idModela = id;
    
    if(this.idModela != -1)
    {
      this.http.get(url+"/api/Model/LoadSelectedModel?idEksperimenta="+ this.idEksperimenta + "&idModela=" + data2, {responseType: 'text'}).subscribe(
        res=>{
          this.modelData =  JSON.parse(res);
          
          this.general     = this.modelData.General;
          this.snapshot    = this.modelData.Snapshot;
          this.annSettings = this.modelData.NetworkSettings;
          this.ioColumns   = this.modelData.IOColumns;

          const weights = JSON.parse(this.modelData.Weights);
          this.setWeights(weights);

          this.nizGeneral = Object.values(this.general);

          // Model name
          this.nazivModela = this.nizGeneral[1];
          this.modelName = this.nazivModela;
          // Model description
          this.modelDescription = this.nizGeneral[5];
          
          /*  SNAPSHOT  */
          if(this.snapshot == 0) {
            this.imeS("Default snapshot");
            sessionStorage.setItem('idSnapshota',"Default snapshot");
            sessionStorage.setItem('idS',"0");
          }
          else {
            for(let i = 0; i < this.snapshots.length; i++) {
              if(this.snapshot == this.snapshots[i].id) {
                this.imeS(this.snapshots[i].ime);
                sessionStorage.setItem('idSnapshota', this.snapshots[i].ime);
                sessionStorage.setItem('idS', this.snapshot + "");
                break;
              }
            }
          }
          this.selectedSS=this.snapshot;
          this.momentum = true;
          this.http.get(url+"/api/Model/Kolone?idEksperimenta=" + this.idEksperimenta + "&snapshot="+ this.snapshot).subscribe(
            (response: any)=>{
              this.kolone  = Object.assign([],response);   //imena kolona
              this.kolone2 = [];
              this.ulazneKolone  = [];
              this.izlazneKolone = [];
              let nizUlazi  = this.ioColumns[0];
              let nizIzlazi = this.ioColumns[1];

              /* ULAZNE/IZLAZNE KOLONE */
              for (let i = 0; i < this.kolone.length; i++) {
                
                var c_type = "None";
                if (nizUlazi.includes(i)) {
                  c_type = "Input";
                  this.ulazneKolone.push(this.kolone[i]);
                }
                else if (nizIzlazi.includes(i)) {
                  c_type = "Output";
                  this.izlazneKolone.push(this.kolone[i]);
                }

                this.kolone2.push({value : this.kolone[i], type : c_type});
              }
              
              /* ANN SETTINGS */
              this.nizAnnSettings = Object.values(this.annSettings);
              
              // Problem type
              (<HTMLSelectElement>document.getElementById("dd4")).value = this.nizAnnSettings[0]+"";
              // Learning rate
              (<HTMLInputElement>document.getElementById("lr")).value   = this.nizAnnSettings[1]+"";
              // Batch size
              (<HTMLInputElement>document.getElementById("bs")).value   = this.nizAnnSettings[2]+"";
              // Number of epochs
              (<HTMLInputElement>document.getElementById("noe")).value  = this.nizAnnSettings[3]+"";
              
              // Current epoch
              this.currentEpoch = this.nizAnnSettings[4];

              // Is model trained (locked)
              if (this.currentEpoch > 0) {
                this.disableInputs();
                this.drawCanvas();
                this.prikaziPredikciju = true;
                this.predictionDisabled = false;
              }
              else
                this.enableInputs();

              // Number of I/O
              this.brojU = this.nizAnnSettings[5];
              this.brojI = this.nizAnnSettings[6];

              // Hidden layers
              this.hiddLay    = this.nizAnnSettings[7];
              this.nizCvorova = Object.assign([], this.hiddLay);
              this.brHL       = this.nizCvorova.length;

              // Activation function
              this.aktFunk = this.nizAnnSettings[8];

              // Regularization
              (<HTMLSelectElement>document.getElementById("dd1")).value = this.nizAnnSettings[9] +"";
              (<HTMLInputElement>document.getElementById("rr")).value   = this.nizAnnSettings[10]+"";

              // Loss function
              if(this.nizAnnSettings[0] == 1) {
                this.klasifikacija = true;
                this.tip = 1;
                this.selectedLF = this.nizAnnSettings[11];
              }
              else {
                this.klasifikacija = false;
                this.tip = 0;
                this.selectedLF = this.nizAnnSettings[11];
              }

              // Optimizer
              (<HTMLSelectElement>document.getElementById("dd3")).value = this.nizAnnSettings[12]+"";

              // Momentum
              if(this.nizAnnSettings[12] > 7) {
                this.momentum = true;
                (<HTMLInputElement>document.getElementById("momentum")).value = this.nizAnnSettings[13][0]+"";
              }
              else
                this.momentum = false;

              // Cross validation
              if(this.nizAnnSettings[14] == 0) {
                this.flag = false;
                (<HTMLInputElement>document.getElementById("toggle")).checked = false;
              }
              else {
                this.flag = true;
                (<HTMLInputElement>document.getElementById("toggle")).checked = true;
                (<HTMLInputElement>document.getElementById("crossV")).value   = this.nizAnnSettings[14]+"";
              }
            },
            error =>{
              console.error(error.error);
              this.onError(error.error);
            }
          );
        },
        error=>{
          console.error(error.error);
          this.onError(error.error);
        }
      )
    }
    
  }

  primiSnapshot(data:number){

    if(this.inputsLocked == false)
    {
      let snap = sessionStorage.getItem('idSnapshota');
      let idsnap = sessionStorage.getItem('idS');
    
      if(data == 0)
      {
        this.imeS("Default snapshot");
        this.selectSnapshot(data, "Default snapshot");
      }
      else
      {
        for(let i=0; i<this.snapshots.length; i++)
        {
          if(this.snapshots[i].id == data)
          {
            if(this.imeS(this.snapshots[i].ime))
            {
              if((<HTMLButtonElement>document.getElementById("dropdownMenuButton2")).innerHTML === snap)
              {
                // console.log((<HTMLButtonElement>document.getElementById("dropdownMenuButton2")).innerHTML);
                // console.log(data);
                this.selectSnapshot(data, this.snapshots[i].ime);
              }
            }
              return;
          }
        }
      }
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

   // this.flagP = true;
    if (e.type === 'None'){
      
      for(let i=0; i<this.nizNedozvoljenih.length;i++)
      {
        if(this.nizNedozvoljenih[i] === e.value)
        {
          this.onInfo("Columns need to be numerical or encoded and cannot contain NA");
          return;
        }
      }
      e.type = 'Output';
      this.izlazneKolone.push(e.value);
      this.brojI++;
      if(this.ulazneKolone.length == 0)
      {
        if(this.buttonDisable == false && this.saveModelLocked == false)
        {
          this.buttonDisable = true;
          this.saveModelLocked = true;
        }
      }
      else
      {
        this.buttonDisable = false;
        this.saveModelLocked = false;
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
        if(this.buttonDisable == false && this.saveModelLocked == false)
        {
          this.buttonDisable = true;
          this.saveModelLocked = true;
        }
      }
      else
      {
        this.buttonDisable = false;
        this.saveModelLocked = false;
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
          if(this.buttonDisable == false && this.saveModelLocked == false)
        {
          this.buttonDisable = true;
          this.saveModelLocked = true;
        }
          //console.log("TRUE-------------------------------");
        }
        else if(this.ulazneKolone.length == 0 && this.izlazneKolone.length == 0)
        {
          if(this.buttonDisable == false && this.saveModelLocked == false)
          {
            this.buttonDisable = true;
            this.saveModelLocked = true;
          }
        }
        else
        {
          this.buttonDisable = false;
          this.saveModelLocked = false;
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
    var s = (<HTMLInputElement>document.getElementById("bs")).value;
    var bs = Number(s);
    s = (<HTMLInputElement>document.getElementById("lr")).value;
    var lr = Number(s);
    var ins = this.brojU;
    s = (<HTMLInputElement>document.getElementById("noe")).value;
    var noe = Number(s);
    var os = this.brojI;
    s = (<HTMLInputElement>document.getElementById("rr")).value;
    var rr = Number(s);
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

  canContinueTraining() {
    var crossVK;
    if(this.flag == false)
      crossVK = 1;
    else
      crossVK = Number((<HTMLInputElement>document.getElementById("crossV")).value);
    return this.currentEpoch < this.numberOfEpoch * crossVK;
  }

  treniraj(){
    this.currentEpochPercent = 0;
    this.showStat = false;
    // Cross validation
    var crossVK;
    if(this.flag == false)
      crossVK = 0;
    else
      crossVK = Number((<HTMLInputElement>document.getElementById("crossV")).value);

    // Inputs and outputs
    var inputs = [];
    var outputs = [];
    for (let i in this.kolone2) {
      var kolona = this.kolone2[i];
      if (kolona.type === 'Input')
        inputs.push(i);
      else if (kolona.type === 'Output')
        outputs.push(i);
    }

    // ?
    this.inputCol  = inputs;
    this.outputCol = outputs;

    // Momentum
    if(this.momentum==true)
      this.optimizationParams[0]=Number((<HTMLInputElement>document.getElementById("momentum")).value);
    
    // number of Epochs (Progress bar)
    var numOfE = Number((<HTMLInputElement>document.getElementById("noe")).value);
    if(crossVK == 0)
        this.numOfEpochsTotal = numOfE;
    else
        this.numOfEpochsTotal = numOfE * crossVK;

    const trainingData = 
    {
        "ModelId"  : this.idModela,
        "Snapshot" : this.selectedSS,
        "Columns"  :
        {
          "ulazne":inputs,
          "izlazne":outputs
        },
        "AnnSettings":
        {
          "annType"             : this.selectedPT,
          "learningRate"        : Number((<HTMLInputElement>document.getElementById("lr")).value),
          "batchSize"           : Number((<HTMLInputElement>document.getElementById("bs")).value),
          "numberOfEpochs"      : Number((<HTMLInputElement>document.getElementById("noe")).value),
          "currentEpoch"        : this.currentEpoch,
          "inputSize"           : inputs.length,
          "outputSize"          : outputs.length,
          "hiddenLayers"        : this.nizCvorova,
          "activationFunctions" : this.aktFunk,
          "regularization"      : this.selectedRM,
          "regularizationRate"  : Number((<HTMLInputElement>document.getElementById("rr")).value),
          "lossFunction"        : this.selectedLF,
          "optimizer"           : this.selectedO,
          "optimizationParams"  : this.optimizationParams,
          "kFoldCV"             : crossVK
        }
    };
    
    // loading ... 
    this.http.post(url+"/api/Model/Model/Treniraj?idEksperimenta=" + this.idEksperimenta, trainingData, {responseType:"text"}).subscribe(
      res => {
        this.onInfo("Training has started.");
        (<HTMLDivElement>document.getElementById('boxZT')).scrollIntoView();

        // pauza   
        this.buttonPause = true;
        this.buttonPlay = false;
        this.buttonContinue = false; 
        this.modelText = this.modelStateTexts[1];

        // Initialize loss draw
        this.initializeDrawer();

        // Disable network changes
        this.disableInputs()
      },
      err => {
        console.error(err.error);
        this.onError(err.error);
      }
    )
  }

  disableInputs() {
    this.inputsLocked = true;
  }

  enableInputs() {
    this.inputsLocked = false;
    
    this.recreateNetwork();

    this.prikazi = false;
    this.prikazi1 = false;
    this.prikaziPredikciju = false;
    this.predictionDisabled = true;
    
    this.modelText = this.modelStateTexts[0];
    this.buttonDisable = false;
    this.saveModelLocked = false;
    this.buttonPlay = true;
    this.buttonContinue = false;
    this.buttonPause = false;

    this.currentEpoch = 0;
  }

  downloadModel() {
    var fileName = this.nazivModela;
    if (fileName == undefined)
      fileName = "Model"
    this.http.post(url+"/api/File/downloadCurrentModel/" + this.idEksperimenta + "?modelId=" + this.idModela + "&modelName=" + fileName, null, {responseType:"text"}).subscribe(
      res => {
      saveAs(new Blob([res]), fileName + ".pt");
       this.onSuccess("Model was successfully downloaded.");
      },
      err => {
        this.onError(err.error);
        console.error(err.error); 
      }
     );
  }

  dismissTraining(modal: any) {
    this.http.post(url+"/api/Model/Model/PrekiniTrening?idEksperimenta=" + this.idEksperimenta + "&idModela=" + this.idModela, null ,{responseType:'text'}).subscribe(
      res => {
        this.onInfo("Training dismisted.");
        modal.dismiss('Cross click');
        this.enableInputs();
      },
      err => {
        this.onError(err.error);
      }
    )
  }

  saveTrainingForParralel(modal: any) {
    modal.dismiss('Cross click');
    this.forkUponSave = true;
    this.open(this.saveModelDialog);
  }

  forkTraining() {
    // Za sada samo odbacuje trening
    if (this.idModela == 0) {
      this.open(this.notSaved);
    }
    else {
      console.log("-------------------------");
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

      if(this.momentum==true)
        this.optimizationParams[0]=Number((<HTMLInputElement>document.getElementById("momentum")).value);

      const nazivModela = this.modelName;
      if(nazivModela.trim()==="")
      {
        this.onError("Model name is required");
        return;
      }
      this.nazivModela = nazivModela;

      const jsonModel = 
      {
          "naziv"       : nazivModela,
          "opis"        : this.modelDescription,
          "snapshot"    : this.selectedSS,
          "podesavalja" :
          {  
            "annType"             : this.selectedPT,
            "learningRate"        : Number((<HTMLInputElement>document.getElementById("lr")).value),
            "batchSize"           : Number((<HTMLInputElement>document.getElementById("bs")).value),
            "numberOfEpochs"      : Number((<HTMLInputElement>document.getElementById("noe")).value),
            "currentEpoch"        : this.currentEpoch,
            "inputSize"           : inputs.length,
            "outputSize"          : outputs.length,
            "hiddenLayers"        : this.nizCvorova,
            "activationFunctions" : this.aktFunk,
            "regularization"      : this.selectedRM,
            "regularizationRate"  : Number((<HTMLInputElement>document.getElementById("rr")).value),
            "lossFunction"        : this.selectedLF,
            "optimizer"           : this.selectedO,
            "optimizationParams"  : this.optimizationParams,
            "kFoldCV"             :crossVK
          },
          "kolone" :
          {
            "ulazne"  : inputs,
            "izlazne" : outputs
          }
      };
      var epochTotal = 0;
      if(jsonModel.podesavalja.kFoldCV == 0)
         epochTotal = jsonModel.podesavalja.numberOfEpochs;
      else
         epochTotal = jsonModel.podesavalja.kFoldCV * jsonModel.podesavalja.numberOfEpochs;

      // Model state
      var modelState = 'r';
      if (this.buttonContinue == true)
        modelState = 'p';
      else if (this.buttonPlay == true)
        modelState = 'f';

      console.log(this.idModela);
      this.parallelModels.push({
        'jsonModel': jsonModel,
        'modelId':this.idModela,
        'numOfEpochsTotal':epochTotal,
        'currentTrainStatus':0,
        'modelState': modelState
      })
      sessionStorage.setItem('models',JSON.stringify(this.parallelModels));

      this.idModela = 0;
      this.enableInputs();
    }
  }

  openParallelModelView(model: any) {
    //console.log("DEBUG");
    this.modelparallel = model;

    this.open(this.parallel);
    // console.log(model);
  }

  stopParallelTraining(model: any) {
    this.http.post(url+"/api/Model/Model/Pauziraj?idEksperimenta=" + this.idEksperimenta + "&idModela=" + model.modelId, null ,{responseType:'text'}).subscribe(
      res => {
        model.modelState = 'p';
        this.onInfo("Training is paused.");
      },
      error => {
        console.log(error.error);
      }
    )
  }
  continueParallelTraining(model: any) {
    const numberOfEpoch = model.jsonModel.podesavalja.numberOfEpochs;
    const learningRate  = model.jsonModel.podesavalja.learningRate;
    this.http.post(url+"/api/Model/Model/NastaviTrening?idEksperimenta=" + 
                   this.idEksperimenta + "&idModela=" + model.modelId + "&numberOfEpoch="+numberOfEpoch+
                   "&learningRate=" + learningRate, null ,{responseType:'text'}).subscribe(
      res => {
        model.modelState = 'r';
        this.onInfo("Training continues.");
      },
      error => {
        console.log(error.error);
      }
    )
  }
  dismissParallelTraining(model: any, modal: any) {
    this.http.post(url+"/api/Model/Model/PrekiniTrening?idEksperimenta=" + this.idEksperimenta + "&idModela=" + model.modelId, null ,{responseType:'text'}).subscribe(
      res => {
        var index = -1;
        for (let i = 0; i < this.parallelModels.length; i++) {
          const m = this.parallelModels[i];
          if (m.modelId == model.modelId) {
            index = i;
            break;
          }
        }
        if (index > -1)
          this.parallelModels.splice(index, 1);
        modal.dismiss('Cross click');
        this.onInfo("Training dismissed.");
        sessionStorage.setItem('models',JSON.stringify(this.parallelModels));
      },
      err => {
        this.onError(err.error);
      }
    )
  }
  saveParallelModel(model: any) {
    this.http.put(url+"/api/Model/OverrideModel?idEksperimenta="+this.idEksperimenta + "&idModela=" + model.modelId, model.jsonModel, {responseType: 'text'}).subscribe(
      res=>{
        this.saveModel(model.modelId, model.modelId, true);
      },err=>{
        this.onError("Model was not saved."); 
      }
    );
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
    console.log(this.weights);

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

        if(Number(str) >= 10)
        {
           this.broj = 10;
           (<HTMLInputElement>document.getElementById(this.pom)).value = "10";
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

  private oldModelId: number = 0;

  kreirajModelCuvanje(modal:any)
  {
    //this.prikaziPredikciju = false;
    //this.predictionDisabled = true;
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

    const nazivModela = this.modelName;
    if(nazivModela.trim()==="")
    {
      this.onError("Model name is required");
      return;
    }
    this.nazivModela = nazivModela;

    this.jsonModel = 
    {
        "naziv"       : nazivModela,
        "opis"        : this.modelDescription,
        "snapshot"    : this.selectedSS,
        "podesavalja" :
        {  
          "annType"             : this.selectedPT,
          "learningRate"        : Number((<HTMLInputElement>document.getElementById("lr")).value),
          "batchSize"           : Number((<HTMLInputElement>document.getElementById("bs")).value),
          "numberOfEpochs"      : Number((<HTMLInputElement>document.getElementById("noe")).value),
          "currentEpoch"        : this.currentEpoch,
          "inputSize"           : inputs.length,
          "outputSize"          : outputs.length,
          "hiddenLayers"        : this.nizCvorova,
          "activationFunctions" : this.aktFunk,
          "regularization"      : this.selectedRM,
          "regularizationRate"  : Number((<HTMLInputElement>document.getElementById("rr")).value),
          "lossFunction"        : this.selectedLF,
          "optimizer"           : this.selectedO,
          "optimizationParams"  : this.optimizationParams,
          "kFoldCV"             :crossVK
        },
        "kolone" :
        {
          "ulazne"  : inputs,
          "izlazne" : outputs
        }
    };
    
    this.http.post(url+"/api/Model/NoviModel?idEksperimenta="+this.idEksperimenta+"&model="+nazivModela, null, {responseType: 'text'}).subscribe(
      res => {
        this.oldModelId = this.idModela;
        const newModelId = Number.parseInt(res);
        
        if(res == "-1") //kreira novi model
        {
          this.http.post(url+"/api/Model/KreirajNoviModel?idEksperimenta="+this.idEksperimenta, this.jsonModel, {responseType: 'text'}).subscribe(
            res => {
              this.idModela = Number.parseInt(res);;
              //this.izadjiIzObaModala();
              modal.dismiss('Save click');
              this.saveModel(this.oldModelId, this.idModela);
            },
            error =>{
              console.log(error.error);
              this.onError("Model was not created.");
              //this.izadjiIzObaModala();
              modal.dismiss('Save click');
            }
          ); 
        }
        else // override modela
        {
          for (const model of this.parallelModels) {
            if (model.modelId == newModelId) {
              this.onError("Model with this id is already being trained in parallel.")
              return;
            }
          }
          this.idModela = newModelId;
          this.modalToCloseOverride = modal;
          this.open(this.overridemodela);
        }
      },
      error =>{
        console.error(error.error);
        this.onError("Model was not created.");
      }
    );
  }

  overrideModel()
  { console.log(this.idModela);
    this.http.put(url+"/api/Model/OverrideModel?idEksperimenta="+this.idEksperimenta + "&idModela=" + this.idModela, this.jsonModel, {responseType: 'text'}).subscribe(
        res=>{
          this.saveModel(this.oldModelId, this.idModela);
          this.modalToCloseOverride.close('Close');
        },err=>{
          this.onError("Model was not overrided."); 
          this.modalToCloseOverride.close('Close');
        }
      ); 
  }

  saveModel(oldModelId: number, newModelId: number, isParallel: boolean = false) {
    if (this.inputsLocked == false && isParallel==false)
      oldModelId = -1;
    this.http.post(url + "/api/Model/Save?idEksperimenta=" + this.idEksperimenta + "&modelIdOld=" + oldModelId + "&modelIdNew=" + newModelId, null, {responseType : 'text'}).subscribe(
      res => {
        this.onSuccess("Model was successfully saved.");
        if (isParallel == false)
          this.PosaljiModel.emit(this.selectedSS);
        if (this.forkUponSave == true) {
          this.forkUponSave = false;
          this.forkTraining();
        }
      },
      error => {
        console.log(error.error);
        this.onError(error.error);
      }
    )
  }

  izadjiIzObaModala()
  {
    let el: HTMLElement = this.btnexitoverridemodel.nativeElement;
    el.click();
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
   return true;
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
   this.http.post(url+"/api/Eksperiment/Eksperiment/Csv",null,{params:{idEksperimenta:this.idEksperimenta, idSnapshota:id.toString()}}).subscribe(
     res=>{
      this.http.get(url+"/api/Upload/ColumnsNumericalCheck?idEksperimenta=" + this.idEksperimenta).subscribe(
        (response: any) => {
          
          var pomocniNiz = response;

          console.log(pomocniNiz);

          this.http.get(url+"/api/Model/Kolone?idEksperimenta=" + this.idEksperimenta + "&snapshot="+ id).subscribe(
           (response: any)=>{
              //  this.nizKolonaStr = [];
                this.nizNedozvoljenih = [];
               this.kolone = Object.assign([],response);   //imena kolona
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
                 for(let i=0; i<pomocniNiz.length; i++)
                 {
                   console.log(pomocniNiz[i]);
                   if(pomocniNiz[i] == false)
                   {
                     (this.kolone2[i]).type = 'None';
                     this.nizNedozvoljenih.push((this.kolone2[i]).value);
                   }
                 }
                var ind = 0;
                for(let i=0; i< this.kolone2.length; i++)
                {
                    if(this.kolone2[i].type == "Output")
                    {
                      ind = 1;
                    }
                }
                if(ind == 0)
                {
                  for(let i=this.kolone2.length-1; i>=0; i--)
                  {
                    if(this.kolone2[i].type == "Input")
                    {
                      (this.kolone2[i]).type = 'Output';
                      break;
                    }
                  }
                }
                var brojac = 0;
                for(let i=0; i<this.kolone2.length-1; i++)
                {
                  if(this.kolone2[i].type === 'Input')
                  {
                    this.ulazneKolone[brojac] = this.kolone2[i].value;
                    brojac++;
                  }
                }
                for(let i=0; i<this.kolone2.length; i++)
                {
                  if(this.kolone2[i].type === 'Output')
                  {
                    this.izlazneKolone[0] = this.kolone2[i].value;
                  }
                }
                if(this.brojU == 0 || this.brojI == 0)
                {
                  this.brojU = this.ulazneKolone.length;
                  this.brojI = 1;
                }
                // console.log(this.brojU);
                this.buttonDisable = false;
                this.saveModelLocked = false;
                this.hiddLay = [3,3,3,3,3];
                this.nizCvorova = [3,3,3,3,3];
                this.brHL = 5;
                this.aktFunk = [0,0,0,0,0];
                this.recreateNetwork();
               }
               
            },error =>{
             console.log(error.error);
           }
          );
       })
     }
   );
    
   this.selectedSS=id;
  //  console.log(this.selectedSS);
 }


  dajMetriku(modelId:number)
  {
    this.http.get(url+"/api/Model/metrika?modelId="+ modelId + "&idEksperimenta=" + this.idEksperimenta).subscribe(
      res => {
        console.table(res);
        this.jsonMetrika = Object.values(res);
        this.showStat = true;
        console.log(this.jsonMetrika);
        this.trainR=Object.assign([],this.jsonMetrika[1]);
        this.testR=Object.assign([],this.jsonMetrika[0]);
        console.log(this.trainR);
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
        this.dajMetriku(this.idModela);

        // nastavi trening 
        this.buttonContinue = true;
        this.buttonPause = false;
        this.buttonPlay = false; 
        this.modelText = this.modelStateTexts[2];
        this.onInfo("Training is paused.");
      },
      error => {
        console.log(error.error);
      }
    )
  }

  numberOfEpochChanged() {
    console.log(this.numberOfEpoch);
  }

  nastaviTrening()
  {
    const numberOfEpoch = Number((<HTMLInputElement>document.getElementById("noe")).value)
    const learningRate  = Number((<HTMLInputElement>document.getElementById("lr")).value)
    this.http.post(url+"/api/Model/Model/NastaviTrening?idEksperimenta=" + 
                   this.idEksperimenta + "&idModela=" + this.idModela + "&numberOfEpoch="+numberOfEpoch+
                   "&learningRate=" + learningRate, null ,{responseType:'text'}).subscribe(
      res => {
        console.table(res);
        //console.log("Nastavljam"); 

        this.buttonPause = true;
        this.buttonPlay = false;
        this.buttonContinue = false; 
        this.modelText = this.modelStateTexts[1];
        this.onInfo("Training continues.");
      },
      error => {
        console.log(error.error);
      }
    )
  }

  scrollToPrediction()
  {
    (<HTMLDivElement>document.getElementById('prediction')).scrollIntoView();
  }

  open(content: any) {
    this.ngbModalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  showTooltip(tooltipType: string) {
    var tooltip = (<HTMLSpanElement>document.getElementById(`tooltip-${tooltipType}`));
    var helper = (<HTMLDivElement>document.getElementById(`helper-${tooltipType}`));
    tooltip.style.left = `${helper.getBoundingClientRect().left}px`;
    tooltip.style.top = `${helper.getBoundingClientRect().top}px`;
    tooltip.style.display = 'unset';
  }

  hideTooltip(tooltipType: string) {
    var tooltip = (<HTMLSpanElement>document.getElementById(`tooltip-${tooltipType}`));
    tooltip.style.display = 'none';
  }

  openSaveModelDialog()
  {
    this.open(this.saveModelDialog);
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}