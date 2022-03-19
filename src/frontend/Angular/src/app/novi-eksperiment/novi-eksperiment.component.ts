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
  }

  fileName = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event:any) 
  {
    const file:File = event.target.files[0];

    if (file) 
    {
      this.fileName = file.name;

      const formData = new FormData();
      formData.append("file", file, this.fileName);

      const upload$ = this.http.post("http://localhost:5008/api/Upload/upload", formData);
      upload$.subscribe();
    }
  }
}
