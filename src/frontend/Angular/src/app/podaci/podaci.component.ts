import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared/shared.service';
import { ActivatedRoute } from '@angular/router';
import { url } from '../app.module';
import {NotificationsService} from 'angular2-notifications'; 

@Component({
  selector: 'app-podaci',
  templateUrl: './podaci.component.html',
  styleUrls: ['./podaci.component.css']
})
export class PodaciComponent implements OnInit {

  ngOnInit(): void {
    //this.getStat();
    this.ucitanipodaci();
    this.ucitajNaziv();
  }

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

  constructor(public http: HttpClient, private activatedRoute: ActivatedRoute, private shared: SharedService,private service: NotificationsService) { 
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

  niz2:any[] = [];

  selectedOutlier:string="";
  selectedNorm:string="";
  selectedData:string = "";
  selectedForRegression:number = -1;

  threshold:number = 0; 

  public kolone: any[] = [];
  message: any;

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
          this.dodajKomandu("Ucitan testni skup");
          this.onSuccess('Testni skup je ucitan!');
      },error =>{
        console.log(error.error);	
        this.dodajKomandu("Fajl nije unet");
        this.onError("Testni skup nije ucitan!");
        
      });
    }

  }
  // vrednosti za submenu 
  
dajNaziveHeadera()
  {
    var niz = [""];
    var niz3 = [];

    if(this.json == undefined)
      return niz;

    for(var i =0;i<this.niz2.length;i++)
    {
      if(this.niz2[i] != "0")
      {
        niz3[i] = this.niz2[i];
      }
    } 
    return niz3;
  }

  dajStatistiku()
  {
    this.http.get(url+"/api/Upload/statistika", {responseType: 'text'}).subscribe(
      (response: any) => {
        //console.table(response);
        this.jsonStatistika = JSON.parse(response);
        console.log(this.jsonStatistika);
        this.ucitajStatistiku();
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
    //console.log(this.statistikaNum);
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

  dajHeadere()
  {
    if(this.json == undefined)
      return;

    var headers = Object.keys(this.json[0]);
    //console.log(Object.values(this.json[0]));
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
    this.dodajKomandu("OneHotEncoding");

    if(this.selectedColumns.length < 1)
    {
      this.dodajKomandu("OneHotEncoding nije izvršeno");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }

    this.http.post(url+"/api/Upload/oneHotEncoding",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.selectedColumns = [];
        this.loadDefaultItemsPerPage();
        this.dodajKomandu("OneHotEncoding izvršeno");
        //this.loadDefaultItemsPerPage();
        this.onSuccess('OneHot Encoding izvrsen');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("OneHotEncoding nije izvršeno");
      this.onError("OneHot Encoding nije izvrsen!");
    })
  }

  labelEncoding()
  { 
    this.dodajKomandu("LabelEncoding");
    
    if(this.selectedColumns.length < 1)
    {
      this.dodajKomandu("LabelEncoding nije izvršeno");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/labelEncoding",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.selectedColumns = [];
        this.loadDefaultItemsPerPage();
        this.dodajKomandu("LabelEncoding izvršeno");
        //this.loadDefaultItemsPerPage();
        this.onSuccess('Label Encoding izvrsen');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("LabelEncoding nije izvršeno");
      this.onError("Label Encoding nije izvrsen!");
    })
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
      
      if(!this.niz2.includes(header)) // dodatak za regression
      {
        this.niz2.splice(i, 0, header);
      }
     return;
    }
    this.dodajKomandu("Dodata kolona: "+ i);
    this.selectedColumns.push(i);
    console.log(this.selectedColumns);
    this.selectedName = header;

    // dodatak za regression
    if(this.niz2.includes(header))
    {
      const index = this.niz2.indexOf(header, 0);
      if (index > -1) {
      this.niz2.splice(index, 1);
      }    
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
  }
  izbrisiSelektovaneKolone()
  {
    this.selectedColumns = [];

    this.dodajKomandu("Nema selektovanih kolona");
  }
  obrisiIstoriju()
  {
    this.track = "> ";
  }
  ispisiSelektovaneKolone()
  {
    if(this.selectedColumns.length == 0)
      this.dodajKomandu("Nema selektovanih kolona");

    for(let i=0;i<this.selectedColumns.length;i++)
    {
      if(this.selectedColumns[i] != undefined)
        this.dodajKomandu("Kolona " + this.selectedColumns[i]);
    }
  }
  izborUnosa(str:string)
  {
    if(str === "Testni skup")
    {
      (<HTMLDivElement>document.getElementById("unos-fajla")).className = "visible-testniskup";  
      (<HTMLDivElement>document.getElementById("proizvoljan-unos")).className = "invisible-unos";  
    }
    if(str === "Proizvoljno")
    {
      (<HTMLDivElement>document.getElementById("proizvoljan-unos")).className = "visible-unos";   
      (<HTMLDivElement>document.getElementById("unos-fajla")).className = "invisible-testniskup";  
    }
  }

  ispisRatio(){
    let vrednost = (<HTMLInputElement>document.getElementById("input-ratio")).value; 
    let val1:number = (parseFloat)((<HTMLInputElement>document.getElementById("input-ratio")).value);
    (<HTMLInputElement>document.getElementById("vrednost-ratio")).value = vrednost ;  
    let procenat:number = Math.round(val1 * 100);
    (<HTMLDivElement>document.getElementById("current-value")).innerHTML = "" + procenat + "%";
    if(val1 < 0.5)
    {
      (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100 - 10}%`;
    }
    else{
      (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100 - 18}%`;
    }
  }
  upisRatio()
  {
    let vrednost = (<HTMLInputElement>document.getElementById("vrednost-ratio")).value; 
    let val1 = (parseFloat)((<HTMLInputElement>document.getElementById("vrednost-ratio")).value); 
    (<HTMLInputElement>document.getElementById("input-ratio")).value ="" + vrednost; 
    let procenat:number = Math.round(val1 * 100);
    (<HTMLDivElement>document.getElementById("current-value")).innerHTML = "" + procenat + "%";
    if(val1 < 0.5)
    {
      (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100-10}%`;
    }
    else{
      (<HTMLDivElement>document.getElementById("current-value")).style.left = `${val1*100-18}%`;
    }
  }

  setRatio()
  {
    let ratio = (parseFloat)((<HTMLInputElement>document.getElementById("vrednost-ratio")).value); 

    if(Number.isNaN(ratio))
    {
      this.dodajKomandu("Nije unet ratio");
      console.log("Uneta vrednost: "+ratio);
      return;
    }
    this.http.post(url+"/api/Upload/setRatio/"+ratio,ratio,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.dodajKomandu("Dodat ratio: "+ ratio);
        this.onSuccess('Dodat ratio');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Ratio nije dodat");
      this.onError("Ratio nije unet!");
    })

  }
  deleteColumns()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/Upload/deleteColumns",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Uspesno obrisane kolone");
        this.onSuccess('Kolone su obrisane');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Kolone nisu obrisane");
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
    this.http.post(url+"/api/Upload/fillWithMean",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Dodate Mean vrednosti");
        this.onSuccess('Dodate mean vrednosti!');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu dodate");
    })
  }
  fillWithMedian()
  {
    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/Upload/fillWithMedian",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Dodate median vrednosti");
        this.onSuccess('Dodate median vrednosti!');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu dodate");
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
    this.http.post(url+"/api/Upload/fillWithMode",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Dodate mode vrednosti");
        this.onSuccess('Dodate Mode vrednosti!');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu dodate");
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
    this.http.post(url+"/api/Upload/replaceEmpty",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Zamenjene kategoricke vrendosti");
        this.onSuccess('Zamenjene kategoricke vrendosti');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu zamenjene");
      this.onError("Vrednosti nisu zamenjene!");
    })
  }
  replaceZeroWithNA(){

    if(this.selectedColumns.length == 0)
    {
      this.onInfo("Kolone nisu selektovane");
      return;
    }
    this.http.post(url+"/api/Upload/replaceZero",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Zamenjene prazne numericke vrednosti");
        this.onSuccess('Zamenjene numericke vrendosti');
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu zamenjene");
      this.onError("Nisu zamenjene numericke vrednosti!");
    })
  }
  selectAllColumns()
  {
     for(var i = 0;i<this.kolone.length;i++)
     {
      this.selectedColumns.push(i);
      this.isSelectedNum(i);
     }
     console.log(this.selectedColumns);
  }
  selectAllRows()
  {
    for(var i = 0;i<this.itemsPerPage;i++)
     {
      this.rowsAndPages.push([i,this.page]);
      this.isSelectedRow(i);
     }
     console.log(this.rowsAndPages);
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
    this.dodajKomandu("Izabran red "+ i + " sa strane "+ p);
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
  izbrisiSelektovaneRedove()
  {
    this.rowsAndPages = [];

    this.dodajKomandu("Redovi deselektovani");
  }

  deleteRows()
  {
    let redoviZaBrisanje:number[] = [];

    for(let j = 0;j<this.rowsAndPages.length;j++)
    {
      let temp = (this.rowsAndPages[j][1] - 1) * this.itemsPerPage + this.rowsAndPages[j][0]; 
      redoviZaBrisanje.push(temp); 
    }
    let redovi = redoviZaBrisanje.sort((n1,n2) => n1 - n2);

    this.http.post(url+"/api/Upload/deleteRows",redovi,{responseType: 'text'}).subscribe(
      res => {
        if(res == "Redovi za brisanje nisu izabrani")
        {
          this.onInfo("Redovi za brisanje nisu odabrani.");
        }
        else if(res == "Korisnik nije pronadjen" || res == "Token nije setovan")
        {
          this.rowsAndPages = []; // deselekcija redova 
          this.dodajKomandu(res);
          this.onInfo("");
        }
        else 
        {
          this.totalItems = (parseInt)(res);
          this.loadDefaultItemsPerPage();
          this.rowsAndPages = []; // deselekcija redova 
          this.dodajKomandu("Redovi obrisani");
          this.onSuccess("Redovi su obrisani");
        }
    },error=>{
      this.dodajKomandu("Brisanje redova nije izvršeno");
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
    
      this.dodajKomandu("Sve izmene su sacuvane");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Izmene nisu sacuvane");
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
    this.http.put(url+"/api/Upload/updateValue/" + row + "/" + column + "/" + data.value,null, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.rowsAndPages = [];
        this.dodajKomandu("Polje izmenjeno");
        this.onSuccess("Dodata vrednost polja: "+ data.value);
    },error=>{
      console.log(error.error);
      this.rowsAndPages = [];
      this.dodajKomandu("Polje nije izmenjeno");
      this.onError("Vrednost " + data.value + " nije dodata!");
    })
  }

  absoluteMaxScaling()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/absoluteMaxScaling", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Absolute Maximum Scaling izvrseno");
        this.onSuccess("Absolute Max Scaling izvrseno!");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Absolute Maximum Scaling nije izvrseno");
      this.onError("Absolute Max Scaling nije izvrseno!");
    })
  }

  minMaxScaling()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/minMaxScaling", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Min-Max Scaling izvrseno");
        this.onSuccess("Min-Max Scaling izvrseno!");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Min-Max Scaling nije izvrseno");
      this.onError("Min-Max Scaling nije izvrseno!");
    })
  }

  zScoreScaling()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/zScoreScaling", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Z-score Scaling izvrseno");
        this.onSuccess("Z-score Scaling izvrseno!");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Z-score Scaling nije izvrseno");
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
       this.dodajKomandu("Nije odabrana nijedna kolona!");
       this.onInfo("Nije odabrana nijedna kolona");
       return;
     }
     this.http.post(url+"/api/Upload/standardDeviation/" + this.threshold, this.selectedColumns, {responseType: 'text'}).subscribe(
       res => {
         console.log(res);
         this.loadDefaultItemsPerPage();
         this.selectedColumns = [];
         this.dodajKomandu("Standard Deviation izvrseno");
         this.onSuccess("Standard Deviation izvrseno");
     },error=>{
       console.log(error.error);
       this.dodajKomandu("Standard Deviation nije izvrseno");
       this.onError("Standard Deviation nije izvrseno");
     })
   }
   removeOutliersQuantiles()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/outliersQuantiles/" + this.threshold, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Quantiles izvrseno");
        this.onSuccess("Quantiles izvrseno");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Quantiles nije izvrseno");
      this.onError("Quantiles nije izvrseno");
    })
  }
  removeOutliersZScore()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/outliersZScore/" + this.threshold, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("ZSore izvrseno");
        this.onSuccess("Z-Sore izvrseno");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("ZScore nije izvrseno");
      this.onError("Z-Score nije izvrseno");
    })
  }
  
  removeOutliersIQR()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/outliersIQR", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("IQR izvrseno");
        this.onSuccess("IQR izvrseno");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("IQR nije izvrseno");
      this.onError("IQR nije izvrseno");
    })
  }
  removeOutliersIsolationForest()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/outliersIsolationForest", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Isolation Forest izvrseno");
        this.onSuccess("Isolation Forest izvrseno");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Isolaton Forest nije izvrseno");
      this.onError("Isolation Forest nije izvrseno");
    })
  }
  removeOutliersOneClassSVM()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/outliersOneClassSVM", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("One Class SVM izvrseno");
        this.onSuccess("One Class SVM izvrseno");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("One Class SVM nije izvrseno");
      this.onError("One Class SVM nije izvrseno");
    })
  }
  removeOutliersByLocalFactor()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    this.http.post(url+"/api/Upload/outliersByLocalFactor", this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Local factor izvrseno");
        this.onSuccess("Local factor izvrseno");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Local Factor nije izvrseno");
      this.onError("Local factor nije izvrseno");
    })
  }
  selectOutliers(event:any)
  {
    this.selectedOutlier = event.target.id;
    
    if(this.selectedOutlier == "1")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Standard Deviation";
      (<HTMLInputElement>document.getElementById("threshold")).removeAttribute("readonly");
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(37, 164, 214)";
    }
    if(this.selectedOutlier == "2")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Quantiles";
      (<HTMLInputElement>document.getElementById("threshold")).removeAttribute("readOnly");
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(37, 164, 214)";
    }
    if(this.selectedOutlier == "3")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Z-Score"; 
      (<HTMLInputElement>document.getElementById("threshold")).removeAttribute("readOnly");
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(37, 164, 214)";
    }
    if(this.selectedOutlier == "4")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "IQR";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
    }
    if(this.selectedOutlier == "5")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Isolation Forest";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
    }
    if(this.selectedOutlier == "6")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "One Class SVM";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
    }
    if(this.selectedOutlier == "7")
    {
      (<HTMLButtonElement>document.getElementById("outlier-btn")).innerHTML = "Local Factor";
      (<HTMLInputElement>document.getElementById("threshold")).setAttribute("readOnly","");
      (<HTMLInputElement>document.getElementById("threshold")).value = ""; 
      (<HTMLInputElement>document.getElementById("threshold")).style.border = "2px solid rgb(121, 121, 121)";
    }
    
  }
  removeOutliers()
  {
    if(this.selectedOutlier == "")
    {
      this.onInfo("Opcija iz menija nije odabrana.");
    }
    if(this.selectedOutlier == "1")
    {
      this.threshold = (Number)((<HTMLInputElement>document.getElementById("threshold")).value);
      console.log(typeof(this.threshold));
      this.removeStandardDeviation();
    }
    if(this.selectedOutlier == "2")
    {
      this.threshold = (Number)((<HTMLInputElement>document.getElementById("threshold")).value);
      this.removeOutliersQuantiles();
    }
    if(this.selectedOutlier == "3")
    {
      this.threshold = (Number)((<HTMLInputElement>document.getElementById("threshold")).value);
      this.removeOutliersZScore();
    }
    if(this.selectedOutlier == "4")
    {
      this.removeOutliersIQR();
    }
    if(this.selectedOutlier == "5")
    {
      this.removeOutliersIsolationForest()
    }
    if(this.selectedOutlier == "6")
    {
      this.removeOutliersOneClassSVM();
    }
    if(this.selectedOutlier == "7")
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
    this.http.post(url+"/api/Upload/deleteAllRowsNA",null,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.dodajKomandu("Uspesno obrisani svi NA redovi");
        this.onSuccess("Uspesno obrisani svi NA redovi");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("NA redovi nisu obrisani");
      this.onError("NA redovi nisu obrisani");
    });
  }

  deleteAllColumnsWithNA()
  {
    this.http.post(url+"/api/Upload/deleteAllColumnsNA",null,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.dodajKomandu("Uspesno obrisane kolone");
        this.onSuccess("Uspesno obrisane sve kolone sa NA vrednostima");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Kolone nisu obrisane");
      this.onError("Kolone sa NA vrednostima nisu obrisane!");
    });
  }

  deleteRowsWithNAforSelectedColumns()
  {
    if(this.selectedColumns.length == 0)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }

    this.http.post(url+"/api/Upload/deleteNARowsForColumns",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Uspesno obrisani NA redovi");
        this.onSuccess("Uspesno su obrisani svi redovi sa NA vrednostima");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Redovi nisu obrisani");
      this.onError("Redovi nisu obrisani!");
    });
  }

  selectData(event:any)
  {
    this.selectedData = event.target.id;

    if(this.selectedData == "1")
    {
      (<HTMLButtonElement>document.getElementById("select-data")).innerHTML = "Izbaci selektovane vrste";
    }
    if(this.selectedData == "2")
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
    if(this.selectedData == "1")
    {
      this.deleteRows();
    }
    if(this.selectedData == "2")
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
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona");
      return;
    }
    if(this.selectedForRegression == -1)
    {
      this.dodajKomandu("Nije odabrana nijedna kolona!");
      this.onInfo("Nije odabrana nijedna kolona iz menija.");
      return;
    }
    this.http.post(url+"/api/Upload/linearRegression/" + this.selectedForRegression, this.selectedColumns, {responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedForRegression = -1;
        this.selectedColumns = [];
        this.dodajKomandu("Zamena vrednosti NA sa vrednostima dobijenih regresijom izvrseno");
        this.onSuccess("Regression - uspesno!");
        (<HTMLInputElement>document.getElementById("regresija-input")).value = ""; 
    },error=>{
      console.log(error.error);
      this.selectedForRegression = -1;
      this.dodajKomandu("Zamena vrednosti NA sa vrednostima dobijenih regresijom izvrseno");
      this.onError("Regression - neuspesno!");
      (<HTMLInputElement>document.getElementById("regresija-input")).value = ""; 
    });
  }
 
}

