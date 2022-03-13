import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeniService {

  sendTabs(){
    return [
      {"id": false, "tab": "Početna strana", "style":"color:white", "link":"/pocetnastrana"},
      {"id": false, "tab": "Novi eksperiment", "style":"color:white", "link":"/novi-eksperiment"},
      {"id": false, "tab": "Kontakt", "style":"color:white", "link":"/kontakt"},
      {"id": false, "tab": "O nama", "style":"color:white; border-right:none", "link":"/o-nama"}
    ]
  }

  constructor() { }
}
