import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared/shared.service';
import { ActivatedRoute } from '@angular/router';
import { url } from '../app.module';
import {NotificationsService} from 'angular2-notifications'; 
import { DatePipe } from '@angular/common';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef, ViewChild,ElementRef } from '@angular/core';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { HtmlParser } from '@angular/compiler';
import { EventManager } from '@angular/platform-browser';
import { ChartData, ChartDataset, ChartType } from 'chart.js';

@Component({
  selector: 'app-podaci',
  templateUrl: './podaci.component.html',
  styleUrls: ['./podaci.component.css']
})
export class PodaciComponent implements OnInit {

  private eventsSubscription!: Subscription;

  @Output() PosaljiSnapshot:EventEmitter<number> = new EventEmitter<number>();

  @Input() snapshots!: any[];

  @Output() PosaljiPoruku = new EventEmitter();

  value: number = 50;
  options: Options = {
    floor: 0,
    ceil: 100,
    translate: (value: number): string => {
      return value + "%";
    }
  }
  
  ngOnInit(): void {
    //this.getStat();
    this.flag = 0;
    this.pomSnapshot = -1;
    this.pomImeS = "";
    this.ucitanipodaci();
    this.ucitajNaziv();
    //this.ucitajPodatkeSnapshota(0);
    //this.imeSnapshota("Default snapshot");
    // this.ucitajSnapshotove();
    (<HTMLInputElement>document.getElementById("input-ratio")).value = this.value + "";
  }


  @ViewChild('contentmdl') content:any;
  @ViewChild('btnexit') btnexit:any;

  // delete modals
  @ViewChild('modalDeleteClose') modalDeleteClose:any;
  @ViewChild('modalDelete') modalDelete:any;

  // new rwo
  @ViewChild('modalNew') modalNew:any;
  // new Na Value
  @ViewChild('modalNaValue') modalValue:any;

  @ViewChild('modalSnapshot') modalSnapshot:any;

  @ViewChild('modalBrisanjeVerzije') modalBrisanjeVerzije:any;

  ucitanipodaci(){
    this.http.get(url+"/api/Eksperiment/Eksperiment/Csv?id="+this.idEksperimenta,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.fileName=res;
        (<HTMLDivElement>document.getElementById("poruka")).className="visible-y";  
        (<HTMLDivElement>document.getElementById("porukaGreske")).className="nonvisible-n";  
        (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "visible";
        (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "visible";
        this.loadDefaultItemsPerPage();

        let snap = sessionStorage.getItem('idSnapshota');
        let idsnap = sessionStorage.getItem('idS');
        if(snap == null)
        { 
          sessionStorage.setItem('idSnapshota',"Default snapshot");
          sessionStorage.setItem('idS',"0");
          (<HTMLButtonElement>document.getElementById("dropdownMenuButton1")).innerHTML = "Default snapshot";
          this.ucitajPodatkeSnapshota(0,'Default snapshot');
        }
        else
        {  
          (<HTMLButtonElement>document.getElementById("dropdownMenuButton1")).innerHTML = snap;
          if(idsnap != null)
              this.ucitajPodatkeSnapshota(Number(idsnap),snap);
        }
      },
      error=>{
        //console.log("OVDE----------------");
        //(<HTMLButtonElement>document.getElementById("dropdownMenuButton1")).innerHTML = "Chose default snapshot";
      }
    )
  }

  constructor(public http: HttpClient, private activatedRoute: ActivatedRoute, private shared: SharedService, private modalService: NgbModal, private service: NotificationsService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        // console.log(this.idEksperimenta);
      }
    )
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

  getStat()
  {
    this.http.get<any>('/assets/stats.json').subscribe(
      response => {
        // console.log(response);
        let str = JSON.stringify(response);
        this.statistika = JSON.parse(str);
        this.numerickaS = this.statistika.statsNum;
        this.kategorijskaS = this.statistika.statsCat;
        this.values = Object.values(this.numerickaS);
        this.keys = Object.keys(this.numerickaS);
        this.valuesKat = Object.values(this.kategorijskaS);
        this.keysKat = Object.keys(this.kategorijskaS);
      }
    );
  }

  isArray(val:any): boolean { return val instanceof Array }
  
  fileName = '';
  fileNameTest = '';
  json: any;
  jsonStatistika: any;
  page: number = 1;
  itemsPerPage: any;
  //totalItems : any;
  totalItems: number = 0;
  idEksperimenta: any;
  selectedColumns: number[] = [];
  nizKomandi : string[] = [];
  nizKomandiTooltip : string[] = [];
  track: string = "> ";
  statistika: any;
  numerickaS: any;
  kategorijskaS: any;
  values: any;
  keys: any;
  valuesKat:any;
  keysKat:any;
  selectedName = "";
  selectedArray:string[] = [];
  headers:string[] = [];
  statistikaCat: any[] = [];
  statistikaNum: any[] = [];
  rowsAndPages:number[][] = [];
  ucitanCsv: boolean = false;
  nazivEksperimenta:any;
  rows:number[] = [];

  imageName : any;
  scatterplotImage : any;
  brojacUndoRedo : number = 0;
  brojacAkcija : number = 0;
  nizKomandiUndoRedo : string[] = [];
  nizKomandiUndoRedoTooltip : string[] = [];
  nizTipova : string[] = [];
  nizNumerickihKolona : number[] = [];
  nizKategorickihKolona : number[] = [];
  nizImenaTrenutnihKolona: string[] = [];

  niz2:any[] = [];

  selectedOutlier:string="";
  selectedNorm:string="";
  selectedData:string = "";
  selectedForRegression:number = -1;

  selectedSnapshot : string = "Default snapshot";

  threshold:number = 0; 

  public kolone: any[] = [];
  message: any;

  selektovanGrafik: string = "";
  indikator:boolean = true; // tabela sa podacima
  nizRedovaStatistika:string[][] = []; // statistika numerickih vrednosti

  public flag : number = 0;
  public pomSnapshot = -1;
  public pomImeS = "";

  closeResult = ''; // Ng Modal 1 
  nazivSnapshot = "";
  idSnapshotaOverride:string = "";
  nazivSnapshotaOverride:string = "";

  selektovanS : number = -1;
  selektovanSime : string = "";

  // Pie plot 
  public chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 12
          }
        },
        position: 'right'
      }
    }
  };

  public pieChartType: ChartType = 'pie';
  public chartLegend: boolean = true;

pieChartImage: any; 

