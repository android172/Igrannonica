import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeniService {

  meni:boolean=true

  sendTabs(){
    return [
      {"id": false, "tab": "Početna strana", "style":"color:white", "link":"/pocetna-strana", "novieks": false},
      {"id": false, "tab": "Novi eksperiment", "style":"color:white", "link":"/novi-eksperiment", "novieks": true},
      {"id": false, "tab": "Moji eksperiment", "style":"color:white", "link":"/moji-eksperimenti", "novieks": false},
      {"id": false, "tab": "Kontakt", "style":"color:white", "link":"/kontakt", "novieks": false},
      {"id": false, "tab": "O nama", "style":"color:white;border-right:none", "link":"/o-nama", "novieks": false}
    ]
  }

  constructor() { }
}
