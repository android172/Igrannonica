import { Component, OnInit, ViewChild } from '@angular/core';
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

  form:any; 
  formDataTest:any; 

  // moji eksp. 
  eksperimenti : any[] = [];
  json: any;
  id: any;
  izabranId: number = -1;
  provera: boolean = false;

  // podaci 
  fileName = '';
  fileNameTest = ''; 

  //templates
  firstStep:boolean=true; 
  secondStep:boolean=false;
  thirdStep:boolean=false; 
  goToExperiment:boolean=false;

  experimentName:string="";

  constructor(private http: HttpClient, private router:Router,private service: NotificationsService) {}

  ngOnInit(): void {
    this.ucitajEksp();

    sessionStorage.removeItem('idSnapshota');
    sessionStorage.removeItem('idS');
    sessionStorage.removeItem('models');
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
    if(this.experimentName ==""){
      return;
    }
    // constraints
    if(this.form == null)
    {
      this.onInfo("You have not added dataset.");
      return;
    }
    this.http.post(url+"/api/Eksperiment/Eksperiment?ime="+this.experimentName,null,{responseType: 'text'}).subscribe(
      res=>{
        (<HTMLDivElement>document.getElementById("nemaEks")).innerHTML = "";
        var idEksperimenta = res;

        this.http.post(url+"/api/File/upload/" + res , this.form, {responseType: 'text'}).subscribe(
          res=>{
            // ucitavanje session tokena 
            sessionStorage.setItem('idSnapshota',"Default snapshot");
            sessionStorage.setItem('idS',"0");

            if(this.fileNameTest != '')
            {
              this.http.post(url+"/api/Upload/uploadTest/" + idEksperimenta, this.formDataTest, {responseType: 'text'}).subscribe(
                res=>{
                  const defaultTest = "Default snapshot (Test)";
                  this.http.post(url+"/api/File/SaveAsSnapshot?idEksperimenta="+idEksperimenta+"&naziv="+defaultTest,null,{responseType:"text"}).subscribe(
                    res=>{
                      if(res!="-1") {
                        sessionStorage.setItem('idSnapshota',defaultTest);
                        sessionStorage.setItem('idS',res);
                        this.router.navigate(['/eksperiment'],{ queryParams: { id: idEksperimenta } });
                      }
                    },
                    err=>{}
                  );
                },
                error =>{
                  console.log(error.error);	
                }
              );
            }
            else
            {
              this.router.navigate(['/eksperiment'],{ queryParams: { id: idEksperimenta } });
            }
           
        },error =>{
          console.log(error.error);
          this.onError(error.error);
          // brisanje eksperimenta ako je doslo do greske
          this.http.delete(url+'/api/Eksperiment/Eksperiment/' + res,{responseType: 'text'}).subscribe(
            res=>{
              this.ucitajEksp();
              var div = (<HTMLDivElement>document.getElementById("e")).style.visibility="hidden";
              this.onSuccess("Experiment is successfully deleted.");
            },
            error=>{
              console.log(error.error);
              this.onError("Experiment was not deleted.");
          }
          );
      
          if(error.error === "Unet nedozvoljen tip fajla."){
            console.log("Nedozvoljeno");
          }
        });
      },
      error=>{ 
        if(error.error==="ERROR :: Experiment with this name already exists.")
        {
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

  // moji eksperimenti 

  ucitajEksp()
  {
  
    this.http.get(url+'/api/Eksperiment/Eksperimenti').subscribe(
        res=>{
           console.log(res);
          if(res != 0)
          {
            this.json = res;
            this.eksperimenti = Object.values(this.json)
            this.provera = true;      
          }
          else
          {
            this.provera = false; 
            (<HTMLDivElement>document.getElementById("nemaEks")).innerHTML = "You haven't created any experiments yet!";
          }
        }
    );
  }

  otvoriEksperiment(i: any)
  {
    this.http.post(url+'/api/Eksperiment/load?id=' + i, null, {responseType: 'text'}).subscribe(
      res=>{
        this.router.navigate(['/eksperiment'],{ queryParams: { id: i } });
      },
      err=>{}
    );
    
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
            this.onSuccess("Experiment is successfully deleted.");
          },
          error=>{
            console.log(error.error);
            this.onError("Experiment was not deleted.");
        }
        
        )
    }
  }
}

  uzmiId(id: number)
  {
    this.izabranId=id;
  }

  // PODACI

  onFileSelected(event:any) 
  {
    const file:File = event.target.files[0];

    if (file) 
    {
      (<HTMLDivElement>document.getElementById("greskaDataset")).innerHTML = "";
      this.fileName = file.name;

      const formData = new FormData();
      formData.append("file", file, this.fileName); 
      this.form = formData;

      // (<HTMLDivElement>document.getElementById("poruka")).className="visible-y";  
      // (<HTMLDivElement>document.getElementById("porukaGreske")).className="nonvisible-n";  
      this.onSuccess('Dataset is loaded');
    }
  }

  onFileSelectedTest(event:any){
    const filetest:File = event.target.files[0];

    if(filetest)
    {
      this.fileNameTest = filetest.name;

      const formData = new FormData();
      formData.append("file", filetest, this.fileNameTest);  
      this.formDataTest = formData;
      this.onSuccess('Test Dataset is loaded.');
    }

  }

  predji()
  {
    this.napraviEksperiment(); 
  }

  nextStep1()
  {
    this.firstStep = false;
    this.secondStep = true;
    (<HTMLDivElement>document.getElementById("circle1")).style.boxShadow = "0 0 10px 2px rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle1")).style.color = "#4e0d7e";
    (<HTMLDivElement>document.getElementById("circle1")).style.backgroundColor = "rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("border1")).classList.add("active");
    (<HTMLDivElement>document.getElementById("circle1")).classList.remove("current");
    (<HTMLDivElement>document.getElementById("circle2")).classList.add("current");

  }
  nextStep2()
  {
    if(this.form == null)
    {
      (<HTMLDivElement>document.getElementById("greskaDataset")).innerHTML = "*You have not loaded dataset!";
      return;
    }
    this.secondStep = false;
    this.thirdStep = true;
    (<HTMLDivElement>document.getElementById("circle2")).style.color = "#4e0d7e";
    (<HTMLDivElement>document.getElementById("circle2")).style.boxShadow = "0 0 10px 2px rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle2")).style.backgroundColor = "rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("border2")).classList.add("active");
    (<HTMLDivElement>document.getElementById("circle2")).classList.remove("current");
    (<HTMLDivElement>document.getElementById("circle3")).classList.add("current");
  }
  nextStep3()
  {
    this.thirdStep = false;
    this.goToExperiment = true;
    (<HTMLDivElement>document.getElementById("circle3")).style.color = "#4e0d7e";
    (<HTMLDivElement>document.getElementById("circle3")).style.boxShadow = "0 0 10px 2px rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle3")).style.backgroundColor = "rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle3")).classList.remove("current");
  }
  backStep2()
  {
    this.firstStep = true;
    this.secondStep = false;
    // (<HTMLInputElement>document.getElementById("ime")).innerHTML = this.experimentName;
    (<HTMLDivElement>document.getElementById("circle1")).style.boxShadow = "0 0 2px 1px rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle1")).style.color = "rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle1")).style.backgroundColor = "rgb(61, 61, 96)";
    (<HTMLDivElement>document.getElementById("border1")).classList.remove("active");
    (<HTMLDivElement>document.getElementById("circle1")).style.zIndex = "10";
    (<HTMLDivElement>document.getElementById("circle1")).classList.add("current");
    (<HTMLDivElement>document.getElementById("circle2")).classList.remove("current");
  }
  backStep3()
  {
    this.thirdStep = false;
    this.secondStep = true;
    (<HTMLDivElement>document.getElementById("circle2")).style.boxShadow = "0 0 2px 1px rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle2")).style.color = "rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle2")).style.backgroundColor = "rgb(61, 61, 96)";
    (<HTMLDivElement>document.getElementById("border2")).classList.remove("active");
    (<HTMLDivElement>document.getElementById("circle2")).style.zIndex = "10";
    (<HTMLDivElement>document.getElementById("circle2")).classList.add("current");
    (<HTMLDivElement>document.getElementById("circle3")).classList.remove("current");
  }
  backStepGoToE()
  {
    this.goToExperiment = false;
    this.thirdStep = true;
    (<HTMLDivElement>document.getElementById("circle3")).style.boxShadow = "0 0 2px 1px rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle3")).style.color = "rgb(227, 140, 154)";
    (<HTMLDivElement>document.getElementById("circle3")).style.backgroundColor = "rgb(61, 61, 96)";
    (<HTMLDivElement>document.getElementById("circle3")).style.zIndex = "10";
    (<HTMLDivElement>document.getElementById("circle3")).classList.add("current");
  }

  proveriNazivEksperimenta()
  {
    var ime = (<HTMLInputElement>document.getElementById("ime")).value;
  
    if(this.experimentName != "" && this.experimentName == ime)
    {
      this.nextStep1();
      return;
    }
    //var ime = (<HTMLInputElement>document.getElementById("ime")).value;
    if(ime==""){
      (<HTMLInputElement>document.getElementById("greska")).innerHTML="*Input cannot be empty!";
      return;
    }

    this.http.post(url+"/api/Eksperiment/Eksperiment/" + ime, null, {responseType: 'text'}).subscribe(
      res=>{
        if(res == "0")
        {
          this.experimentName = ime;
          (<HTMLInputElement>document.getElementById("greska")).innerHTML="";
          //this.onInfo("novoo");
          // (<HTMLInputElement>document.getElementById("ime")).setAttribute("readonly","true");
          this.nextStep1();
        }
        else
        (<HTMLInputElement>document.getElementById("greska")).innerHTML="*Experiment with given name already exists."; 
       
    },error =>{
      console.log(error.error);
    });

    
  }

  otvoriPolje()
  {
    (<HTMLDivElement>document.getElementById("noviEksperiment")).classList.toggle("otvori");
    (<HTMLDivElement>document.getElementById("noviEksp")).classList.toggle("openn");
  }
  


}