import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeniService {

  meni:boolean=true

  sendTabs(){
    return [
      {"id": false, "tab": "Početna strana", "style":"color:white", "link":"/pocetna-strana"},
      {"id": false, "tab": "Novi eksperiment", "style":"color:white", "link":"/novi-eksperiment"},
      {"id": false, "tab": "Kontakt", "style":"color:white", "link":"/kontakt"},
      {"id": false, "tab": "O nama", "style":"color:white; border-right:none", "link":"/o-nama"}
    ]
  }

  constructor() { }
}
