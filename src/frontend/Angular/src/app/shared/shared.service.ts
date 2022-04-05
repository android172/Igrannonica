import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

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

  private subjectName = new Subject<any>();

  sendUpdate(message: string){
    this.subjectName.next({text:message});
  }

  getUpdate(): Observable<any>{
    return this.subjectName.asObservable();
  }
}

