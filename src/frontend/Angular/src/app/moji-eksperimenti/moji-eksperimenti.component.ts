import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { url } from '../app.module';
import {NotificationsService} from 'angular2-notifications';

@Component({
  selector: 'app-moji-eksperimenti',
  templateUrl: './moji-eksperimenti.component.html',
  styleUrls: ['./moji-eksperimenti.component.css']
})
export class MojiEksperimentiComponent implements OnInit {

  eksperimenti : any[] = [];
  json: any;
  id: any;
  izabranId: number = -1;
  constructor(private http: HttpClient,public router: Router,private service: NotificationsService) { }

  ngOnInit(): void {
    this.ucitajEksp();

    sessionStorage.removeItem('idSnapshota');
    sessionStorage.removeItem('idS');

  }

  ucitajEksp()
  {
  
    this.http.get(url+'/api/Eksperiment/Eksperimenti').subscribe(
        res=>{
          // console.log(res);
          this.json = res;
          this.eksperimenti = Object.values(this.json);
        }
    );
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

  otvoriEksperiment(i: any)
  {
    this.http.post(url+'/api/Eksperiment/load?id=' + i, null, {responseType: 'text'}).subscribe(
      res=>{},
      err=>{}
    );
    this.router.navigate(['/eksperiment'],{ queryParams: { id: i } });
  }

  obrisiE()
  {
    
    for(let i=0;i<this.eksperimenti.length;i++)
    {
      if(this.eksperimenti[i].id==this.izabranId)
      {
        this.http.delete(url+'/api/Eksperiment/Eksperiment/' + this.eksperimenti[i].id,{responseType: 'text'}).subscribe(
          res=>{
            // console.log(res);
            this.ucitajEksp();
            var div = (<HTMLDivElement>document.getElementById("e")).style.visibility="hidden";
            this.onSuccess("Eksperiment je uspesno obrisan");
          },
          error=>{
            console.log(error.error);
            this.onError("Eksperiment nije obrisan!");
        }
        
        )
    }
  }
}

  uzmiId(id: number)
  {
    this.izabranId=id;
  }
}
