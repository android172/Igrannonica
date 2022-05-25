import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';
import { url } from '../app.module';

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

  private componentMethodCallSource = new Subject<any>();
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();
  callComponentMethod(id:number) {
    this.componentMethodCallSource.next(id);
  }

  private componentMethodLossCallSource = new Subject<any>();
  componentMethodLossCalled$ = this.componentMethodLossCallSource.asObservable();
  callComponentMethodLoss(weights: [][][]) {
    this.componentMethodLossCallSource.next(weights);
  }

  public startConnection(token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl(url+'/hub').build();
    this.hubConnection.start().then(
      ()=> {
        // console.log('povezan')
        //this.LossListener()
      }).then(()=>this.getConnectionId(token)).catch(()=>console.log("Doslo do greske"));
  }
  public getConnectionId(token:string) {
    this.hubConnection.invoke('getconnectionid', token).then(
      (data) => {
        // console.log(data);
          this.connectionId = data;
        }
    ); 
  }

  public models: Array<number> = []
  public StartModelTrainingListener() {
    this.hubConnection.on('StartModelTraining', (modelId) => {
      this.models.push(modelId)
    })
  }

  public LossListener()
  {
    this.hubConnection.on('Loss', (data) => {
      var res = JSON.parse(data)
      
      this.callComponentMethodLoss(res);

      // this.data.push(data);
      // this.lineChartData.datasets[0].data.push(currentLoss);
      // this.lineChartData.labels?.push(currentEpoch);
    })
  }

  public FinishModelTrainingListener() {
    this.hubConnection.on('FinishModelTraining', (modelId) => {
      console.log("Zavrsio.");
      this.callComponentMethod(modelId);
    })
  }

  public lineChartData: ChartConfiguration['data'] = {
    // labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Loss function',
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
  
    public clearChartData()
    {
      this.lineChartData.datasets[0].data = [];
      this.lineChartData.labels = [];
    }
}

