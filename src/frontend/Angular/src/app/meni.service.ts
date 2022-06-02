import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeniService {

  meni:boolean=true

  sendTabs(){
    return [
      {"id": false, "tab": "Home", "style":"color:white", "link":"/pocetna-strana"},
      {"id": false, "tab": "Experiments", "style":"color:white", "link":"/eksperimenti"},
      // {"id": true, "tab": "My experiments", "style":"color:white", "link":"/moji-eksperimenti"},
      {"id": false, "tab": "Contact", "style":"color:white", "link":"/kontakt"}
    ]
  }

  constructor() { }
}
