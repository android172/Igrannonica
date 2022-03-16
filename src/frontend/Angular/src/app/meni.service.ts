import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeniService {

  meni:boolean=true

  sendTabs(){
    return [
      {"id": true, "tab": "Početna strana", "style":"color:white", "link":"/pocetna-strana"},
      {"id": true, "tab": "Novi eksperiment", "style":"color:white", "link":"/novi-eksperiment"},
      {"id": true, "tab": "Moji eksperiment", "style":"color:white", "link":"/moji-eksperimenti"},
      {"id": true, "tab": "Kontakt", "style":"color:white", "link":"/kontakt"},
      {"id": true, "tab": "O nama", "style":"color:white;border-right:none", "link":"/o-nama"}
    ]
  }

  constructor() { }
}
