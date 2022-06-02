import { Component, OnInit } from '@angular/core';
import { MeniService } from '../meni.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public prikaziMeni_1:any
  public nesto: boolean = true;
  constructor(private prikaziMeni: MeniService, public jwtHelper: JwtHelperService, private router:Router) {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs();
    console.log(this.prikaziMeni_1);
  }

  ngDoCheck():void
  {
    if(this.router.url == "/pocetna-strana")
    {
      this.prikaziMeni_1[0].style = "color:#f882f8";
      (<HTMLDivElement>document.getElementById("meni")).style.background = "linear-gradient(180deg, rgba(0, 3, 34, 0.9) 0%, rgba(0, 4, 40, 0.738) 45.15%, rgba(0, 6, 58, 0.475714) 68.71%, rgba(0, 4, 43, 0.227) 85.37%,  rgba(28, 32, 67, 0) 100%) !important";
    }
    else
    {
      this.prikaziMeni_1[0].style = "color:white"
    }

    if(this.router.url == "/eksperimenti")
    {
      this.prikaziMeni_1[1].style = "color:#f882f8"
    }
    else
    {
      this.prikaziMeni_1[1].style = "color:white"
    }

    if(this.router.url == "/kontakt")
    {
      this.prikaziMeni_1[2].style = "color:#f882f8;border-right:none"
    }
    else
    {
      this.prikaziMeni_1[2].style = "color:white;border-right:none"
    }
  }

  ngOnInit(): void {
    //this.prikaziMeni_1[0].style = "color:#F45E82"
    this.nesto=this.jwtHelper.isTokenExpired();
    // this.prikaziMeni_1[2].id=this.jwtHelper.isTokenExpired();
  }

  proba(){
    this.prikaziMeni.meni = false;
  }

  odjava(){
    this.nesto=false;
    localStorage.clear();
    location.reload();
  }

  /*novieks(novieks: boolean)
  {
    if(novieks)
    {
      document.body.style.background = '#4B5B87'
    }
    else
    {
      document.body.style.backgroundImage = "url('/assets/pozadina.jpg')"
      document.body.style.backgroundRepeat = "no-repeat"
      document.body.style.backgroundAttachment = "fixed"
      document.body.style.backgroundSize = "cover"
    }
  }*/
}
