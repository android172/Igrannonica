import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  constructor() { }
  
  public labels: number[] = [];
  //public dataSet: number[] = []
  public data:Array<{value:string}> = [];
  public connectionId:any
  public switch: boolean = false;
  public switchChange: Subject<boolean> = new Subject<boolean>();
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
      var pom = data.split(":");
      console.log(pom);
      this.lineChartData.labels?.push(pom[0]);
      this.lineChartData.datasets[0].data.push(pom[1]);
      console.log(this.lineChartData.datasets[0].data);
      this.switch = !this.switch;
      this.switchChange.next(this.switch);
    })
  }

  public lineChartData: ChartConfiguration['data'] = {
    // labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Loss funkcija',
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: '#F45E82',
        pointBackgroundColor: '#fb9ab0',
        pointBorderColor: '#fb9ab0',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#F45E82',
        fill: {
                target: 'origin',
                above: '#9f707b32'
        },
      }]
    }
}

