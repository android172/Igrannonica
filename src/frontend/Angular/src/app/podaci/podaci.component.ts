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

  dajStatistiku()
  {
    this.http.get("http://localhost:5008/api/Upload/statistika", {responseType: 'text'}).subscribe(
      (response: any) => {
        console.table(response);
        this.jsonStatistika = JSON.parse(response);
        //console.log(this.jsonStatistika);
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
        console.log(niz)
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
    console.log(this.statistikaNum);
    console.log(this.statistikaCat);
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
      this.selectedColumns.forEach((element,index)=>{
        if(element==i) delete this.selectedColumns[index];
     });
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
}

