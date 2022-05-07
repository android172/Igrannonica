import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared/shared.service';
import { ActivatedRoute } from '@angular/router';
import { url } from '../app.module';
import {NotificationsService} from 'angular2-notifications'; 
import { DatePipe } from '@angular/common';
import { Observable, Subscriber } from 'rxjs';
import { saveAs } from 'file-saver';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef, ViewChild,ElementRef } from '@angular/core';
import { Options, LabelType } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-podaci',
  templateUrl: './podaci.component.html',
  styleUrls: ['./podaci.component.css']
})
export class PodaciComponent implements OnInit {

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
    this.ucitanipodaci();
    this.ucitajNaziv();
    this.ucitajSnapshotove();
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

  ucitanipodaci(){
    this.http.get(url+"/api/Eksperiment/Eksperiment/Csv?id="+this.idEksperimenta,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        this.fileName=res;
        (<HTMLDivElement>document.getElementById("poruka")).className="visible-y";  
        (<HTMLDivElement>document.getElementById("porukaGreske")).className="nonvisible-n";  
        (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "visible";
        (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "visible";
        this.loadDefaultItemsPerPage();
      }
    )
  }

  constructor(public http: HttpClient, private activatedRoute: ActivatedRoute, private shared: SharedService, private modalService: NgbModal, private service: NotificationsService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        console.log(this.idEksperimenta);
      }
    )
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

