import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { url } from '../app.module';

@Component({
  selector: 'app-novi-eksperiment',
  templateUrl: './novi-eksperiment.component.html',
  styleUrls: ['./novi-eksperiment.component.css']
})
export class NoviEksperimentComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router) {}

  ngOnInit(): void {
  }

  napraviEksperiment(){
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    if(ime==""){
      (<HTMLInputElement>document.getElementById("greska")).innerHTML="Polje ne sme biti prazno";
      return;
    }
    this.http.post(url+"/api/Eksperiment/Eksperiment?ime="+ime,null,{responseType: 'text'}).subscribe(
      res=>{
        this.router.navigate(['/eksperiment'],{ queryParams: { id: res } });
      },
      error=>{
        (<HTMLInputElement>document.getElementById("greska")).innerHTML=error.error;
        
        alert(error.error); 
      }
    );
  }
  handleKeyUp(event: any){
    if(event.keyCode === 13){
       this.napraviEksperiment();
    }
  }
}