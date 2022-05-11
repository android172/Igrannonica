import { Component, OnInit } from '@angular/core';
import {ParticlesConfig} from './particles-config';
import { MeniService } from '../meni.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
declare let particlesJS:any

@Component({
  selector: 'app-pocetna-strana',
  templateUrl: './pocetna-strana.component.html',
  styleUrls: ['./pocetna-strana.component.css']
})
export class PocetnaStranaComponent implements OnInit {

  particlesJS:any;
  public prikaziMeni_1:any
  public nesto: boolean = true;
  constructor(private prikaziMeni: MeniService, public jwtHelper: JwtHelperService, private router:Router)
  {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs();
  }
  
  public ngOnInit(): void {
    this.invokeParticles();
    this.nesto=this.jwtHelper.isTokenExpired();
    this.prikaziMeni_1[2].id=this.jwtHelper.isTokenExpired();
  }

  public invokeParticles():void{
    particlesJS('particles-js', ParticlesConfig, function() {});
  }

  ngDoCheck():void
  {
    if(this.router.url == "/pocetna-strana")
    {
      this.prikaziMeni_1[0].style = "color:#F45E82"
    }
    else
    {
      this.prikaziMeni_1[0].style = "color:white"
    }

    if(this.router.url == "/novi-eksperiment")
    {
      this.prikaziMeni_1[1].style = "color:#F45E82"
    }
    else
    {
      this.prikaziMeni_1[1].style = "color:white"
    }

    if(this.router.url == "/moji-eksperimenti")
    {
      this.prikaziMeni_1[2].style = "color:#F45E82"
    }
    else
    {
      this.prikaziMeni_1[2].style = "color:white"
    }

    if(this.router.url == "/kontakt")
    {
      this.prikaziMeni_1[3].style = "color:#F45E82"
    }
    else
    {
      this.prikaziMeni_1[3].style = "color:white"
    }

    if(this.router.url == "/o-nama")
    {
      this.prikaziMeni_1[4].style = "color:#F45E82;border-right:none"
    }
    else
    {
      this.prikaziMeni_1[4].style = "color:white;border-right:none"
    }
  }

}

