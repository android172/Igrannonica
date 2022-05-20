import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeniService {

  meni:boolean=true

  sendTabs(){
    return [
      {"id": false, "tab": "Home", "style":"color:white", "link":"/pocetna-strana"},
      {"id": false, "tab": "New experiment", "style":"color:white", "link":"/novi-eksperiment"},
      {"id": false, "tab": "My experiments", "style":"color:white", "link":"/moji-eksperimenti"},
      {"id": false, "tab": "Contact", "style":"color:white", "link":"/kontakt"},
      {"id": false, "tab": "About us", "style":"color:white;border-right:none", "link":"/o-nama"}
    ]
  }

  constructor() { }
}
