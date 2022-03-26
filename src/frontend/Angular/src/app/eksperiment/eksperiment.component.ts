import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-eksperiment',
  templateUrl: './eksperiment.component.html',
  styleUrls: ['./eksperiment.component.css']
})
export class EksperimentComponent implements OnInit {

  podaci: boolean = true;
  model: boolean = false;
  modeli: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  boolPodaciPromena()
  {
    this.podaci = true;
    this.model = false;
    this.modeli = false;
  }

  boolModelPromena()
  {
    this.podaci = false;
    this.model = true;
    this.modeli = false;
  }

  boolModeliPromena()
  {
    this.podaci = false;
    this.model = false;
    this.modeli = true;
  }
}
