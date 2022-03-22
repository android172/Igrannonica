import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-novi-eksperiment',
  templateUrl: './novi-eksperiment.component.html',
  styleUrls: ['./novi-eksperiment.component.css']
})
export class NoviEksperimentComponent implements OnInit {

  ngOnInit(): void {
  }

  fileName = '';
  json: any;
  page: number = 1;
  itemsPerPage: any;
  totalItems : any; 

  constructor(private http: HttpClient) {}

  onFileSelected(event:any) 
  {
    const file:File = event.target.files[0];

    if (file) 
    {
      this.fileName = file.name;

      const formData = new FormData();
      formData.append("file", file, this.fileName);

      const upload$ = this.http.post("http://localhost:5008/api/Upload/upload", formData).subscribe(
        response => {
          this.loadDefaultItemsPerPage();
      },error =>{
        console.log(error.error);
        var div = (<HTMLDivElement>document.getElementById("porukaGreske")).innerHTML = "Greška prilikom učitavanja podataka!";
      });
    }
  }

  loadDefaultItemsPerPage()
  {      
    this.http.get("http://localhost:5008/api/Upload/upload?page=${1}&size=${15}").subscribe(
      (response: any) => {
        console.log(response.data);
        this.json =  response.data;
        this.totalItems = response.totalItems;
    })
  }

  dajHeadere(): string[]
  {
    var headers = Object.keys(this.json[0]);
    //console.log(Object.values(this.json[0]));
    return headers;
  }

  dajRed(i: number)
  {
    var redValues = Object.values(this.json[i]);
    return redValues;
  }
}
