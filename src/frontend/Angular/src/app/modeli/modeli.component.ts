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
  json1: any;
  jsonMetrika: any;
  modeli : any[] = [];
  id: any;
  trenId: any;
  date: String ='';
  nizD: any[] = [];
  selektovanModel: string = '';
  ActivateAddEdit: boolean = false;
  messageReceived: any;
  subscriptionName: Subscription = new Subscription;
  izabranId: any;

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
    this.http.post(url+"/api/Model/Modeli?ime=" + ime + "&id=" + this.id,null,{responseType: 'text'}).subscribe(
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
    this.http.get(url+'/api/Model/Modeli/' + this.id).subscribe(
        res=>{
          console.log(res);
          this.json = res;
          this.modeli = Object.values(this.json);
          this.formatirajDatum();
        },
        error=>{
          console.log(error.error);
        }
    );
  }

  formatirajDatum()
  {
    for(let i=0;i<this.modeli.length;i++)
    {
      this.date=this.modeli[i].createdDate.split('T')[0];
      this.nizD=this.date.split('-');
      this.swap(this.nizD);
      this.modeli[i].createdDate=this.nizD.join('.');
    }
  }

  swap(niz: any[])
  {
     var x=niz[2];
     var y=niz[0];
     niz[0]=x;
     niz[2]=y+'.';
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
      this.http.delete(url+'/api/Model/Modeli/' + i,{responseType: 'text'}).subscribe(
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

  dajAnn()
  {
    if(this.json1["annType"]==1)
          (<HTMLDivElement>document.getElementById("ann")).innerHTML="Classification";
        else
          (<HTMLDivElement>document.getElementById("ann")).innerHTML="Regression";
  }

  dajOptimizer()
  {
    if(this.json1["optimizer"]==0)
      (<HTMLDivElement>document.getElementById("opt")).innerHTML="SGD";
    else if(this.json1["optimizer"]==1)
      (<HTMLDivElement>document.getElementById("opt")).innerHTML="AdaGrad";
    else if(this.json1["optimizer"]==2)
      (<HTMLDivElement>document.getElementById("opt")).innerHTML="AdaDelta";
    else
    (<HTMLDivElement>document.getElementById("opt")).innerHTML="Adam";
  }

  dajEpohe()
  {
    (<HTMLDivElement>document.getElementById("eph")).innerHTML=this.json1["numberOfEpochs"];
  }

  prikaziPod(id: any)
  {
    this.http.get(url+"/api/Eksperiment/Podesavanja/"+id).subscribe(
      res=>{
        console.log(res);
        this.json1=res;
        this.dajAnn();
        this.dajOptimizer();
        this.dajEpohe();
      },
      error=>{
        console.log(error);
        this.onError("Neuspesno!");
      }
    )
  }

  uzmiId(id: any){
    this.izabranId=id;
    this.prikaziInfo(id);
  }

  prikaziInfo(id: any)
  {
    for(let i=0;i<this.modeli.length;i++)
    {
      if(this.modeli[i].id==id)
      {
        (<HTMLDivElement>document.getElementById("n")).innerHTML=this.modeli[i].name;
        (<HTMLDivElement>document.getElementById("d")).innerHTML=this.modeli[i].createdDate;
        (<HTMLDivElement>document.getElementById("opis")).innerHTML=this.modeli[i].opis;
        (<HTMLDivElement>document.getElementById("snap")).innerHTML=this.modeli[i].snap;
      }
    }
    
  }

  promeni(event:any){

    if(this.selektovanModel != ""){
      (<HTMLDivElement>document.getElementById(this.selektovanModel)).style.background="#C4C4C4";
      (<HTMLDivElement>document.getElementById(this.selektovanModel)).style.color="white";
      (<HTMLDivElement>document.getElementById(this.selektovanModel)).style.transform="scale(1)";
      this.selektovanModel = event.target.id;
      (<HTMLDivElement>document.getElementById(event.target.id)).style.background="linear-gradient(162.06deg,#fa7795 -16.65%,#f0859e 97.46%)";
      (<HTMLDivElement>document.getElementById(event.target.id)).style.transform="scale(1.04)";
    }
    else{
      this.selektovanModel = event.target.id;
      (<HTMLDivElement>document.getElementById(event.target.id)).style.background="linear-gradient(162.06deg,#fa7795 -16.65%,#f0859e 97.46%)";
      (<HTMLDivElement>document.getElementById(event.target.id)).style.transform="scale(1.04)";
    }

  }

  Izmeni()
  {
    for(let i=0;i<this.modeli.length;i++)
    {
      if(this.modeli[i].id==this.izabranId)
      {
        (<HTMLDivElement>document.getElementById("bodyc")).innerHTML=this.modeli[i].opis;
      }
    }
  }

  izmeniOpis()
  {
    var a = (<HTMLDivElement>document.getElementById("bodyc")).innerHTML;
    for(let i=0;i<this.modeli.length;i++)
    {
      if(this.modeli[i].id==this.izabranId)
      {
        this.http.put(url+"/api/Model/Modeli/Opis?id=" + this.modeli[i].id + "&opis=" + a, {responseType : "text"}).subscribe(
          res=>{
            this.onSuccess("Uspesno!");
          },error=>{
            (<HTMLDivElement>document.getElementById("opis")).innerHTML=a;
            this.ucitajModel();
          }
        );
      }
    }

  }

}

