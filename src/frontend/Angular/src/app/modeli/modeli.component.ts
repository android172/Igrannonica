import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { Subscription } from 'rxjs';
import { url } from '../app.module';
import {NotificationsService} from 'angular2-notifications';

@Component({
  selector: 'app-modeli',
  templateUrl: './modeli.component.html',
  styleUrls: ['./modeli.component.css']
})

export class ModeliComponent implements OnInit {
  @Output() PosaljiModel = new EventEmitter<number>();
  json: any;
  modeli : any[] = [];
  id: any;
  ActivateAddEdit: boolean = false;
  messageReceived: any;
  subscriptionName: Subscription = new Subscription;

  constructor(public http: HttpClient,private activatedRoute: ActivatedRoute, private shared:SharedService,private service: NotificationsService) { 
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.id = params['id'];
        console.log(this.id);
      }
    )
  }

  ngOnInit(): void {
    this.ucitajImeE();
    this.subscriptionName = this.shared.getUpdate().subscribe
    (
      message => {
        this.ActivateAddEdit = false;
        this.messageReceived = message;
        console.log(this.messageReceived);
       // this.ocisti();
        this.ngOnInit();
      }
    )
  }
  onSuccess(message:any)
  {
    this.service.success('Uspešno',message,{
      position: ["top","left"],
      timeOut: 2000,
      animate:'fade',
      showProgressBar:true
    });
  }
  onError(message:any)
  {
    this.service.error('Neuspešno',message,{
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

  ucitaj(){
    this.ucitajImeE();
  }

  send(id:number){
    this.PosaljiModel.emit(id);
  }

  ocisti(){
    (<HTMLInputElement>document.getElementById("imeM")).value='';
  }

  napraviModel(){
    console.log(this.id);
    var ime = (<HTMLInputElement>document.getElementById("imeM")).value;
    var div = (<HTMLDivElement>document.getElementById("greska")).innerHTML;
    if(ime === ""){
      ime = (<HTMLInputElement>document.getElementById("greska")).innerHTML="*Polje ne sme biti prazno";
      return;
    }
    if(div === "*Model sa tim nazivom vec postoji"){
      div = (<HTMLDivElement>document.getElementById("greska")).innerHTML = "";
    }
    this.http.post(url+"/api/Eksperiment/Modeli?ime=" + ime + "&id=" + this.id,null,{responseType: 'text'}).subscribe(
      res=>{
        console.log(res);
        this.ucitajModel();
        ime = (<HTMLInputElement>document.getElementById("greska")).innerHTML="";
        this.onSuccess("Model je uspesno napravljen");
      },
      error=>{
        console.log(error.error);
        this.onError("Model nije napravljen!");
        if(error.error === "Vec postoji model sa tim imenom")
        {
           var div1 = (<HTMLDivElement>document.getElementById("greska")).innerHTML = "*Model sa tim nazivom vec postoji";
           this.onError("Model sa tim nazivom vec postoji");
        }
      }
    );
  }

  ucitajModel()
  {
    this.ActivateAddEdit=true;
    this.http.get(url+'/api/Eksperiment/Modeli/' + this.id).subscribe(
        res=>{
          console.log(res);
          this.json = res;
          this.modeli = Object.values(this.json);
        },
        error=>{
          console.log(error.error);
        }
    );
  }

  ucitajImeE(){
    this.http.get(url+'/api/Eksperiment/Eksperiment/Naziv/' + this.id,{responseType: 'text'}).subscribe(
        res=>{
          var div = (<HTMLDivElement>document.getElementById("imeE")).innerHTML = res;
          this.ucitajModel();
        },
        error=>{
          console.log(error.error);
        }
    );
  }

  obrisiModel(i:any)
  {
    if(confirm("Da li ste sigurni da zelite da obrisete ovaj model?"))
    {
      this.http.delete(url+'/api/Eksperiment/Modeli/' + i,{responseType: 'text'}).subscribe(
       res=>{
         console.log(res);
            this.ucitajModel();
            var div = (<HTMLDivElement>document.getElementById("m")).style.visibility="hidden";
            this.onSuccess("Model je uspesno obrisan");
       },
       error=>{
         console.log(error.error);
         this.onError("Model nije obrisan!");
       }
     )
    }
  }

  handleKeyUp(event: any){
     if(event.keyCode === 13){
      this.napraviModel();
      this.ocisti();
     }
  }

}

