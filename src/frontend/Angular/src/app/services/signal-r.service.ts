import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  constructor() { }
  
  public data:Array<{value:string}> = [];
  public connectionId:any
  private hubConnection!: signalR.HubConnection; 

  public startConnection(token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl('http://localhost:5008/hub').build();
    this.hubConnection.start().then(
      ()=> {
        console.log('povezan')
        //this.LossListener()
      }).then(()=>this.getConnectionId(token)).catch(()=>console.log("Doslo do greske"));
  }
  public getConnectionId(token:string) {
    this.hubConnection.invoke('getconnectionid', token).then(
      (data) => {
        console.log(data);
          this.connectionId = data;
        }
    ); 
  }
  public ZapocniTreniranje(token:any,id:any){
      this.hubConnection.invoke('treniraj',token,id)
      .catch(err => console.error(err));
    }
  public ZaustaviTreniranje(){
    this.hubConnection.invoke('zaustavitreniranje')
      .catch(err => console.error(err));
  }
  public TrenirajListener(){
    this.hubConnection.on('treniranje', (data) => {
      if(data=="Treniranje zavrseno")
        alert("JEEEJ!");
      else console.log(data);
    })
  }
  public LossListener()
  {
    this.hubConnection.on('loss', (data) => {
      this.data.push(data);
      // console.log(data);
    })
  }
}

