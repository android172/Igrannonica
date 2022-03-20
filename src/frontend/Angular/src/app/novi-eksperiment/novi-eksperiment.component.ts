import { Component, OnInit } from '@angular/core';
import { NgxCsvParser } from 'ngx-csv-parser';
import { ViewChild } from '@angular/core';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-novi-eksperiment',
  templateUrl: './novi-eksperiment.component.html',
  styleUrls: ['./novi-eksperiment.component.css']
})
export class NoviEksperimentComponent implements OnInit {

  ngOnInit(): void {
    /*this.getJson()*/
  }

  fileName = '';
  json: any;

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
        console.log(response);
        this.json = response;
      });
    }
  }

  /*getJson(){
    this.http.get<any>('/assets/titanic.json').subscribe(    //proba
      response => {
        console.log(response);
        this.json = response;
      }
    );
  }*/

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
