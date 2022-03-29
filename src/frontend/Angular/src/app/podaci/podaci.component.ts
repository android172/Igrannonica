import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-podaci',
  templateUrl: './podaci.component.html',
  styleUrls: ['./podaci.component.css']
})
export class PodaciComponent implements OnInit {

  constructor(private http: HttpClient, private shared: SharedService) { }

  ngOnInit(): void {
  }

  fileName = '';
  json: any;
  page: number = 1;
  itemsPerPage: any;
  //totalItems : any;
  totalItems: number = 0; 

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

      const upload$ = this.http.post("http://localhost:5008/api/Upload/upload", formData, {responseType: 'text'}).subscribe(
        res=>{
          this.loadDefaultItemsPerPage();
          (<HTMLDivElement>document.getElementById("porukaGreske")).innerHTML = "Uspesno ucitano";
          (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "visible";
          (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "visible";
      },error =>{
        console.log(error.error);	
        var div = (<HTMLDivElement>document.getElementById("porukaGreske")).innerHTML = "Greška prilikom učitavanja podataka!";
        (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).style.visibility = "hidden";
        (<HTMLDivElement>document.getElementById("brojRedovaTabelePoruka")).style.visibility = "hidden";
      });
    }
  }

  loadDefaultItemsPerPage()
  {      
    this.http.get("http://localhost:5008/api/Upload/paging/1/10").subscribe(
       (response: any) => {
         //console.log(response);
        console.log(JSON.parse(response.data));
        this.json =  JSON.parse(response.data);
         //this.json = response;
        this.totalItems = response.totalItems;
    })
  }

  promeniBrojRedova(value: any)
  {
    this.itemsPerPage = parseInt(value);
    this.http.get("http://localhost:5008/api/Upload/paging/"+this.page+"/" + this.itemsPerPage).subscribe(
      (response: any) => {
        this.json =  JSON.parse(response.data);
        this.totalItems = response.totalItems;
    })
  }

  gty(page: any){
   console.log("---GTY--");
   this.itemsPerPage = (<HTMLSelectElement>document.getElementById("brojRedovaTabele")).value;
   console.log(this.itemsPerPage);
   this.http.get("http://localhost:5008/api/Upload/paging/" + this.page + "/" + this.itemsPerPage).subscribe(
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
    for(let i=0; i<headers.length; i++)
    {
      this.kolone[i] = headers[i];
    }
    this.message = headers;
    this.shared.setMessage(this.message);
    //console.log(this.message);
    //console.log(Object.values(this.json[0]));
    return headers;
  }

  dajRed(i: number)
  {
    var redValues = Object.values(this.json[i]);
    return redValues;
  }
}
