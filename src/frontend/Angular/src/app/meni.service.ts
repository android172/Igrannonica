import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeniService {

  sendTabs(){
    return [
      {"id": false, "tab": "Početna strana", "style":"color:white"},
      {"id": false, "tab": "Novi eksperiment", "style":"color:white"},
      {"id": false, "tab": "Kontakt", "style":"color:white"},
      {"id": false, "tab": "O nama", "style":"color:white; border-right:none"}
    ]
  }

  constructor() { }
}