lineDatas :any = [
    // this.lineData

  ];
  
  // Tooltip
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

  onFileSelected(event:any) 
  {
    const file:File = event.target.files[0];

    if (file) 
    {
      this.fileName = file.name;

      const formData = new FormData();
      formData.append("file", file, this.fileName);  	

      const upload$ = this.http.post(url+"/api/File/upload/" + this.idEksperimenta , formData, {responseType: 'text'}).subscribe(
        res=>{
          // this.ucitajSnapshotove();
          this.PosaljiPoruku.emit();
          // this.ucitajPodatkeSnapshota(0);
          // this.imeSnapshota("Default snapshot");
          this.loadDefaultItemsPerPage();
          (<HTMLDivElement>document.getElementById("poruka")).className="visible-y";  
          (<HTMLDivElement>document.getElementById("porukaGreske")).className="nonvisible-n";  
          //(<HTMLDivElement>document.getElementById("pagingControls")).style.color = "white";
          (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "visible";
          (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "visible";
          this.onSuccess('Dataset loaded');

          // prvo ucitavanje session tokena 
          sessionStorage.setItem('idSnapshota',"Default snapshot");
          sessionStorage.setItem('idS',"0");
          (<HTMLButtonElement>document.getElementById("dropdownMenuButton1")).innerHTML = "Default snapshot";
          this.ucitajPodatkeSnapshota(0,'Default snapshot');
      },error =>{
        console.log(error.error);	
        var div = (<HTMLDivElement>document.getElementById("porukaGreske")).className="visible-n";
        // console.log("Greska");
        (<HTMLDivElement>document.getElementById("poruka")).className="nonvisible-y";  
        (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "hidden";
        (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "hidden";
        this.onError(error.error);

        if(error.error === "Unet nedozvoljen tip fajla."){
          console.log("Nedozvoljeno");
        }
      });
    }
  }

  ucitajTipoveKolona(){

    this.http.get(url+"/api/Upload/ColumnTypes?idEksperimenta=" + this.idEksperimenta).subscribe(
      (response: any) => {

        // console.log(response);
        this.nizTipova = response;
        this.dodajTipovePoredKolona(response); // dodavanje tipova

      },error =>{

        console.log(error.error);
      }
   );
  }

  loadDefaultItemsPerPage()
  {      
    this.http.get(url+"/api/Upload/paging/1/10?idEksperimenta=" + this.idEksperimenta).subscribe(
       (response: any) => {
        this.jsonStatistika = undefined
        this.statistikaCat = []
        this.statistikaNum = []
        // console.log(response);
        // console.log(JSON.parse(response.data));
        this.json =  JSON.parse(response.data);
        // console.log("JSON:");
        // console.log(this.json);
        this.ucitanCsv = true;
        this.dajStatistiku();
         //this.json = response;
        this.totalItems = response.totalItems;
        this.gty(1);
        this.page = 1;
        this.ucitajTipoveKolona(); // premesteno
    })

    this.EnableDisableGrafik();
  }
  onFileSelectedTest(event:any){
    const filetest:File = event.target.files[0];

    if(filetest)
    {
      this.fileNameTest = filetest.name;

      const formData = new FormData();
      formData.append("file", filetest, this.fileNameTest);  

      const upload$ = this.http.post(url+"/api/Upload/uploadTest/" + this.idEksperimenta , formData, {responseType: 'text'}).subscribe(
        res=>{
          let dateTime = new Date();
          this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Test dataset loaded " + "(" + this.selectedSnapshot + ")");
          this.nizKomandiTooltip.push("" + dateTime.toString() + "");
          this.flag++;
          this.onSuccess('Test dataset loaded.');
      },error =>{
        console.log(error.error);	
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Test dataset is not loaded " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onError(error.error);
        
      });
    }

  }
  // vrednosti za submenu 
  
dajNaziveHeadera()
  {
    var niz = [""];
    var niz3 = [];
    var j = 0;

    if(this.json == undefined)
      return niz;

    for(var i =0;i<this.niz2.length;i++)
    {
      if(this.niz2[i] != "0")
      {
        niz3[j++] = this.niz2[i];
      }
    } 
    return niz3;
  }

  dajStatistiku()
  {
    this.http.get(url+"/api/Statistics/statistika?idEksperimenta=" + this.idEksperimenta, {responseType: 'text'}).subscribe(
      (response: any) => {
        // console.log(response);
        this.jsonStatistika = JSON.parse(response);
        this.ucitajStatistiku();
        
        this.tabelaStatistika();
        this.tabelaStatistikaCat();
      }
    )
  }

  ucitajStatistiku()
  {
    if(this.jsonStatistika == undefined)
      return;

    this.keys = Object.keys(this.jsonStatistika);
    this.niz2 = Object.keys(this.json[0]); /// ovde1
    this.values = Object.values(this.jsonStatistika);  // niz parova key : value
    //console.log(this.keys);
    //console.table(this.values);
    for (let index = 0; index < this.keys.length; index++) {
      const key = this.keys[index];
      //console.log(this.jsonStatistika[key].Maximum);
      if(this.jsonStatistika[key].Maximum == undefined)
      {
        // console.log(this.jsonStatistika[key].MostCommon);
        // console.log(this.jsonStatistika[key].Frequencies);
        let niz = [];
        niz.push({
          imeKljucVC:"ValidCount",
          ValidCount:this.jsonStatistika[key].ValidCount
        });
        niz.push({
          imeKljucNC:"NaCount",
          NaCount:this.jsonStatistika[key].NaCount
        });
        niz.push({
          imeKljucUC:"UniqueCount",
          UniqueCount:this.jsonStatistika[key].UniqueCount
        });
        // niz.push(this.jsonStatistika[key].MostCommon[0]);
        // niz.push(this.jsonStatistika[key].MostCommon[1]);
        // for (let index = 0; index < this.jsonStatistika[key].Frequencies.length; index++) {
          //console.log(this.jsonStatistika[key].Frequencies);
          for(var item in this.jsonStatistika[key].Frequencies)
          {
            var pom = this.jsonStatistika[key].Frequencies[item][1];
            var pomStr = pom.toString();
            var pomStrSpl = pomStr.split(".");
            if(pomStrSpl[1].length > 4)
            {
              var pom:any = true;
              var broj:any = pomStrSpl[1];
              var brojac:any = 0;
              for(var i=0; i<broj.length; i++)
              {
                if(broj[i] != '0')
                {
                  pom = false;
                  brojac = i + 1;
                  break;
                }
              }
              // if(pom == true)
              // {
              //   this.jsonStatistika[key].Frequencies[item][1] = (Number(this.jsonStatistika[key].Frequencies[item][1])).toFixed(0);
              // }
              /*else*/ if(pom == false && brojac > 4)
              {
                this.jsonStatistika[key].Frequencies[item][1] = (Number(this.jsonStatistika[key].Frequencies[item][1])).toFixed(brojac);
              }
              else
              {
                this.jsonStatistika[key].Frequencies[item][1] = (Number(this.jsonStatistika[key].Frequencies[item][1])).toFixed(4);
                var zaokruzenoBroj = this.jsonStatistika[key].Frequencies[item][1];
                var zaokruzenoStr = zaokruzenoBroj.toString();
                var zaokruzenoStrSplit = zaokruzenoStr.split(".");
                var decimale = zaokruzenoStrSplit[1];
                if(decimale[1] == '0' && decimale[2] == '0' && decimale[3] == '0')
                {
                  this.jsonStatistika[key].Frequencies[item][1] = (Number(this.jsonStatistika[key].Frequencies[item][1])).toFixed(1);
                }
                else if(decimale[2] == '0' && decimale[3] == '0')
                {
                  this.jsonStatistika[key].Frequencies[item][1] = (Number(this.jsonStatistika[key].Frequencies[item][1])).toFixed(2);
                }
                else if(decimale[3] == '0')
                {
                  this.jsonStatistika[key].Frequencies[item][1] = (Number(this.jsonStatistika[key].Frequencies[item][1])).toFixed(3);
                }
              }
            }
            else
              {
                var decimale = pomStrSpl[1];
                for(var i=decimale.length-1; i>=1; i--)
                {
                  if(decimale[i] == '0')
                  {
                    this.jsonStatistika[key].Frequencies[item][1] = (Number(this.jsonStatistika[key].Frequencies[item][1])).toFixed(i);
                  }
                  else
                    break;
                }
              }
            //console.log(this.jsonStatistika[key].Frequencies[item][1]);
          }
          niz.push({
            imeKljucF:"Frequencies",
            Frequencies:this.jsonStatistika[key].Frequencies
          });
        // }
        //console.log(niz)
        this.statistikaCat.push({
          key:key,
          data:niz
        });
      }
      else
      {
        for(var param in this.jsonStatistika[key])
        {
          if(param != 'Maximum' && param != 'Minimum')
          {
            var num = this.jsonStatistika[key][param];
            var str = num.toString();
            if(str.includes("."))
            {
              var strPom = str.split(".");
              if(strPom[1].length > 4)
              {
                var pom:any = true;
                var broj:any = strPom[1];
                var brojac:any = 0;
                for(var i=0; i<broj.length; i++)
                {
                  if(broj[i] != '0')
                  {
                    pom = false;
                    brojac = i + 1;
                    break;
                  }
                }
                // if(pom == true)
                // {
                //   this.jsonStatistika[key][param] = (Number(this.jsonStatistika[key][param])).toFixed();
                // }
                /* else*/ if(pom == false && brojac > 4)
                {
                  this.jsonStatistika[key][param] = (Number(this.jsonStatistika[key][param])).toFixed(brojac);
                }
                else
                {
                  this.jsonStatistika[key][param] = (Number(this.jsonStatistika[key][param])).toFixed(4);
                  var zaokruzenoBroj = this.jsonStatistika[key][param];
                  var zaokruzenoStr = zaokruzenoBroj.toString();
                  var zaokruzenoStrSplit = zaokruzenoStr.split(".");
                  var decimale = zaokruzenoStrSplit[1];
                  if(decimale[1] == '0' && decimale[2] == '0' && decimale[3] == '0')
                  {
                    this.jsonStatistika[key][param] = (Number(this.jsonStatistika[key][param])).toFixed(1);
                  }
                  else if(decimale[2] == '0' && decimale[3] == '0')
                  {
                    this.jsonStatistika[key][param] = (Number(this.jsonStatistika[key][param])).toFixed(2);
                  }
                  else if(decimale[3] == '0')
                  {
                    this.jsonStatistika[key][param] = (Number(this.jsonStatistika[key][param])).toFixed(3);
                  }
                }
              }
              else
              {
                var decimale = strPom[1];
                for(var i=decimale.length-1; i>=1; i--)
                {
                  if(decimale[i] == '0')
                  {
                    this.jsonStatistika[key][param] = (Number(this.jsonStatistika[key][param])).toFixed(i);
                  }
                  else
                    break;
                }
              }
            }
            //console.log(this.jsonStatistika[key][param]);
          }
        }
        //this.jsonStatistika[key]["StdDeviation"] = (Number(this.jsonStatistika[key]["StdDeviation"])).toFixed(4);
        this.statistikaNum.push({
          key:key,
          data:this.jsonStatistika[key]
        });
      }
    }
    // console.log(this.statistikaNum);
    //console.log(this.statistikaCat);
  }

  promeniBrojRedova(value: any)
  {
    this.itemsPerPage = parseInt(value);
    this.http.get(url+"/api/Upload/paging/1/" + this.itemsPerPage + "?idEksperimenta=" + this.idEksperimenta).subscribe(
      (response: any) => {
        this.json =  JSON.parse(response.data);
        this.totalItems = response.totalItems;
        this.page = 1;

        this.onInfo("Number of rows displayed: "+this.itemsPerPage);
    })
  }

  gty(page: any){
  //  console.log("---GTY--");
   this.itemsPerPage = (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).value;
  //  console.log(this.itemsPerPage);
  //  console.log(this.page);
   this.http.get(url+"/api/Upload/paging/" + page + "/" + this.itemsPerPage + "?idEksperimenta=" + this.idEksperimenta).subscribe(
      (response: any) => {
        this.json =  JSON.parse(response.data);
        this.totalItems = response.totalItems;
        this.nizImenaTrenutnihKolona = Object.keys(this.json[0]);
    })
  }
  gtyLoadPageWithStatistics(page: any){
    this.itemsPerPage = (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).value;
    this.http.get(url+"/api/Upload/paging/" + page + "/" + this.itemsPerPage + "?idEksperimenta=" + this.idEksperimenta).subscribe(
       (response: any) => {
        this.jsonStatistika = undefined
        this.statistikaCat = []
        this.statistikaNum = []
         this.json =  JSON.parse(response.data); 
         this.totalItems = response.totalItems;
         this.dajStatistiku();
         this.nizImenaTrenutnihKolona = Object.keys(this.json[0]);
     });
   }


  dajHeadere()
  {
    if(this.json == undefined)
      return;

    var headers = Object.keys(this.json[0]);
    for(let i=0; i<headers.length; i++)
    {
      this.kolone[i] = headers[i];
    }
    this.message = headers;
    this.shared.setMessage(this.message);
    //console.log(this.message);
    return headers;
  }

  dajRed(i: number)
  {
    var redValues = Object.values(this.json[i]);

    for(var i=0;i<redValues.length;i++)
    {
      if(redValues[i] == null)
      {
        redValues[i] = "NA";
      }
    }

    return redValues;
  }

  dajDeoKomande()
  {
    let str = "";
    if(this.selectedColumns.length == 1)
    {
      str = "(Column: ";
    }
    else if(this.selectedColumns.length > 1)
    {
      str = "(Columns: ";
    }

    let imena = [];
    for(let i = 0; i < this.selectedColumns.length; i++)
    {
      imena.push(this.nizImenaTrenutnihKolona[this.selectedColumns[i]]);
    }
    // console.log(imena);

    for(let i = 0; i < imena.length - 1; i++)
      str += imena[i] + ", ";
    
    str += imena[imena.length-1] + ")";

    return str;
  }

  oneHotEncoding()
  { 
    /*
    let dateTime = new Date();
    this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " OneHotEnconding");
    this.nizKomandiTooltip.push("" + dateTime.toString() + "");
*/
    if(this.selectedColumns.length < 1)
    {
     // this.dodajKomandu("OneHotEncoding nije izvršeno");
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/oneHotEncoding?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " OneHot Encoding is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.ucitajTipoveKolona();
        this.onSuccess('OneHot Encoding is performed.');
    },error=>{
      console.log(error.error);
      let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " OneHot Encoding is not performed. " + "(" + this.selectedSnapshot + ")");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");
      this.onError(error.error);
    })
  }

  labelEncoding()
  { 
    //this.dodajKomandu("LabelEncoding");
    if(this.selectedColumns.length < 1)
    {
     // this.dodajKomandu("OneHotEncoding nije izvršeno");
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/labelEncoding?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " LabelEncoding is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        //this.loadDefaultItemsPerPage();
        this.ucitajTipoveKolona(); 
        this.onSuccess('Label Encoding is performed.');
    },error=>{
      console.log(error.error);
      let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " LabelEncoding is not performed " + "(" + this.selectedSnapshot + ")");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");
      this.onError(error.error);
    })
  }


  EnableDisableGrafik(){

      if((this.nizNumerickihKolona.length <= 6) && (this.nizNumerickihKolona.length > 0) && (this.nizKategorickihKolona.length == 0))
      {
        (<HTMLButtonElement>document.getElementById("scatterplot")).disabled = false;
        (<HTMLButtonElement>document.getElementById("densityplot")).disabled = false;
      }
      else{
        (<HTMLButtonElement>document.getElementById("scatterplot")).disabled = true;
        (<HTMLButtonElement>document.getElementById("densityplot")).disabled = true;
      }

      if(((this.nizKategorickihKolona.length == 1 && this.nizNumerickihKolona.length == 1)) || ( this.nizNumerickihKolona.length == 1 && this.nizKategorickihKolona.length == 0) ){

        (<HTMLButtonElement>document.getElementById("boxplot")).disabled = false;
        (<HTMLButtonElement>document.getElementById("violinplot")).disabled = false;
        let pom = -1;
        if(this.selectedColumns.length == 2)
        {
          if(this.nizTipova[this.selectedColumns[0]] === "Categorical")
          {
              pom = this.selectedColumns[0];
              this.selectedColumns[0] = this.selectedColumns[1];
              this.selectedColumns[1] = pom;
          }
        }
        // console.log(this.selectedColumns);
      }
      else{
        (<HTMLButtonElement>document.getElementById("boxplot")).disabled = true;
        (<HTMLButtonElement>document.getElementById("violinplot")).disabled = true;
      }

      if(this.nizKategorickihKolona.length <= 2 && this.nizKategorickihKolona.length > 0 && this.nizNumerickihKolona.length == 0)
      {
        (<HTMLButtonElement>document.getElementById("barplot")).disabled = false;
      }
      else
      {
        (<HTMLButtonElement>document.getElementById("barplot")).disabled = true;
      }

      if((this.nizNumerickihKolona.length <= 4) && (this.nizNumerickihKolona.length > 0) && (this.nizKategorickihKolona.length == 0))
      {
        (<HTMLButtonElement>document.getElementById("histogram")).disabled = false;
      }
      else{
        (<HTMLButtonElement>document.getElementById("histogram")).disabled = true;
      }

      if((this.nizNumerickihKolona.length == 2) && (this.nizKategorickihKolona.length == 0))
      {
        (<HTMLButtonElement>document.getElementById("hexbin")).disabled = false;
      }
      else{
        (<HTMLButtonElement>document.getElementById("hexbin")).disabled = true;
      }
  }

  // selektovanje kolona
  getData(i: number, header:string)
  {
    if(this.selectedColumns.includes(i))
    { 
      const index = this.selectedColumns.indexOf(i, 0);
      if (index > -1) {
      this.selectedColumns.splice(index, 1);
      } 

      if(this.nizTipova[i] === "Categorical")
      {
        const index1 = this.nizKategorickihKolona.indexOf(i, 0);
        if (index1 > -1) {
        this.nizKategorickihKolona.splice(index1, 1);
        } 
        // console.log(this.nizKategorickihKolona);
      }
      else
      {
        const index2 = this.nizNumerickihKolona.indexOf(i, 0);
        if (index2 > -1) {
        this.nizNumerickihKolona.splice(index2, 1);
        } 
        // console.log(this.nizNumerickihKolona);
      }

      if(!this.niz2.includes(header)) // dodatak za regression
      {
        this.niz2[i] = header;
      }
      this.EnableDisableGrafik();
     return;
    }
    //this.dodajKomandu("Dodata kolona: "+ i);
    this.selectedColumns.push(i);
    
    if(this.nizTipova[i] === "Categorical")
    {
      this.nizKategorickihKolona.push(i); 
      // console.log(this.nizKategorickihKolona);
    }
    else
    {
      this.nizNumerickihKolona.push(i); 
      // console.log(this.nizNumerickihKolona);
    }
    this.EnableDisableGrafik();

    // console.log(this.selectedColumns);
    this.selectedName = header;

    // dodatak za regression
    if(this.niz2.includes(header))
    {
      this.niz2[i] = "0";
      // console.log(this.niz2);  
    }

  }

  isSelected(header:string)
  {
    return this.selectedName === header;
  }

  isSelectedNum(i:number)
  {
    let temp:boolean = false;
    this.selectedColumns.forEach((element)=>{
     if(element==i) 
        temp = true;
   });
   return temp;
  }

  dodajKomandu(str: string)
  {
      this.track = this.track + str + " > ";
      this.nizKomandi.push(str);
  }
  izbrisiSelektovaneKolone()
  {
    this.selectedColumns = [];
    this.nizKategorickihKolona = [];
    this.nizNumerickihKolona = [];
    this.EnableDisableGrafik();
    //this.dodajKomandu("Nema selektovanih kolona");
    //this.flag++;
  }
  obrisiIstoriju()
  {
    /*this.track = "> ";*/
    this.nizKomandi = [];
    this.nizKomandiTooltip = [];
  }
  /*
  ispisiSelektovaneKolone()
  {
    if(this.selectedColumns.length == 0)
      this.dodajKomandu("Nema selektovanih kolona");

    for(let i=0;i<this.selectedColumns.length;i++)
    {
      if(this.selectedColumns[i] != undefined)
        this.dodajKomandu("Kolona " + this.selectedColumns[i]);
    }
  }*/
  izborUnosa(str:string)
  {
    if(str === "Testni skup")
    {
      (<HTMLDivElement>document.getElementById("unos-fajla")).className = "visible-testniskup";  
      (<HTMLDivElement>document.getElementById("proizvoljan-unos")).className = "invisible-unos";
      (<HTMLDivElement>document.getElementById("testniskup-comp")).style.height = "80px";
      (<HTMLDivElement>document.getElementById("testniskup-comp")).style.transition = "0.3s";
      (<HTMLDivElement>document.getElementById("sliderHolder")).style.display = "none";
    }
    if(str === "Proizvoljno")
    {
      (<HTMLDivElement>document.getElementById("proizvoljan-unos")).className = "visible-unos";   
      (<HTMLDivElement>document.getElementById("unos-fajla")).className = "invisible-testniskup";
      (<HTMLDivElement>document.getElementById("testniskup-comp")).style.height = "185px";
      (<HTMLDivElement>document.getElementById("testniskup-comp")).style.transition = "0.3s";
      (<HTMLDivElement>document.getElementById("sliderHolder")).style.display = "flex";
      (<HTMLDivElement>document.getElementById("sliderHolder")).style.justifyContent = "center";
    }
  }

  // ispisRatio(){
  //   let vrednost = (<HTMLInputElement>document.getElementById("input-ratio")).value; 
  //   let val1:number = (parseFloat)((<HTMLInputElement>document.getElementById("input-ratio")).value);
  //   (<HTMLInputElement>document.getElementById("vrednost-ratio")).value = vrednost ;  
  //   let procenat:number = Math.round(val1 * 100);
  //   (<HTMLDivElement>document.getElementById("current-value")).innerHTML = "" + procenat + "%";
  //   if(val1 < 0.5)
  //   {
  //     (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100 - 10}%`;
  //   }
  //   else{
  //     (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100 - 18}%`;
  //   }
  // }

  ispisRatio(){
    // console.log(this.value);
    (<HTMLInputElement>document.getElementById("input-ratio")).value = this.value + "";
    let vrednost = (<HTMLInputElement>document.getElementById("input-ratio")).value;
    let vrednost2 = (100 - Number(vrednost)) + "";
    (<HTMLInputElement>document.getElementById("vrednost-ratio")).value = vrednost;
    (<HTMLSpanElement>document.getElementById("procenatTestni")).innerHTML = vrednost;
    (<HTMLSpanElement>document.getElementById("procenatTrening")).innerHTML = vrednost2;
  }

  upisRatio()
  {
    let vrednost = (<HTMLInputElement>document.getElementById("vrednost-ratio")).value;
    let vrednost2 = (100 - Number(vrednost)) + "";
    this.value = parseInt(vrednost);
    (<HTMLInputElement>document.getElementById("input-ratio")).value = this.value + "";
    (<HTMLSpanElement>document.getElementById("procenatTestni")).innerHTML = vrednost;
    (<HTMLSpanElement>document.getElementById("procenatTrening")).innerHTML = vrednost2;
    // let val1 = (parseFloat)((<HTMLInputElement>document.getElementById("vrednost-ratio")).value);
    // console.log((<HTMLInputElement>document.getElementById("input-ratio")).value);
    // let procenat:number = Math.round(val1 * 100);
    // (<HTMLDivElement>document.getElementById("current-value")).innerHTML = "" + procenat + "%";
    // if(val1 < 0.5)
    // {
    //   (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100-10}%`;
    // }
    // else{
    //   (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100-18}%`;
    // }
  }

  setRatio()
  {
    let ratio = (parseFloat)((<HTMLInputElement>document.getElementById("vrednost-ratio")).value); 
    ratio = ratio / 100.0;
    // console.log(ratio);
    // console.log(typeof(ratio));

    if(Number.isNaN(ratio))
    {
     // this.dodajKomandu("Nije unet ratio");
      // console.log("Uneta vrednost: "+ ratio);
      return;
    }
    this.http.post(url+"/api/Upload/setRatio/"+ratio + "?idEksperimenta=" + this.idEksperimenta,ratio,{responseType: 'text'}).subscribe(
      res => {
        ;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Test dataset ratio added: "+ ratio + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess('Ratio added.');
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Ratio nije dodat");
     this.onError(error.error);
    })

  }

  deleteColumns()
  {
    let str = "";
    if(this.selectedColumns.length == 0)
    {
      //this.onInfo("Kolone nisu selektovane");
      return;
    }
    else if(this.selectedColumns.length == 1)
      str = "Column ";
    else if(this.selectedColumns.length > 1)
      str = "Columns ";

    let imena = [];
    for(let i = 0; i < this.selectedColumns.length; i++)
    {
      imena.push(this.nizImenaTrenutnihKolona[this.selectedColumns[i]]);
    }

    for(let i = 0; i < imena.length - 1; i++)
      str += imena[i] + ", ";
    
    str += imena[imena.length-1] + " deleted";
    
    this.http.post(url+"/api/DataManipulation/deleteColumns?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
       // this.dodajKomandu("Uspesno obrisane kolone");
        this.onSuccess('Columns are deleted.');
    },error=>{
      console.log(error.error);
    //  this.dodajKomandu("Kolone nisu obrisane");
    this.onError(error.error);
    })
  }

  fillWithMean()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/fillWithMean?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Mean values added " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess('Mean values added.');
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Vrednosti nisu dodate");
    })
  }
  fillWithMedian()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/fillWithMedian?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Median values added " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess('Median values added.');
    },error=>{
      console.log(error.error);
    //  this.dodajKomandu("Vrednosti nisu dodate");
       this.onError(error.error);
    })
  }
  fillWithMode()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/fillWithMode?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Mode values added " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess('Mode values added.');
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Vrednosti nisu dodate");
     this.onError(error.error);
    })
  }

  replaceEmptyWithNA()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/replaceEmpty?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Categorical values are changed " + str + " "+ "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess('Categorical values are changed.');
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Vrednosti nisu zamenjene");
      this.onError(error.error);
    })
  }

  replaceZeroWithNA(){

    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/replaceZero?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Numerical values are changed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess('Numerical values are changed.');
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Vrednosti nisu zamenjene");
      this.onError(error.error);
    })
  }

  selectAllColumns(event:any)
  {
    if(this.json == undefined)
      return;
    var headers = Object.keys(this.json[0]);

    if((<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML === "Select All Columns")
    { 
      for(var i = 0;i<headers.length;i++)
      {
        this.selectedColumns.push(i);
        if(this.nizTipova[i] === "Categorical")
          this.nizKategorickihKolona.push(i);
        else
          this.nizNumerickihKolona.push(i);
        this.isSelectedNum(i);
      }
      this.EnableDisableGrafik();
    //  console.log(this.selectedColumns);
     (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Deselect Columns";
    }
    else{

        this.izbrisiSelektovaneKolone();
        (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Select All Columns";
    }
  }

  selectAllRows(event:any)
  {
    if((<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML === "Select All Rows")
    {
      for(var i = 0;i<this.itemsPerPage;i++)
      {
        this.rowsAndPages.push([i,this.page]);
        this.isSelectedRow(i);
      }
      // console.log(this.rowsAndPages);
      (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Deselect Rows";
    }
    else{

      this.izbrisiSelektovaneRedove();
      (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Select All Rows";
  }
  }


  getRow(i:number,p:number)
  {
    for(let j = 0;j<this.rowsAndPages.length;j++)
    {
      if(this.rowsAndPages[j][0] == i && this.rowsAndPages[j][1] == p)
      {
        this.rowsAndPages.splice(j,1);
        return;
      }
    }
    //this.dodajKomandu("Izabran red "+ i + " sa strane "+ p);
    this.rowsAndPages.push([i,p]);
    //console.log(this.rowsAndPages);
  }

  isSelectedRow(i:number){
    let temp:boolean = false;
    this.rowsAndPages.forEach((el)=>{
     
      if(el[0] == i && el[1] == this.page)
        temp = true;
    });
    return temp;
  }
/*
  getSelectedRows()
  {
    if(this.rowsAndPages.length == 0)
      this.dodajKomandu("Nema selektovanih redova");
    else
    {
      for(let i=0;i<this.rowsAndPages.length;i++)
      this.dodajKomandu("Red: " + this.rowsAndPages[i][0] + " Strana: " + this.rowsAndPages[i][1]);
    }
  }
*/
  izbrisiSelektovaneRedove()
  {
    this.rowsAndPages = [];
    //this.flag++;
    //this.dodajKomandu("Redovi deselektovani");
  }

  deleteRows()
  {
    let str = "";
    if(this.rowsAndPages.length == 0)
    {
      //this.onInfo("Nema selektovanih redova."); 
      return; 
    }
    else if(this.rowsAndPages.length == 1)
      str = " Row deleted";
    else if(this.rowsAndPages.length > 1)
      str = " Rows deleted";
    
    let pages = [];
    let uniquePages = [];

    for(let i = 0; i < this.rowsAndPages.length; i++)
    {
      pages.push(this.rowsAndPages[i][1]);
    }

    uniquePages.push(pages[0]);
    let pom = 0;

    for(let i = 1; i < pages.length; i++)
    {
      pom = 0;
      for(let j = 0; j < uniquePages.length; j++)
      {
        if(uniquePages[j] == pages[i])
          pom = 1;
      }
      if(pom == 0)
      {
        uniquePages.push(pages[i]);
      }
    }
    // console.log(pages);
    // console.log(uniquePages);
    
    pom = 0;
    for(var i = 0; i < uniquePages.length - 1; i++) 
    {
      for(var j = i; j < uniquePages.length; j++) 
      {
        if(uniquePages[j] < uniquePages[i]) 
        {
          pom = uniquePages[j];
          uniquePages[j] = uniquePages[i];
          uniquePages[i] = pom;
        }
      }
    }
    // console.log(uniquePages);

    if(uniquePages.length == 1)
      str += " (On page: ";
    else if(uniquePages.length > 1)
      str += " (On pages: ";

    for(let i = 0; i < uniquePages.length - 1; i++)
      str += uniquePages[i] + ", ";
    
    str += uniquePages[uniquePages.length - 1] + ")";

    let redoviZaBrisanje:number[] = [];

    for(let j = 0;j<this.rowsAndPages.length;j++)
    {
      let temp = (this.rowsAndPages[j][1] - 1) * this.itemsPerPage + this.rowsAndPages[j][0]; 
      redoviZaBrisanje.push(temp); 
    }
    let redovi = redoviZaBrisanje.sort((n1,n2) => n1 - n2);

    this.http.post(url+"/api/DataManipulation/deleteRows?idEksperimenta=" + this.idEksperimenta,redovi,{responseType: 'text'}).subscribe(
      res => {
        if(res == "Redovi za brisanje nisu izabrani")
        {
          this.onInfo("No rows selected.");
        }
        else if(res == "Korisnik nije pronadjen" || res == "Token nije setovan")
        {
          this.rowsAndPages = []; // deselekcija redova 
          let dateTime = new Date();
         // this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " " + res);
         // this.nizKomandiTooltip.push("" + dateTime.toString() + "");
          this.onInfo("");
        }
        else 
        {
          this.totalItems = (parseInt)(res);
          //this.loadDefaultItemsPerPage();
          this.gtyLoadPageWithStatistics(this.page);
          this.brojacAkcija++;
          this.rowsAndPages = []; // deselekcija redova 
         // this.dodajKomandu("Redovi obrisani");
          let dateTime = new Date();
          this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  str + " " + "(" + this.selectedSnapshot + ")");
          this.nizKomandiTooltip.push("" + dateTime.toString() + "");
          this.flag++;
          this.onSuccess("Rows are deleted.");
        }
    },error=>{
     // this.dodajKomandu("Brisanje redova nije izvršeno");
     this.onError(error.error);
    })
  }
  ucitajNaziv()
  {
    this.http.get(url+'/api/Eksperiment/Eksperiment/Naziv/' + this.idEksperimenta, {responseType: 'text'}).subscribe(
        res=>{
          ;
          this.nazivEksperimenta = res;
          var div = (<HTMLInputElement>document.getElementById("naziveksperimenta")).value = this.nazivEksperimenta;
          // console.log(this.nazivEksperimenta);
        },error=>{
          console.log(error.error);
        }
    );
  }

  
  proveriE(){
    var nazivE = (<HTMLInputElement>document.getElementById("naziveksperimenta")).value;

    this.http.put(url+"/api/Eksperiment/Eksperiment?ime=" + nazivE + "&id=" + this.idEksperimenta,null, {responseType : "text"}).subscribe(
      res=>{
        ;
        this.onSuccess("Experiment name changed successfully!");
      }, error=>{
        this.ucitajNaziv();
        if(error.error === "Postoji eksperiment sa tim imenom")
        {
          //alert("Postoji eksperiment sa tim imenom.");
          this.onInfo("Experiment with that name already exists.");
        }
        
      }
    )
}
  submit(){
    var nazivEks = (<HTMLInputElement>document.getElementById("naziveksperimenta")).value;

    if(!(nazivEks === this.nazivEksperimenta))
    {
      this.proveriE();
    }

    this.http.post(url + "/api/Upload/sacuvajIzmene?idEksperimenta=" + this.idEksperimenta,null, {responseType: 'text'}).subscribe(
    res => {
      ;
      this.onSuccess("All changes have been saved.");
      let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " All changes have been saved " + + "(" + this.selectedSnapshot + ")");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");
    },error=>{
      console.log(error.error);
     /* let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Izmene nisu sacuvane");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");*/
      this.onError(error.error);
    })
    
  }

  izmeniPolje(row:number,column:number,page:any,data:any)
  {
    let rowPom = row + 1;

    row = page * this.itemsPerPage - this.itemsPerPage + row;
/*
    if(data == undefined)
    {
      data.value = "";
    }*/
    // console.log(typeof(data.value));
    this.http.put(url+"/api/DataManipulation/updateValue/" + row + "/" + column + "/" + data.value + "?idEksperimenta=" + this.idEksperimenta,null, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        this.rowsAndPages = [];
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Row value changed: " + data.value + " (Row: " + rowPom + ", Column: " + this.nizImenaTrenutnihKolona[column] + ", Page: " + page + ")" + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Row value changed: "+ data.value);
    },error=>{
      console.log(error.error);
      this.rowsAndPages = [];
      //this.dodajKomandu("Polje nije izmenjeno");
      this.onError(error.error);
    })
  }

  absoluteMaxScaling()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/absoluteMaxScaling?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Absolute Maximum Scaling is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Absolute Max Scaling is performed.");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Absolute Maximum Scaling nije izvrseno");
      this.onError(error.error);
    })
  }

  minMaxScaling()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/minMaxScaling?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Min-max Scaling is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Min-Max Scaling is performed.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Min-Max Scaling nije izvrseno");
     this.onError(error.error);
    })
  }

  zScoreScaling()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/zScoreScaling?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Z-score Scaling is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Z-score Scaling is performed.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Z-score Scaling nije izvrseno");
     this.onError(error.error);
    })
  }

  selectNorm(event:any)
  {
    this.selectedNorm = event.target.id; 

    if(this.selectedNorm == "absolute-max")
    {
      (<HTMLButtonElement>document.getElementById("norm-btn")).innerHTML = "Absolute Maximum Scaling";
    }
    if(this.selectedNorm == "minmax")
    {
      (<HTMLButtonElement>document.getElementById("norm-btn")).innerHTML = "Min-Max Scaling";
    }
    if(this.selectedNorm == "zscore")
    {
      (<HTMLButtonElement>document.getElementById("norm-btn")).innerHTML = "Z-score Scaling";
    }
  }

  primeniNormalizaciju()
  {
    if(this.selectedNorm == "")
    {
      this.onInfo("Option from menu is not selected.");
    }
    if(this.selectedNorm == "absolute-max" )
    {
      this.absoluteMaxScaling();
    }
    if(this.selectedNorm == "minmax" )
    {
      this.minMaxScaling();
    }
    if(this.selectedNorm == "zscore" )
    {
      this.zScoreScaling();
    }
    this.selectedNorm = ""; 
    (<HTMLButtonElement>document.getElementById("norm-btn")).innerHTML = "Scaling method"; 
  }
   // OUTLIERS 

   removeStandardDeviation()
   {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

     this.http.post(url+"/api/DataManipulation/standardDeviation/" + this.threshold + "?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
       res => {
         ;
         //this.loadDefaultItemsPerPage();
         this.gtyLoadPageWithStatistics(this.page);
         this.brojacAkcija++;
         this.selectedColumns = [];
         this.nizKategorickihKolona = [];
         this.nizNumerickihKolona = [];
         this.EnableDisableGrafik();
         let dateTime = new Date();
         this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Standard Deviation is performed " + str + " " + "(" + this.selectedSnapshot + ")");
         this.nizKomandiTooltip.push("" + dateTime.toString() + "");
         this.flag++;
         this.onSuccess("Standard Deviation is performed.");
     },error=>{
       console.log(error.error);
       //this.dodajKomandu("Standard Deviation nije izvrseno");
       this.onError(error.error);
     })
   }
   removeOutliersQuantiles()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/outliersQuantiles/" + this.threshold + "?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Quantiles is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Quantiles is performed.");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Quantiles nije izvrseno");
      this.onError(error.error);
    })
  }

  removeOutliersZScore()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/outliersZScore/" + this.threshold + "?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Z-Sore is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Z-Sore is performed.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("ZScore nije izvrseno");
     this.onError(error.error);
    })
  }
  
  removeOutliersIQR()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/outliersIQR?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " IQR is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("IQR is performed.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("IQR nije izvrseno");
     this.onError(error.error);
    })
  }

  removeOutliersIsolationForest()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/outliersIsolationForest?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Isolation Forest is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Isolation Forest is performed.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Isolaton Forest nije izvrseno");
     this.onError(error.error);
    })
  }

  removeOutliersOneClassSVM()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/outliersOneClassSVM?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " One Class SVM is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("One Class SVM is performed.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("One Class SVM nije izvrseno");
     this.onError(error.error);
    })
  }

  removeOutliersByLocalFactor()
  {
    if(this.selectedColumns.length < 1)
    {
      this.onInfo("No columns selected.");
      return;
    }
    
    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/outliersByLocalFactor?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Local factor is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Local factor is performed.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Local Factor nije izvrseno");
     this.onError(error.error);
    })
  }
  selectOutliers(event:any)
  {
    this.selectedOutlier = event.target.id;
    
    if(this.selectedOutlier == "option-sd")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Standard Deviation";
      (<HTMLInputElement>document.getElementById("threshold")).removeAttribute("readonly");
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(158, 158, 255)";
      (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "0 0 15px rgba(108, 79, 157, 0.893)";
      (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "auto";
      (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "auto";
    }
    if(this.selectedOutlier == "option-quantiles")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Quantiles";
      (<HTMLInputElement>document.getElementById("threshold")).removeAttribute("readOnly");
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(158, 158, 255)";
      (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "0 0 15px rgba(108, 79, 157, 0.893)";
      (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "auto";
      (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "auto";
    }
    if(this.selectedOutlier == "option-zscore")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Z-Score"; 
      (<HTMLInputElement>document.getElementById("threshold")).removeAttribute("readOnly");
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(158, 158, 255)";
      (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "0 0 15px rgba(108, 79, 157, 0.893)";
      (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "auto";
      (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "auto";
    }
    if(this.selectedOutlier == "option-iqr")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "IQR";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
      (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "none";
      (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "default";
      (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "none";
    }
    if(this.selectedOutlier == "option-isolation")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Isolation Forest";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
      (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "none";
      (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "default";
      (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "none";
    }
    if(this.selectedOutlier == "option-svm")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "One Class SVM";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
      (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "none";
      (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "default";
      (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "none";
    }
    if(this.selectedOutlier == "option-lfactor")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Local Factor";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
      (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "none";
      (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "default";
      (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "none";
    }
    
  }
  removeOutliers()
  {
    if(this.selectedOutlier == "")
    {
      this.onInfo("Option from menu is not selected.");
    }
    if(this.selectedOutlier == "option-sd")
    {
      this.threshold = (Number)((<HTMLInputElement>document.getElementById("threshold")).value);
      // console.log(typeof(this.threshold));
      this.removeStandardDeviation();
    }
    if(this.selectedOutlier == "option-quantiles")
    {
      this.threshold = (Number)((<HTMLInputElement>document.getElementById("threshold")).value);
      this.removeOutliersQuantiles();
    }
    if(this.selectedOutlier == "option-zscore")
    {
      this.threshold = (Number)((<HTMLInputElement>document.getElementById("threshold")).value);
      this.removeOutliersZScore();
    }
    if(this.selectedOutlier == "option-iqr")
    {
      this.removeOutliersIQR();
    }
    if(this.selectedOutlier == "option-isolation")
    {
      this.removeOutliersIsolationForest()
    }
    if(this.selectedOutlier == "option-svm")
    {
      this.removeOutliersOneClassSVM();
    }
    if(this.selectedOutlier == "option-lfactor")
    {
      this.removeOutliersByLocalFactor();
    }
    this.selectedOutlier = "";
    (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Detection method";
    (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
    (<HTMLInputElement>document.getElementById("threshold")).value = "";
    (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
    (<HTMLInputElement>document.getElementById("threshold")).style.boxShadow = "none";
    (<HTMLInputElement>document.getElementById("threshold")).style.cursor = "default";
    (<HTMLInputElement>document.getElementById("threshold")).style.pointerEvents = "none";
  }

  deleteAllRowsWithNA()
  {
    this.http.post(url+"/api/DataManipulation/deleteAllRowsNA?idEksperimenta=" + this.idEksperimenta,null,{responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " NA rows are removed successfully " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("NA rows are removed successfully.");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("NA redovi nisu obrisani");
     this.onError(error.error);
    });
  }

  deleteAllColumnsWithNA()
  {
    this.http.post(url+"/api/DataManipulation/deleteAllColumnsNA?idEksperimenta=" + this.idEksperimenta,null,{responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " All columns with NA values are removed successfully " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("All columns with NA values are removed successfully.");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Kolone nisu obrisane");
      this.onError(error.error);
    });
  }

  deleteRowsWithNAforSelectedColumns()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("No columns selected.");
      return;
    }

    let str = this.dajDeoKomande();

    this.http.post(url+"/api/DataManipulation/deleteNARowsForColumns?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " All rows with NA values for selected columns were removed successfully " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("All rows with NA values are removed successfully.");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Redovi nisu obrisani");
      this.onError(error.error);
    });
  }

  selectData(event:any)
  {
    this.selectedData = event.target.id;

    if(this.selectedData == "izbaci-selekt-vrste")
    {
      (<HTMLButtonElement>document.getElementById("select-data")).innerHTML = "Rows";
    }
    if(this.selectedData == "izbaci-selekt-kolone")
    {
      (<HTMLButtonElement>document.getElementById("select-data")).innerHTML = "Columns";
    }
  }
  primeniNaPodatke()
  {
    if(this.selectedData == "")
    {
      this.onInfo("Option from menu is not selected.");
    }
    if(this.selectedData == "izbaci-selekt-vrste")
    {
      this.deleteRows();
    }
    if(this.selectedData == "izbaci-selekt-kolone")
    {
      this.deleteColumns(); 
    }
    (<HTMLButtonElement>document.getElementById("select-data")).innerHTML = "Upravljanje podacima";
    this.selectedData = ""; 
  }

  selectForRegression(event:any,i:number)
  {
    var kolona = event.target.text;
    this.selectedForRegression = i;

    (<HTMLInputElement>document.getElementById("regresija-input")).value = kolona; 
  }

  primeniZaRegression()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("No columns selected.");
      return;
    }
    if(this.selectedForRegression == -1)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("No columns selected from menu.");
      return;
    }

    let str = "";
    if(this.selectedColumns.length == 1)
    {
      str = "(Column: ";
    }
    else if(this.selectedColumns.length > 1)
    {
      str = "(Columns: ";
    }

    let imena = [];
    for(let i = 0; i < this.selectedColumns.length; i++)
    {
      imena.push(this.nizImenaTrenutnihKolona[this.selectedColumns[i]]);
    }

    for(let i = 0; i < imena.length - 1; i++)
      str += imena[i] + ", ";
    
    str += imena[imena.length-1] + "; ";

    let kolonaRegresija = (<HTMLInputElement>document.getElementById("regresija-input")).value;
    str += "Selected for regression: " + kolonaRegresija + ")";

    this.http.post(url+"/api/DataManipulation/linearRegression/" + this.selectedForRegression + "?idEksperimenta=" + this.idEksperimenta, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        ;
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedForRegression = -1;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Regression is performed " + str + " " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("Regression is performed.");
        (<HTMLInputElement>document.getElementById("regresija-input")).value = ""; 
    },error=>{
      console.log(error.error);
      this.selectedForRegression = -1;
     // this.dodajKomandu("Zamena vrednosti NA sa vrednostima dobijenih regresijom izvrseno");
     this.onError(error.error);
      (<HTMLInputElement>document.getElementById("regresija-input")).value = ""; 
    });
  }

  tabelaStatistika()
  { 
    var broj = Object.keys(this.statistikaNum[0].data).length;
    var kljucevi = Object.keys(this.statistikaNum[0].data);
    var brojJ= this.statistikaNum.length;
    
    this.nizRedovaStatistika = [];
    for(var i = 0; i<broj;i++)
    {
      var nizHead:string[] = [];
      nizHead.push(kljucevi[i]);
      for(var j = 0; j<brojJ;j++)
      {
        
        nizHead.push(this.statistikaNum[j].data[kljucevi[i]]);
      }
      this.nizRedovaStatistika.push(nizHead);
    }
    //console.log(this.nizRedovaStatistika);
  }
  tabelaStatistikaCat()
  {
    // var broj = Object.keys(this.statistikaCat[0].data).length;
    // var kljucevi = Object.keys(this.statistikaCat[0].data);
    // var brojJ= this.statistikaCat.length;
    // var traziMax:number[] = [];

    // //console.log(this.statistikaCat[0].data[broj-1]['Frequencies']);
    // for(var i = 0;i<brojJ;i++)
    // {
    //   traziMax.push((this.statistikaCat[0].data[broj-1]['Frequencies']).length);
    // }
    // broj += Math.max(...traziMax);

    // for(var i = 0; i<broj;i++)
    // {
    //   var nizHead:string[] = [];
    //   nizHead.push(kljucevi[i]);
    //   for(var j = 0; j<brojJ;j++)
    //   {
        
    //     nizHead.push(this.statistikaNum[j].data[kljucevi[i]]);
    //   }
    //   this.nizRedovaStatistika.push(nizHead);
    // }
    //console.log(this.nizRedovaStatistika);
  }

  prikaziUcitanePodatke(event:any)
  {
    this.indikator = true;
    var element = (<HTMLSpanElement>document.getElementById(event.target.id));
    var disableElement = (<HTMLSpanElement>document.getElementById("statPodaci-naslov"));
    //(<HTMLDivElement>document.getElementById("pagingControls")).style.visibility = "";


    element.style.backgroundColor = "#5e609150"; 
    element.style.borderTopLeftRadius = "2px"; 
    element.style.borderTopLeftRadius = "2px"; 
    element.style.borderBottom = "1px solid rgb(160, 181, 189)";
    disableElement.style.backgroundColor = "";
    disableElement.style.border = "";
    
  }

  prikaziStatistickePodatke(event:any)
  {
    this.indikator = false; 
    var element = (<HTMLSpanElement>document.getElementById(event.target.id));
    var disableElement = (<HTMLSpanElement>document.getElementById("ucitaniPodaci-naslov"));
    //(<HTMLDivElement>document.getElementById("pagingControls")).style.visibility = "hidden";

    element.style.backgroundColor = "#5e609150"; 
    element.style.borderTopLeftRadius = "2px"; 
    element.style.borderTopLeftRadius = "2px"; 
    element.style.borderBottom = "1px solid rgb(160, 181, 189)";
    disableElement.style.backgroundColor = "";
    disableElement.style.border = "";

    this.pieChartFunction();
  }

  dajNaziveKolonaStatistikeNum()
  {
    var kljucevi:string[] = [" "];

    for(let pom of this.statistikaNum)
    {
      kljucevi.push(pom.key);
    }
    return kljucevi;

  }

  preuzmiDataset()
  {
    var id = sessionStorage.getItem("idS");
    var snapshotName = sessionStorage.getItem("idSnapshota");

    if(snapshotName == null) {
      this.onError("Dataset not found");
      return;
    }
    if(id == null) {
      this.onError("Dataset not found");
      return;
    }
    
    var name = this.fileName;
    if(id != "0") {
      const splits = this.fileName.split('.');
      name = snapshotName + "." + splits[splits.length - 1];
    }

    this.http.post(url+"/api/File/download/" + this.idEksperimenta, null, {responseType: 'text',params:{"versionName":name}}).subscribe(
      res => {

        if(id == "0" || snapshotName == null)
          name = "default";
        else
          name = snapshotName;
           
        saveAs(new Blob([res]), name + "_" + this.fileName);

        this.onSuccess("Dataset are downloaded successfully.");
    },error=>{
      console.error(error.error);
      this.onError(error.error);
    });
  }
 
  promena(event:any){

    if(this.selektovanGrafik != ""){
      (<HTMLButtonElement>document.getElementById(this.selektovanGrafik)).style.color="white";
      (<HTMLButtonElement>document.getElementById(this.selektovanGrafik)).style.background="#6070a7";
      this.selektovanGrafik = event.target.id;
      (<HTMLButtonElement>document.getElementById(event.target.id)).style.color="#272741";
      (<HTMLButtonElement>document.getElementById(event.target.id)).style.background="white";
    }
    else{
      this.selektovanGrafik = event.target.id;
      (<HTMLButtonElement>document.getElementById(event.target.id)).style.color="#272741";
      (<HTMLButtonElement>document.getElementById(event.target.id)).style.background="white";
    }
  
  }

  getScatterplot(){

    this.http.post(url+"/api/Graph/scatterplot?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getBoxplot(){

    this.http.post(url+"/api/Graph/boxplot?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getViolinplot(){

    this.http.post(url+"/api/Graph/violinplot?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getBarplot(){

    this.http.post(url+"/api/Graph/barplot?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getHistogram(){

    this.http.post(url+"/api/Graph/histogram?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getHexbin(){

    this.http.post(url+"/api/Graph/hexbin?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getDensityplot(){

    this.http.post(url+"/api/Graph/densityplot?idEksperimenta=" + this.idEksperimenta,this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        ;
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  preuzmiSliku(){

    this.http.get(url+"/api/File/GetImage?idEksperimenta=" + this.idEksperimenta,{responseType:"blob"}).subscribe(
      (res : any)=> {
        var blob = new Blob([res], {
            type: 'image/png'
        });
        // console.log(blob);
        this.convertToBase64(blob);
    },
    error=>{
      
    }
    );
  }

  convertToBase64(file: Blob){

    const observable = new Observable((subscriber : Subscriber<any>) => {

      this.readFile(file, subscriber);
    });
    observable.subscribe((d)=>{
     // console.log(d);
     this.scatterplotImage = d;
    })
  }

  readFile(file: Blob, subscriber:Subscriber<any>){

    const filereader = new FileReader();

    filereader.readAsDataURL(file);

    filereader.onload=()=>{

      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror=(error)=>{

      subscriber.error(error);
      subscriber.complete();
    };
  }

  ucitajGrafik(event : any){

    //this.ngOnInit();
    if(event.target.id === "scatterplot")
    {
      this.getScatterplot();
    }
    else if(event.target.id === "boxplot")
    {
      this.getBoxplot();
    }
    else if(event.target.id === "violinplot")
    {
      this.getViolinplot();
    }
    else if(event.target.id === "barplot")
    {
      this.getBarplot();
    }
    else if(event.target.id === "histogram")
    {
      this.getHistogram();
    }
    else if(event.target.id === "hexbin")
    {
      this.getHexbin();
    }
    else{
      this.getDensityplot();
    }
  }

  tryUndoAction(){

    // console.log("Broj akcija:" + this.brojacAkcija);
    if(this.brojacUndoRedo < 5 && this.brojacAkcija > 0)
    {
      this.undo();
      this.brojacUndoRedo++;
      this.brojacAkcija--;
    }
    else{
      console.log("Ne moze unazad");
      this.onInfo("Cannot undo");
    }
  }

  undo(){

    this.http.post(url+"/api/Eksperiment/Undo?idEksperimenta=" + this.idEksperimenta,null,{responseType:"text"}).subscribe(
      res => {
        ;
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.obrisiKomandu();
        this.ucitajTipoveKolona();
        this.flag--;
        //this.dodajTipovePoredKolona(this.nizTipova);
      },
      error =>{
        console.log(error.error);
      }
      );
  }

  tryRedoAction(){

    if(this.brojacUndoRedo > 0)
    {
      this.redo();
      this.brojacUndoRedo--;
      this.brojacAkcija++;
    }
    else{
      console.log("Ne moze unapred");
    }
  }

  redo(){

    this.http.post(url+"/api/Eksperiment/Redo?idEksperimenta=" + this.idEksperimenta,null,{responseType:"text"}).subscribe(
      res => {
        ;
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.vratiKomandu();
        this.ucitajTipoveKolona(); 
        this.flag++;
      },
      error =>{
        console.log(error.error);
        this.onInfo("Cannot redo");
      }
      );
  }

  obrisiKomandu(){

    this.nizKomandiUndoRedo.push(this.nizKomandi[this.nizKomandi.length - 1]);
    this.nizKomandiUndoRedoTooltip.push(this.nizKomandi[this.nizKomandiTooltip.length - 1]);
    this.nizKomandi.pop();
    this.nizKomandiTooltip.pop();
  }

  vratiKomandu(){

    this.nizKomandi.push(this.nizKomandiUndoRedo[this.nizKomandiUndoRedo.length - 1]);
    this.nizKomandiTooltip.push(this.nizKomandiUndoRedoTooltip[this.nizKomandiUndoRedoTooltip.length - 1]);
    this.nizKomandiUndoRedo.pop();
    this.nizKomandiUndoRedoTooltip.pop();
  }


  sacuvajTrenutnuVerziju(){
    var id = (<HTMLButtonElement>document.getElementById("verzijaSnapshotaSelect")).value;
    if(id!="0"){
      this.http.post(url+"/api/File/SaveSnapshot?idEksperimenta="+this.idEksperimenta+"&idSnapshota="+id,null,{responseType:"text"}).subscribe(
        res=>{
          ;
        }
      );
    }
  }
  
sacuvajKaoNovu(ime:string){
  var naziv=ime.trim();
  if(naziv!=""){
    this.http.post(url+"/api/File/SaveAsSnapshot?idEksperimenta="+this.idEksperimenta+"&naziv="+naziv,null,{responseType:"text"}).subscribe(
      res=>{
        ;
        if(res!="-1"){
          // console.log("Sacuvan snapshot.");
          this.onSuccess("New data version is saved successfully.");
          // this.ucitajSnapshotove();
          this.PosaljiPoruku.emit();

          (<HTMLButtonElement>document.getElementById("dropdownMenuButton1")).innerHTML =  ime;
          sessionStorage.setItem('idSnapshota',ime);
          sessionStorage.setItem('idS',"" + res);
          this.ucitajPodatkeSnapshota(Number(res),ime);
        }
      });
    }
  }
  
  daLiPostoji(){
    var naziv1 = (<HTMLInputElement>document.getElementById("imeVerzije")).value;
    var naziv = naziv1.trim();
    if(naziv!=""){
      this.http.get(url+"/api/File/ProveriSnapshot?idEksperimenta="+this.idEksperimenta+"&naziv="+naziv,{responseType:"text"}).subscribe(
        res=>{
          if(res!="-1"){
            // vec postoji u bazi - override or discard  
            this.open(this.content);
            // console.log("Postoji");          
            // override ... 
            this.idSnapshotaOverride = res;
            this.nazivSnapshotaOverride = naziv;
            if(this.flag >= 0)
            {
              this.flag = 0;
            }
          }
          else{
            // ne postoji u bazi -> cuvaj kao novu
            if(this.flag >= 0)
            {
              this.flag = 0;
            } 
            this.sacuvajKaoNovu(naziv);
            this.izadjiIzObaModala();          
          }
        }
      );
    }
    else{
      (<HTMLDivElement>document.getElementById("nijeUnetoImeVerzije")).style.visibility = "visible";
    }
  }
  izbrisiSnapshot(){
    var id = sessionStorage.getItem("idS");
    //console.log("------------------------ID SNAPSHOTA: " + id);
    //var id = (<HTMLButtonElement>document.getElementById("verzijaSnapshotaSelect")).value;    
    if(id!="0"){

      if(this.flag >= 0)
          this.flag = 0;
      this.brojacAkcija = 0;

      this.http.delete(url+"/api/File/Snapshot?id="+id, {responseType:"text"}).subscribe(
        res=>{
          //console.log(res);
          // this.ucitajSnapshotove();
          this.PosaljiPoruku.emit();

          sessionStorage.setItem('idSnapshota',"Default snapshot");
          sessionStorage.setItem('idS',"0");
          (<HTMLButtonElement>document.getElementById("dropdownMenuButton1")).innerHTML = "Default snapshot";
          this.ucitajPodatkeSnapshota(0,'Default snapshot');
        },
        error=>{
          // this.ucitajSnapshotove();
          //console.log(error.error);
          this.PosaljiPoruku.emit();
        }
      )
    }
  }
  potvrdaZaBrisanjeVerzije()
  {
    var id = sessionStorage.getItem("idS");

    if(id != "0")
    {
      this.open(this.modalBrisanjeVerzije);
    }
    else
    {
      this.onInfo("It is not possible to delete default dataset version.");
    }
  }
  // 2. fun za brisanje
  izbrisiSnapshott(id:any){
      this.http.delete(url+"/api/File/Snapshot?id"+id).subscribe(
        res=>{
          ;
          const index = this.snapshots.indexOf(this.nazivSnapshotaOverride, 0);
          if (index > -1) {
            this.snapshots.splice(index, 1);
          }
        }
      );
    
  }

  overrideSnapshot()
  {
    //this.izbrisiSnapshott(this.idSnapshotaOverride);
    //this.sacuvajKaoNovu(this.nazivSnapshotaOverride);
    this.http.post(url+"/api/File/SaveSnapshot?idEksperimenta="+this.idEksperimenta+"&idSnapshota="+this.idSnapshotaOverride,null,{responseType:"text"}).subscribe(
      res=>{
        // this.ucitajSnapshotove();
        this.onSuccess("Snapshot was successfully overridden.");
        this.PosaljiPoruku.emit();
        this.ucitajPodatkeSnapshota(Number(this.idSnapshotaOverride));
        this.PosaljiSnapshot.emit(Number(this.idSnapshotaOverride));
        (<HTMLSelectElement>document.getElementById("verzijaSnapshotaSelect")).value= this.idSnapshotaOverride;//Nekako da se override selektovan snapsho
      },
      error=>{
        this.onError("Snapshot was not overridden.");
      }
    );

    //this.idSnapshotaOverride = "";
    //this.nazivSnapshotaOverride = "";
  }

  vratiTekstiNaziv()
  {
    (<HTMLDivElement>document.getElementById("nijeUnetoImeVerzije")).style.visibility = "hidden";
    this.nazivSnapshot = "";
  }

  vratiTekst()
  {
    (<HTMLDivElement>document.getElementById("nijeUnetoImeVerzije")).style.visibility = "hidden";
  }


  open(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  izadjiIzObaModala()
  {
    let el: HTMLElement = this.btnexit.nativeElement;
    el.click();
  }

  brisanjeVrednosti()
  {
    var redoviString = " row";
    var koloneString = " column";
    var text = "Are you sure you want to delete ";

    if(this.selectedColumns.length == 0 && this.rowsAndPages.length == 0)
    {
      text = " ";
      
      this.onInfo("You have not selected any fields.");
    }
    else
    {
      if(this.selectedColumns.length > 0)
      {
        if(this.selectedColumns.length > 1)
        {
          koloneString += "s";
        }
        text += this.selectedColumns.length + koloneString;      
      }
      if(this.rowsAndPages.length > 0)
      {
          if(this.rowsAndPages.length > 1)
          {
            redoviString += "s";
          }
          if(this.selectedColumns.length > 0)
          {
            text += " and ";
          }
          text += this.rowsAndPages.length + redoviString;
      }
      text += "?"; 

      
      this.openModalDelete(this.modalDelete);
      (<HTMLDivElement>document.getElementById("textDelete")).innerHTML = text;
    }

  }

  openModalDeleteClose(modalDeleteClose: any) {
    this.modalService.open(modalDeleteClose, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openModalDelete(modalDelete: any) {
    this.modalService.open(modalDelete, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  brisanje()
  {
    this.deleteColumns();
    this.deleteRows();
  }

  openModalNew(modalNew: any) {
    this.modalService.open(modalNew, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  // ispis kategorija za AddRow 
  getHeadAndType()
  {
    var headers = this.dajHeadere();

    if(headers == null)
      return;
    
    for(var i = 0;i<headers.length;i++)
    {
      headers[i] = this.nizTipova[i][0] + headers[i];
    }
    return headers;
  }
  
  dodavanjeNovogReda()
  {
    this.openModalNew(this.modalNew); 
  }

  kreirajNoviRed()
  {
    var kolone = this.dajHeadere();
    var uneteVrednosti:string[] = [];

    if(kolone == null)
      return;

    for(var i = 0; i<kolone.length;i++)
    {
      var field = (<HTMLInputElement>document.getElementById("row" + kolone[i])).value;
      if(field != "")
      {
        uneteVrednosti.push(field);
      }
      else
      {
        // console.log("Niste uneli sva polja!"); 
        this.onInfo("You have not entered all required fields.");
        return; 
      }
    }
    // console.log(uneteVrednosti);

    this.http.post(url+"/api/DataManipulation/addNewRow?idEksperimenta=" + this.idEksperimenta, uneteVrednosti, {responseType: 'text'}).subscribe(
      res => {
        ;
        this.loadDefaultItemsPerPage();
        //this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " New row added " + "(" + this.selectedSnapshot + ")");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.flag++;
        this.onSuccess("New row added.");
    },error=>{
      console.log(error.error);
      this.onError(error.error);
    });
  }

  replaceNaValue()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Column is not selected.");
      return;
    }
    if(this.selectedColumns.length > 1)
    {
      this.onInfo("Select one column.");
      return;
    }

    this.openModalDelete(this.modalValue);
    (<HTMLDivElement>document.getElementById("tip-Vrednosti")).innerHTML = "*" + this.nizTipova[this.selectedColumns[0]];
  }

  fillNaWithValue()
  {
    var vrednost = (<HTMLInputElement>document.getElementById("newNaValue")).value; 
    var kolona = this.selectedColumns[0]; 

    let imeKolone = "";
    imeKolone = this.nizImenaTrenutnihKolona[this.selectedColumns[0]];

     if(isNaN(Number(vrednost)) && this.nizTipova[this.selectedColumns[0]] == "Numerical")
     {
    //   (<HTMLDivElement>document.getElementById("checkNumerical")).style.visibility = "visible";
         this.onInfo("Wrong field type is entered.");
     }
     else
     {
      this.http.post(url+"/api/DataManipulation/fillNaWithValue/" + kolona +"/"+vrednost + "?idEksperimenta=" + this.idEksperimenta,null, {responseType: 'text'}).subscribe(
        res => {
          ;
          this.selectedColumns = []; 
          this.gtyLoadPageWithStatistics(this.page);
          this.brojacAkcija++;
          let dateTime = new Date();
          this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " NA values are replaced by new values (Column: " + imeKolone + ", New value: " + vrednost + ")" + " " + "(" + this.selectedSnapshot + ")");
          this.nizKomandiTooltip.push("" + dateTime.toString() + "");
          this.nizNumerickihKolona = [];
          this.nizKategorickihKolona = [];
          this.EnableDisableGrafik();
          this.flag++;
          this.onSuccess("NA values are replaced by new values.");
      },error=>{
        console.log(error.error);
        this.onError(error.error);
      });
      // close modal 
    }
    
  }
  

dodajTipovePoredKolona(tipovi:string[])
{
  var headers = this.dajHeadere();

  if(headers == null)
   return;

  for(var i=0; i<headers.length;i++)
  {
    (<HTMLDivElement>document.getElementById(i + "column")).innerHTML = tipovi[i][0]; 

    if(tipovi[i][0] == "C")
    {
      (<HTMLDivElement>document.getElementById(i + "column")).style.backgroundColor = "rgb(141, 133, 169)"; 
      (<HTMLDivElement>document.getElementById(i + "column")).style.color = "#301345";
    }
    else
    {
      (<HTMLDivElement>document.getElementById(i + "column")).style.backgroundColor = "rgb(135, 172, 126)"; 
      (<HTMLDivElement>document.getElementById(i + "column")).style.color = "#204513";
    }
  }    
}

zamenaTipaKolone(event:any)
{
  var id = event.target.id;
  var i = 0;
  var prethodni:number = 0;

  while(!isNaN(Number(id[i])))
  {
    prethodni = Number(id[i]) + prethodni * 10;
    i++; 
  }
  var idKolone = prethodni;
  var idKoloneUTabeli = event.target.id;

  var type = this.nizTipova[idKolone];

  let imeKolone = this.nizImenaTrenutnihKolona[idKolone];

  // console.log("ID KOLONE type: "+ idKolone);

  this.http.post(url+"/api/DataManipulation/toggleColumnType/" + idKolone + "?idEksperimenta=" + this.idEksperimenta, null, {responseType: 'text'}).subscribe(
    res => {
      ;
      this.selectedColumns = []; 
      this.gtyLoadPageWithStatistics(this.page);
      // this.selectedColumns = []; 
      this.nizNumerickihKolona = [];
      this.nizKategorickihKolona = [];
      this.EnableDisableGrafik();
      let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Column type is changed (Column: " + imeKolone + ")" + " " + ")" + " " + "(" + this.selectedSnapshot + ")" );
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");
      this.flag++;
      this.onSuccess("Column type is changed.");

      if(type[0] == 'C')
      {
        var elementCat = (<HTMLDivElement>document.getElementById(idKoloneUTabeli));
        elementCat.innerHTML = "N";
        elementCat.style.backgroundColor = "rgb(135, 172, 126)"; 
        elementCat.style.color = "#204513";
        this.nizTipova[idKolone] = "Numerical";
      }
      else
      {
        var elementNum = (<HTMLDivElement>document.getElementById(idKoloneUTabeli));
        elementNum.innerHTML = "C";
        elementNum.style.backgroundColor = "rgb(141, 133, 169)"; 
        elementNum.style.color = "#301345";
        this.nizTipova[idKolone] = "Categorical";
      }

  },error=>{
    console.log(error.error);
    this.selectedColumns = [];  
    this.onInfo("Column type cannot be changed.");
    //this.onError("Tip kolone nije zamenjen.");
  });

 }
 ucitajPodatkeSnapshota(id:number,ime:string = ""){

  this.pomSnapshot = id;
  this.pomImeS = ime;
  if(this.flag == 0)
  {
    this.http.post(url+"/api/Eksperiment/Eksperiment/Csv",null,{params:{idEksperimenta:this.idEksperimenta, idSnapshota:id.toString()}}).subscribe(
      res=>{
       this.loadDefaultItemsPerPage();
       //this.izbrisiSelektovaneKolone();
       this.pomSnapshot = -1;
       this.pomImeS = "";
       this.selectedColumns = [];
       this.nizKategorickihKolona = [];
       this.nizNumerickihKolona = [];
       this.EnableDisableGrafik();
       //this.izbrisiSelektovaneRedove();
       this.rowsAndPages = [];
       // this.PosaljiSnapshot.emit(id);
 
       if(id==0)
       {
       sessionStorage.setItem('idSnapshota',"Default snapshot");
       sessionStorage.setItem('idS',"0");
       this.selectedSnapshot = "Default snapshot";
       }
       else{ 
       //var indeks = Number(id);
       //localStorage.setItem('idSnapshota',this.snapshots[id-1].ime);
       sessionStorage.setItem('idSnapshota',ime);
       sessionStorage.setItem('idS',"" + id);
       this.selectedSnapshot = ime;
       }
       this.PosaljiSnapshot.emit(id);
      }
    );
  }
  else{
    this.open(this.modalSnapshot);
  }
 }

discardChanges(){

  if(this.flag >= 0)
    this.flag = 0;
  if(this.flag == 0)
  {
    this.ucitajPodatkeSnapshota(this.pomSnapshot, this.pomImeS);
  }
}

 imeSnapshota(ime : string){

  if(this.flag == 0)
  {
    (<HTMLButtonElement>document.getElementById("dropdownMenuButton1")).innerHTML = ime;
  }
  else{
    return;
  }
 }

 getPieplot(id:number){

  // console.log(this.selectedColumns[0]); // this.selectedColumns[0]
      this.http.post(url+"/api/Graph/piePlot/"+this.idEksperimenta+"/"+id,null,{responseType:"text"}).subscribe(
        res=>{
          ;
          this.preuzmiSliku();
        },
        error=>{
          console.log(error.error);
        }
      )
}


  pieChartFunction()
  {
    this.lineDatas = [];
    for(let j of this.statistikaCat)
    {
      var unutra = [];
      var naslovi = [];
      var pomm = j.data[3].Frequencies;
          
      for(let ii of pomm)
      {
        unutra.push(Number((Number(ii[1])*100).toFixed(2)));
        naslovi.push(ii[0]);
      }
    
      var lineData11 : ChartData<'pie', number[], string | string[]> = {
        labels: naslovi,
        datasets: [ {
          data: unutra
        } ]
      };
        
      this.lineDatas.push(lineData11);
    }
    //console.log(unutra);
  }
  

}


