import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  message: any; // string?

  constructor() { }

  setMessage(data : any){

    this.message = data;
  }

  getMessage(){
    return this.message;
  }
}