  getStat()
  {
    this.http.get<any>('/assets/stats.json').subscribe(
      response => {
        console.log(response);
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

  niz2:any[] = [];

  selectedOutlier:string="";
  selectedNorm:string="";
  selectedData:string = "";
  selectedForRegression:number = -1;

  threshold:number = 0; 

  public kolone: any[] = [];
  message: any;

  selektovanGrafik: string = "";
  indikator:boolean = true; // tabela sa podacima
  nizRedovaStatistika:string[][] = []; // statistika numerickih vrednosti

  snapshots:any = [];

  closeResult = ''; // Ng Modal 1 
  nazivSnapshot = "";
  idSnapshotaOverride:string = "";
  nazivSnapshotaOverride:string = "";

  onFileSelected(event:any) 
  {
    const file:File = event.target.files[0];

    if (file) 
    {
      this.fileName = file.name;

      const formData = new FormData();
      formData.append("file", file, this.fileName);  	

      const upload$ = this.http.post(url+"/api/Upload/fileUpload/" + this.idEksperimenta , formData, {responseType: 'text'}).subscribe(
        res=>{
          this.loadDefaultItemsPerPage();
          (<HTMLDivElement>document.getElementById("poruka")).className="visible-y";  
          (<HTMLDivElement>document.getElementById("porukaGreske")).className="nonvisible-n";  
          (<HTMLDivElement>document.getElementById("pagingControls")).style.color = "white";
          (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "visible";
          (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "visible";
          this.onSuccess('Podaci su ucitani!');
      },error =>{
        console.log(error.error);	
        var div = (<HTMLDivElement>document.getElementById("porukaGreske")).className="visible-n";
        console.log("Greska");
        (<HTMLDivElement>document.getElementById("poruka")).className="nonvisible-y";  
        (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "hidden";
        (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "hidden";
        this.onError("Podaci nisu ucitani");

        if(error.error === "Unet nedozvoljen tip fajla."){
          console.log("Nedozvoljeno");
        }
      });
    }
  }

  ucitajTipoveKolona(){

    this.http.get(url+"/api/Upload/ColumnTypes").subscribe(
      (response: any) => {

        console.log(response);
        this.nizTipova = response;

      },error =>{

        console.log(error.error);
      }
   );
  }

  loadDefaultItemsPerPage()
  {      
    this.http.get(url+"/api/Upload/paging/1/10").subscribe(
       (response: any) => {
         this.jsonStatistika = undefined
         this.statistikaCat = []
         this.statistikaNum = []
         //console.log(response);
        console.log(JSON.parse(response.data));
        this.json =  JSON.parse(response.data);
        this.ucitanCsv = true;
        this.dajStatistiku();
         //this.json = response;
        this.totalItems = response.totalItems;
        this.gty(1);
        this.page = 1;
    })

    this.ucitajTipoveKolona();
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
          this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Ucitan testni skup ");
          this.nizKomandiTooltip.push("" + dateTime.toString() + "");
          this.onSuccess('Testni skup je ucitan!');
      },error =>{
        console.log(error.error);	
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Fajl nije ucitan ");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onError("Testni skup nije ucitan!");
        
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
    this.http.get(url+"/api/Statistics/statistika", {responseType: 'text'}).subscribe(
      (response: any) => {
        //console.table(response);
        this.jsonStatistika = JSON.parse(response);
        console.log(this.jsonStatistika);
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
                var decimale = strPom[1];
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
    console.log(this.statistikaNum);
    //console.log(this.statistikaCat);
  }

  promeniBrojRedova(value: any)
  {
    this.itemsPerPage = parseInt(value);
    this.http.get(url+"/api/Upload/paging/1/" + this.itemsPerPage).subscribe(
      (response: any) => {
        this.json =  JSON.parse(response.data);
        this.totalItems = response.totalItems;
        this.page = 1;

        this.onInfo("Broj redova za prikaz: "+this.itemsPerPage);
    })
  }

  gty(page: any){
   console.log("---GTY--");
   this.itemsPerPage = (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).value;
   console.log(this.itemsPerPage);
   console.log(this.page);
   this.http.get(url+"/api/Upload/paging/" + page + "/" + this.itemsPerPage).subscribe(
      (response: any) => {
        this.json =  JSON.parse(response.data);
        this.totalItems = response.totalItems;
    })
  }
  gtyLoadPageWithStatistics(page: any){
    this.itemsPerPage = (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).value;
    this.http.get(url+"/api/Upload/paging/" + page + "/" + this.itemsPerPage).subscribe(
       (response: any) => {
        this.jsonStatistika = undefined
        this.statistikaCat = []
        this.statistikaNum = []
         this.json =  JSON.parse(response.data); 
         this.totalItems = response.totalItems;
         this.dajStatistiku();
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
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }

    this.http.post(url+"/api/DataManipulation/oneHotEncoding",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " OneHotEncoding izvrseno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        //this.loadDefaultItemsPerPage();
        this.onSuccess('OneHot Encoding izvrsen');
    },error=>{
      console.log(error.error);
      let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " OneHotEncoding nije izvršeno");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");
      this.onError("OneHot Encoding nije izvrsen!");
    })
  }

  labelEncoding()
  { 
    //this.dodajKomandu("LabelEncoding");
    
    if(this.selectedColumns.length < 1)
    {
      //this.dodajKomandu("LabelEncoding nije izvršeno");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/labelEncoding",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " LabelEncoding izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        //this.loadDefaultItemsPerPage();
        this.onSuccess('Label Encoding izvrsen');
    },error=>{
      console.log(error.error);
      let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " LabelEncoding nije izvršeno");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");
      this.onError("Label Encoding nije izvrsen!");
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
        console.log(this.selectedColumns);
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
        console.log(this.nizKategorickihKolona);
      }
      else
      {
        const index2 = this.nizNumerickihKolona.indexOf(i, 0);
        if (index2 > -1) {
        this.nizNumerickihKolona.splice(index2, 1);
        } 
        console.log(this.nizNumerickihKolona);
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
      console.log(this.nizKategorickihKolona);
    }
    else
    {
      this.nizNumerickihKolona.push(i); 
      console.log(this.nizNumerickihKolona);
    }
    this.EnableDisableGrafik();

    console.log(this.selectedColumns);
    this.selectedName = header;

    // dodatak za regression
    if(this.niz2.includes(header))
    {
      this.niz2[i] = "0";
      console.log(this.niz2);  
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
    }
    if(str === "Proizvoljno")
    {
      (<HTMLDivElement>document.getElementById("proizvoljan-unos")).className = "visible-unos";   
      (<HTMLDivElement>document.getElementById("unos-fajla")).className = "invisible-testniskup";
      (<HTMLDivElement>document.getElementById("testniskup-comp")).style.height = "150px";
      (<HTMLDivElement>document.getElementById("testniskup-comp")).style.transition = "0.3s";
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
    (<HTMLInputElement>document.getElementById("vrednost-ratio")).value = vrednost;
  }

  upisRatio()
  {
    let vrednost = (<HTMLInputElement>document.getElementById("vrednost-ratio")).value;
    // let val1 = (parseFloat)((<HTMLInputElement>document.getElementById("vrednost-ratio")).value);
    this.value = parseInt(vrednost);
    (<HTMLInputElement>document.getElementById("input-ratio")).value = this.value + ""; 
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
      console.log("Uneta vrednost: "+ ratio);
      return;
    }
    this.http.post(url+"/api/Upload/setRatio/"+ratio,ratio,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  "Dodat ratio: "+ ratio);
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess('Dodat ratio');
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Ratio nije dodat");
      this.onError("Ratio nije unet!");
    })

  }
  deleteColumns()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/DataManipulation/deleteColumns",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
       // this.dodajKomandu("Uspesno obrisane kolone");
        this.onSuccess('Kolone su obrisane');
    },error=>{
      console.log(error.error);
    //  this.dodajKomandu("Kolone nisu obrisane");
      this.onError('Kolone nisu obrisane');
    })
  }

  fillWithMean()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/DataManipulation/fillWithMean",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Dodate Mean vrednosti");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess('Dodate mean vrednosti!');
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Vrednosti nisu dodate");
    })
  }
  fillWithMedian()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/DataManipulation/fillWithMedian",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Dodate median vrednosti");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess('Dodate median vrednosti!');
    },error=>{
      console.log(error.error);
    //  this.dodajKomandu("Vrednosti nisu dodate");
      this.onError("Vrednosti nisu dodate!");
    })
  }
  fillWithMode()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/DataManipulation/fillWithMode",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Dodate mode vrednosti");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess('Dodate Mode vrednosti!');
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Vrednosti nisu dodate");
      this.onError("Vrednosti nisu dodate!");
    })
  }

  replaceEmptyWithNA()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/DataManipulation/replaceEmpty",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Zamenjene kategoricke vrednosti");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess('Zamenjene kategoricke vrednosti');
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Vrednosti nisu zamenjene");
      this.onError("Vrednosti nisu zamenjene!");
    })
  }
  replaceZeroWithNA(){

    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/DataManipulation/replaceZero",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Zamenjene prazne numeričke vrednosti");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess('Zamenjene numericke vrendosti');
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Vrednosti nisu zamenjene");
      this.onError("Nisu zamenjene numericke vrednosti!");
    })
  }
  selectAllColumns(event:any)
  {
    if((<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML === "Selektuj sve kolone")
    { 
      for(var i = 0;i<this.kolone.length;i++)
      {
        this.selectedColumns.push(i);
        if(this.nizTipova[i] === "Categorical")
          this.nizKategorickihKolona.push(i);
        else
          this.nizNumerickihKolona.push(i);
        this.isSelectedNum(i);
      }
      this.EnableDisableGrafik();
     console.log(this.selectedColumns);
     (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Deselektuj kolone";
    }
    else{

        this.izbrisiSelektovaneKolone();
        (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Selektuj sve kolone";
    }
  }
  selectAllRows(event:any)
  {
    if((<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML === "Selektuj sve redove")
    {
      for(var i = 0;i<this.itemsPerPage;i++)
      {
        this.rowsAndPages.push([i,this.page]);
        this.isSelectedRow(i);
      }
      console.log(this.rowsAndPages);
      (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Deselektuj redove";
    }
    else{

      this.izbrisiSelektovaneRedove();
      (<HTMLButtonElement>document.getElementById(event.target.id)).innerHTML = "Selektuj sve redove";
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

    //this.dodajKomandu("Redovi deselektovani");
  }

  deleteRows()
  {
    if(this.rowsAndPages.length == 0)
    {
      //this.onInfo("Nema selektovanih redova."); 
      return; 
    }
    let redoviZaBrisanje:number[] = [];

    for(let j = 0;j<this.rowsAndPages.length;j++)
    {
      let temp = (this.rowsAndPages[j][1] - 1) * this.itemsPerPage + this.rowsAndPages[j][0]; 
      redoviZaBrisanje.push(temp); 
    }
    let redovi = redoviZaBrisanje.sort((n1,n2) => n1 - n2);

    this.http.post(url+"/api/DataManipulation/deleteRows",redovi,{responseType: 'text'}).subscribe(
      res => {
        if(res == "Redovi za brisanje nisu izabrani")
        {
          this.onInfo("Redovi za brisanje nisu odabrani.");
        }
        else if(res == "Korisnik nije pronadjen" || res == "Token nije setovan")
        {
          this.rowsAndPages = []; // deselekcija redova 
          let dateTime = new Date();
          this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " " + res);
          this.nizKomandiTooltip.push("" + dateTime.toString() + "");
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
          this.onSuccess("Redovi su obrisani");
        }
    },error=>{
     // this.dodajKomandu("Brisanje redova nije izvršeno");
      this.onError("Brisanje nije izvrseno!");
    })
  }
  ucitajNaziv()
  {
    this.http.get(url+'/api/Eksperiment/Eksperiment/Naziv/' + this.idEksperimenta, {responseType: 'text'}).subscribe(
        res=>{
          console.log(res);
          this.nazivEksperimenta = res;
          var div = (<HTMLInputElement>document.getElementById("naziveksperimenta")).value = this.nazivEksperimenta;
          console.log(this.nazivEksperimenta);
        },error=>{
          console.log(error.error);
        }
    );
  }

  
  proveriE(){
    var nazivE = (<HTMLInputElement>document.getElementById("naziveksperimenta")).value;

    this.http.put(url+"/api/Eksperiment/Eksperiment?ime=" + nazivE + "&id=" + this.idEksperimenta,null, {responseType : "text"}).subscribe(
      res=>{
        console.log(res);
        this.onSuccess("Naziv eksperimenta uspesno promenjen!");
      }, error=>{
        this.ucitajNaziv();
        if(error.error === "Postoji eksperiment sa tim imenom")
        {
          //alert("Postoji eksperiment sa tim imenom.");
          this.onInfo("Postoji eksperiment s tim imenom");
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

    this.http.post(url + "/api/Upload/sacuvajIzmene",null, {responseType: 'text'}).subscribe(
    res => {
      console.log(res);
      this.onSuccess("Izmene su sacuvane");
      let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Sve izmene su sacuvane ");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");
    },error=>{
      console.log(error.error);
     /* let dateTime = new Date();
      this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Izmene nisu sacuvane");
      this.nizKomandiTooltip.push("" + dateTime.toString() + "");*/
      this.onError("Izmene nisu sacuvane!");
    })
    
  }

  izmeniPolje(row:number,column:number,page:any,data:any)
  {
    row = page * this.itemsPerPage - this.itemsPerPage + row;
/*
    if(data == undefined)
    {
      data.value = "";
    }*/
    console.log(typeof(data.value));
    this.http.put(url+"/api/DataManipulation/updateValue/" + row + "/" + column + "/" + data.value,null, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        this.rowsAndPages = [];
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Polje izmenjeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Dodata vrednost polja: "+ data.value);
    },error=>{
      console.log(error.error);
      this.rowsAndPages = [];
      //this.dodajKomandu("Polje nije izmenjeno");
      this.onError("Vrednost " + data.value + " nije dodata!");
    })
  }

  absoluteMaxScaling()
  {
    if(this.selectedColumns.length == 0)
    {
     // this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/absoluteMaxScaling", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Absolute Maximum Scaling izvrseno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Absolute Max Scaling izvrseno!");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Absolute Maximum Scaling nije izvrseno");
      this.onError("Absolute Max Scaling nije izvrseno!");
    })
  }

  minMaxScaling()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/minMaxScaling", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Min-max Scaling izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Min-Max Scaling izvrseno!");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Min-Max Scaling nije izvrseno");
      this.onError("Min-Max Scaling nije izvrseno!");
    })
  }

  zScoreScaling()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/zScoreScaling", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Z-score Scaling izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Z-score Scaling izvrseno!");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Z-score Scaling nije izvrseno");
      this.onError("Z-score Scaling nije izvrseno!");
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
      this.onInfo("Opcija iz menija nije odabrana.");
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
    (<HTMLButtonElement>document.getElementById("norm-btn")).innerHTML = "Izaberite tip normalizacije"; 
  }
   // OUTLIERS 

   removeStandardDeviation()
   {
     if(this.selectedColumns.length == 0)
     {
       //this.dodajKomandu("Nije odabrana nijedna kolona!");
       this.onInfo("Nije odabrana nijedna kolona");
       return;
     }
     this.http.post(url+"/api/DataManipulation/standardDeviation/" + this.threshold, this.selectedColumns, {responseType: 'text'}).subscribe(
       res => {
         console.log(res);
         //this.loadDefaultItemsPerPage();
         this.gtyLoadPageWithStatistics(this.page);
         this.brojacAkcija++;
         this.selectedColumns = [];
         this.nizKategorickihKolona = [];
         this.nizNumerickihKolona = [];
         this.EnableDisableGrafik();
         let dateTime = new Date();
         this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Standard Deviation izvršeno");
         this.nizKomandiTooltip.push("" + dateTime.toString() + "");
         this.onSuccess("Standard Deviation izvrseno");
     },error=>{
       console.log(error.error);
       //this.dodajKomandu("Standard Deviation nije izvrseno");
       this.onError("Standard Deviation nije izvrseno");
     })
   }
   removeOutliersQuantiles()
  {
    if(this.selectedColumns.length == 0)
    {
     // this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/outliersQuantiles/" + this.threshold, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Quantiles izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Quantiles izvrseno");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Quantiles nije izvrseno");
      this.onError("Quantiles nije izvrseno");
    })
  }
  removeOutliersZScore()
  {
    if(this.selectedColumns.length == 0)
    {
     // this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/outliersZScore/" + this.threshold, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  "Z-Sore izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Z-Sore izvrseno");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("ZScore nije izvrseno");
      this.onError("Z-Score nije izvrseno");
    })
  }
  
  removeOutliersIQR()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/outliersIQR", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " IQR izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("IQR izvrseno");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("IQR nije izvrseno");
      this.onError("IQR nije izvrseno");
    })
  }
  removeOutliersIsolationForest()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/outliersIsolationForest", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Isolation Forest izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Isolation Forest izvrseno");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Isolaton Forest nije izvrseno");
      this.onError("Isolation Forest nije izvrseno");
    })
  }
  removeOutliersOneClassSVM()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/outliersOneClassSVM", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " One Class SVM izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("One Class SVM izvrseno");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("One Class SVM nije izvrseno");
      this.onError("One Class SVM nije izvrseno");
    })
  }
  removeOutliersByLocalFactor()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/DataManipulation/outliersByLocalFactor", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Local factor izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Local factor izvrseno");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("Local Factor nije izvrseno");
      this.onError("Local factor nije izvrseno");
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
      this.onInfo("Opcija iz menija nije odabrana.");
    }
    if(this.selectedOutlier == "option-sd")
    {
      this.threshold = (Number)((<HTMLInputElement>document.getElementById("threshold")).value);
      console.log(typeof(this.threshold));
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
    (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Izbacivanje izuzetaka";
    (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
    (<HTMLInputElement>document.getElementById("threshold")).value = "";
    (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
  }

  deleteAllRowsWithNA()
  {
    this.http.post(url+"/api/DataManipulation/deleteAllRowsNA",null,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Uspešno obrisani svi NA redovi");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Uspesno obrisani svi NA redovi");
    },error=>{
      console.log(error.error);
     // this.dodajKomandu("NA redovi nisu obrisani");
      this.onError("NA redovi nisu obrisani");
    });
  }

  deleteAllColumnsWithNA()
  {
    this.http.post(url+"/api/DataManipulation/deleteAllColumnsNA",null,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Uspešno obrisane kolone sa NA vrednostima");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Uspesno obrisane sve kolone sa NA vrednostima");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Kolone nisu obrisane");
      this.onError("Kolone sa NA vrednostima nisu obrisane!");
    });
  }

  deleteRowsWithNAforSelectedColumns()
  {
    if(this.selectedColumns.length == 0)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }

    this.http.post(url+"/api/DataManipulation/deleteNARowsForColumns",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Uspešno obrisani NA redovi");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Uspesno su obrisani svi redovi sa NA vrednostima");
    },error=>{
      console.log(error.error);
      //this.dodajKomandu("Redovi nisu obrisani");
      this.onError("Redovi nisu obrisani!");
    });
  }

  selectData(event:any)
  {
    this.selectedData = event.target.id;

    if(this.selectedData == "izbaci-selekt-vrste")
    {
      (<HTMLButtonElement>document.getElementById("select-data")).innerHTML = "Izbaci selektovane vrste";
    }
    if(this.selectedData == "izbaci-selekt-kolone")
    {
      (<HTMLButtonElement>document.getElementById("select-data")).innerHTML = "Izbaci selektovane kolone";
    }
  }
  primeniNaPodatke()
  {
    if(this.selectedData == "")
    {
      this.onInfo("Opcija iz menija nije odabrana.");
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
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    if(this.selectedForRegression == -1)
    {
      //this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona iz menija.");
      return;
    }
    this.http.post(url+"/api/DataManipulation/linearRegression/" + this.selectedForRegression, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        //this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        this.selectedForRegression = -1;
        this.selectedColumns = [];
        this.nizKategorickihKolona = [];
        this.nizNumerickihKolona = [];
        this.EnableDisableGrafik();
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Zamena vrednosti NA sa vrednostima dobijenih regresijom izvršeno");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Regression - uspesno!");
        (<HTMLInputElement>document.getElementById("regresija-input")).value = ""; 
    },error=>{
      console.log(error.error);
      this.selectedForRegression = -1;
     // this.dodajKomandu("Zamena vrednosti NA sa vrednostima dobijenih regresijom izvrseno");
      this.onError("Regression - neuspesno!");
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
    var id = (<HTMLButtonElement>document.getElementById("verzijaSnapshotaSelect")).value;
    console.log(this.snapshots);
    console.log(id);
    this.http.post(url+"/api/File/download/" + this.idEksperimenta, null, {responseType: 'text',params:{"versionName":this.snapshots[Number(id)-1].csv}}).subscribe(
      res => {

        var blob = new Blob([res], {type: 'text/csv' })
        saveAs(blob, "dataset_"+this.fileName);

        this.onSuccess("Podaci tabele preuzeti!");
    },error=>{
      console.log(error.error);
      this.onError("Podaci nisu preuzeti!");
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

    this.http.post(url+"/api/Graph/scatterplot",this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getBoxplot(){

    this.http.post(url+"/api/Graph/boxplot",this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getViolinplot(){

    this.http.post(url+"/api/Graph/violinplot",this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getBarplot(){

    this.http.post(url+"/api/Graph/barplot",this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getHistogram(){

    this.http.post(url+"/api/Graph/histogram",this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getHexbin(){

    this.http.post(url+"/api/Graph/hexbin",this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        this.preuzmiSliku();
      },
      error=>{
        console.log(error.error);
      }
    )
  }

  getDensityplot(){

    this.http.post(url+"/api/Graph/densityplot",this.selectedColumns,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
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
        console.log(blob);
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

    if(this.brojacUndoRedo < 5 && this.brojacAkcija > 0)
    {
      this.undo();
      this.brojacUndoRedo++;
      this.brojacAkcija--;
    }
    else{
      console.log("Ne moze unazad");
    }
  }

  undo(){

    this.http.post(url+"/api/Eksperiment/Undo",null,{responseType:"text"}).subscribe(
      res => {
        console.log(res);
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.obrisiKomandu();
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

    this.http.post(url+"/api/Eksperiment/Redo",null,{responseType:"text"}).subscribe(
      res => {
        console.log(res);
       // this.loadDefaultItemsPerPage();
        this.gtyLoadPageWithStatistics(this.page);
        this.vratiKomandu();
      },
      error =>{
        console.log(error.error);
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

  ucitajSnapshotove(){
    this.http.get(url+"/api/File/Snapshots?id="+this.idEksperimenta).subscribe(
      res=>{
        this.snapshots = res;
      }
    );
  }
  sacuvajTrenutnuVerziju(){
    var id = (<HTMLButtonElement>document.getElementById("verzijaSnapshotaSelect")).value;
    if(id!="0"){
      this.http.post(url+"/api/File/SaveSnapshot?idEksperimenta="+this.idEksperimenta+"&idSnapshota="+id,null,{responseType:"text"}).subscribe(
        res=>{
          console.log(res);
        }
      );
    }
  }
  
sacuvajKaoNovu(ime:string){
  var naziv=ime.trim();
  if(naziv!=""){
    this.http.post(url+"/api/File/SaveAsSnapshot?idEksperimenta="+this.idEksperimenta+"&naziv="+naziv,null,{responseType:"text"}).subscribe(
      res=>{
        console.log(res);
        if(res!="-1"){
          console.log("Sacuvan snapshot.");
          this.onSuccess("Nova verzija je uspesno sacuvana.");
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
            console.log("Postoji");          
            // override ... 
            this.idSnapshotaOverride = res;
            this.nazivSnapshotaOverride = naziv;
          }
          else{
            // ne postoji u bazi -> cuvaj kao novu
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
    var id = (<HTMLButtonElement>document.getElementById("verzijaSnapshotaSelect")).value;
    if(id!="0"){
      this.http.delete(url+"/api/File/Snapshot?id"+id).subscribe(
        res=>{
          console.log(res);
        }
      )
    }
  }
  // 2. fun za brisanje
  izbrisiSnapshott(id:any){
      this.http.delete(url+"/api/File/Snapshot?id"+id).subscribe(
        res=>{
          console.log(res);
          const index = this.snapshots.indexOf(this.nazivSnapshotaOverride, 0);
          if (index > -1) {
            this.snapshots.splice(index, 1);
          }
        }
      );
    
  }

  overrideSnapshot()
  {
    this.izbrisiSnapshott(this.idSnapshotaOverride);
    this.sacuvajKaoNovu(this.nazivSnapshotaOverride);

    this.idSnapshotaOverride = "";
    this.nazivSnapshotaOverride = "";
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
      text = "You have not selected any fields.";
      
      this.openModalDeleteClose(this.modalDeleteClose); 
      (<HTMLDivElement>document.getElementById("textDeleteClose")).innerHTML = text;
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
        console.log("Niste uneli sva polja!"); 
        this.onInfo("Niste uneli sva potrebna polja.");
        return; 
      }
    }
    console.log(uneteVrednosti);

    this.http.post(url+"/api/DataManipulation/addNewRow", uneteVrednosti, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        //this.gtyLoadPageWithStatistics(this.page);
        this.brojacAkcija++;
        let dateTime = new Date();
        this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Dodat novi red.");
        this.nizKomandiTooltip.push("" + dateTime.toString() + "");
        this.onSuccess("Dodat je novi red.");
    },error=>{
      console.log(error.error);
      this.onError("Dodavanje reda nije izvrseno.");
    });
  }

  replaceNaValue()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Niste odabrali kolonu.");
      return;
    }
    if(this.selectedColumns.length > 1)
    {
      this.onInfo("Odaberite jednu kolonu.");
      return;
    }
    this.openModalDelete(this.modalValue);
    (<HTMLDivElement>document.getElementById("tip-Vrednosti")).innerHTML = "*" + this.nizTipova[this.selectedColumns[0]];
  }

  fillNaWithValue()
  {
    var vrednost = (<HTMLInputElement>document.getElementById("newNaValue")).value; 
    var kolona = this.selectedColumns[0]; 

     if(isNaN(Number(vrednost)) && this.nizTipova[this.selectedColumns[0]] == "Numerical")
     {
    //   (<HTMLDivElement>document.getElementById("checkNumerical")).style.visibility = "visible";
         this.onInfo("Unet je pogresan tip polja.");
     }
     else
     {
      this.http.post(url+"/api/DataManipulation/fillNaWithValue/" + kolona +"/"+vrednost ,null, {responseType: 'text'}).subscribe(
        res => {
          console.log(res);
          this.selectedColumns = []; 
          this.gtyLoadPageWithStatistics(this.page);
          this.brojacAkcija++;
          let dateTime = new Date();
          this.dodajKomandu(dateTime.toLocaleTimeString() + " — " +  " Zamenjene NA vrendosti novom vrednoscu.");
          this.nizKomandiTooltip.push("" + dateTime.toString() + "");
          this.onSuccess("Zamenjene NA vrednosti novom vrednoscu.");
      },error=>{
        console.log(error.error);
        this.onError("Zamena NA nije izvrsena.");
      });
      // close modal 
    }
    
  }

  }


