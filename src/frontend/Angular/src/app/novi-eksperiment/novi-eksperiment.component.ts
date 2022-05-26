import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { url } from '../app.module';
import {NotificationsService} from 'angular2-notifications';

@Component({
  selector: 'app-novi-eksperiment',
  templateUrl: './novi-eksperiment.component.html',
  styleUrls: ['./novi-eksperiment.component.css']
})
export class NoviEksperimentComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router,private service: NotificationsService) {}

  ngOnInit(): void {
  }
  onSuccess(message:any)
  {
    this.service.success('Success',message,{
      position: ["top","left"],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }
  onError(message:any)
  {
    this.service.error('Unsuccessful',message,{
      position: ['top','left'],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }

  onInfo(message:any)
  {
    this.service.info('Info',message,{
      position: ['top','left'],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }

  napraviEksperiment(){
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    if(ime==""){
      (<HTMLInputElement>document.getElementById("greska")).innerHTML="*Polje ne sme biti prazno";
      return;
    }
    this.http.post(url+"/api/Eksperiment/Eksperiment?ime="+ime,null,{responseType: 'text'}).subscribe(
      res=>{
        this.onSuccess("Experiment is successfully created.")
        this.router.navigate(['/eksperiment'],{ queryParams: { id: res } });
      },
      error=>{ 
        if(error.error==="ERROR :: Experiment with this name already exists.")
        {
          console.log("BLA");
          this.onInfo("Experiment with that name already exists.");
          (<HTMLInputElement>document.getElementById("greska")).innerHTML="Experiment with that name already exists."
        }
      }
    );
  }
  handleKeyUp(event: any){
    if(event.keyCode === 13){
       this.napraviEksperiment();
    }
  }
}