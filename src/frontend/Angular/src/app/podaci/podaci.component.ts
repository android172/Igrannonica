import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared/shared.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-podaci',
  templateUrl: './podaci.component.html',
  styleUrls: ['./podaci.component.css']
})
export class PodaciComponent implements OnInit {

  ngOnInit(): void {
    //this.getStat();
    this.ucitanipodaci();
  }

  ucitanipodaci(){
    this.http.get("http://localhost:5008/api/Eksperiment/Eksperiment/Csv?id="+this.idEksperimenta,{responseType:"text"}).subscribe(
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

  constructor(public http: HttpClient, private activatedRoute: ActivatedRoute, private shared: SharedService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.idEksperimenta = params['id'];
        console.log(this.idEksperimenta);
      }
    )
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

      const upload$ = this.http.post("http://localhost:5008/api/Upload/upload/" + this.idEksperimenta , formData, {responseType: 'text'}).subscribe(
        res=>{
          this.loadDefaultItemsPerPage();
          (<HTMLDivElement>document.getElementById("poruka")).className="visible-y";  
          (<HTMLDivElement>document.getElementById("porukaGreske")).className="nonvisible-n";  
          (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "visible";
          (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "visible";
      },error =>{
        console.log(error.error);	
        var div = (<HTMLDivElement>document.getElementById("porukaGreske")).className="visible-n";
        console.log("Greska");
        (<HTMLDivElement>document.getElementById("poruka")).className="nonvisible-y";  
        (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "hidden";
        (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "hidden";
      });
    }
  }

  loadDefaultItemsPerPage()
  {      
    this.http.get("http://localhost:5008/api/Upload/paging/1/10").subscribe(
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

      const upload$ = this.http.post("http://localhost:5008/api/Upload/uploadTest/" + this.idEksperimenta , formData, {responseType: 'text'}).subscribe(
        res=>{
          this.dodajKomandu("Ucitan testni skup");
      },error =>{
        console.log(error.error);	
        this.dodajKomandu("Fajl nije unet");
        
      });
    }

  }


  dajStatistiku()
  {
    this.http.get("http://localhost:5008/api/Upload/statistika", {responseType: 'text'}).subscribe(
      (response: any) => {
        //console.table(response);
        this.jsonStatistika = JSON.parse(response);
        this.ucitajStatistiku();
      }
    )
  }

  ucitajStatistiku()
  {
    if(this.jsonStatistika == undefined)
      return;

    this.keys = Object.keys(this.jsonStatistika);
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
    this.http.get("http://localhost:5008/api/Upload/paging/1/" + this.itemsPerPage).subscribe(
      (response: any) => {
        this.json =  JSON.parse(response.data);
        this.totalItems = response.totalItems;
        this.page = 1;
    })
  }

  gty(page: any){
   console.log("---GTY--");
   this.itemsPerPage = (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).value;
   console.log(this.itemsPerPage);
   console.log(this.page);
   this.http.get("http://localhost:5008/api/Upload/paging/" + page + "/" + this.itemsPerPage).subscribe(
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
    return redValues;
  }

  oneHotEncoding()
  { 
    this.dodajKomandu("OneHotEncoding");

    if(this.selectedColumns.length < 1)
    {
      this.dodajKomandu("OneHotEncoding nije izvršeno");
      return;
    }

    this.http.post("http://localhost:5008/api/Upload/oneHotEncoding",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.selectedColumns = [];
        this.loadDefaultItemsPerPage();
        this.dodajKomandu("OneHotEncoding izvršeno");
        //this.loadDefaultItemsPerPage();
    },error=>{
      console.log(error.error);
      this.dodajKomandu("OneHotEncoding nije izvršeno");
    })
  }

  labelEncoding()
  { 
    this.dodajKomandu("LabelEncoding");
    
    if(this.selectedColumns.length < 1)
    {
      this.dodajKomandu("LabelEncoding nije izvršeno");
      return;
    }
    this.http.post("http://localhost:5008/api/Upload/labelEncoding",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.selectedColumns = [];
        this.loadDefaultItemsPerPage();
        this.dodajKomandu("LabelEncoding izvršeno");
        //this.loadDefaultItemsPerPage();
    },error=>{
      console.log(error.error);
      this.dodajKomandu("LabelEncoding nije izvršeno");
    })
  }
  
  getData(i: number, header:string)
  {
    if(this.selectedColumns.includes(i))
    { 
      const index = this.selectedColumns.indexOf(i, 0);
      if (index > -1) {
      this.selectedColumns.splice(index, 1);
      }    
     return;
    }
    this.dodajKomandu("Dodata kolona: "+ i);
    this.selectedColumns.push(i);
    console.log(this.selectedColumns);
    this.selectedName = header;
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
    this.http.post("http://localhost:5008/api/Upload/setRatio/"+ratio,ratio,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.dodajKomandu("Dodat ratio: "+ ratio);
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Ratio nije dodat");
    })

  }
  deleteColumns()
  {
    this.http.post("http://localhost:5008/api/Upload/deleteColumns",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Uspesno obrisane kolone");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Kolone nisu obrisane");
    })
  }

  fillWithMean()
  {
    this.http.post("http://localhost:5008/api/Upload/fillWithMean",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Dodate Mean vrednosti");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu dodate");
    })
  }
  fillWithMedian()
  {
    this.http.post("http://localhost:5008/api/Upload/fillWithMedian",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Dodate median vrednosti");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu dodate");
    })
  }
  fillWithMode()
  {
    this.http.post("http://localhost:5008/api/Upload/fillWithMode",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Dodate mode vrednosti");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu dodate");
    })
  }

  replaceEmptyWithNA()
  {
    this.http.post("http://localhost:5008/api/Upload/replaceEmpty",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Zamenjene numericke vrendosti");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu zamenjene");
    })
  }
  replaceZeroWithNA(){

    this.http.post("http://localhost:5008/api/Upload/replaceZero",this.selectedColumns,{responseType: 'text'}).subscribe(
      res => {
        console.log(res);
        this.loadDefaultItemsPerPage();
        this.selectedColumns = [];
        this.dodajKomandu("Zamenjene prazne numericke vrednosti");
    },error=>{
      console.log(error.error);
      this.dodajKomandu("Vrednosti nisu zamenjene");
    })
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
    this.dodajKomandu("Dodat red: "+ i + " na strani: "+ p);
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

    this.http.post("http://localhost:5008/api/Upload/deleteRows",redoviZaBrisanje,{responseType: 'text'}).subscribe(
      res => {
        //console.log(res);
        this.totalItems = (parseInt)(res);
        console.log(this.totalItems);
        this.loadDefaultItemsPerPage();
        this.rowsAndPages = [];
        this.dodajKomandu("Redovi obrisani");
    },error=>{
      //console.log(error.error);
      this.dodajKomandu("Redovi nisu obrisani");
    })
  }

}

