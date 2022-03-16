import { Component, OnInit } from '@angular/core';
import { MeniService } from '../meni.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public prikaziMeni_1:any

  constructor(private prikaziMeni: MeniService, private router:Router) {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs()
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

    if(this.router.url == "/kontakt")
    {
      this.prikaziMeni_1[2].style = "color:#F45E82"
    }
    else
    {
      this.prikaziMeni_1[2].style = "color:white"
    }

    if(this.router.url == "/o-nama")
    {
      this.prikaziMeni_1[3].style = "color:#F45E82;border-right:none"
    }
    else
    {
      this.prikaziMeni_1[3].style = "color:white;border-right:none"
    }
  }

  ngOnInit(): void {
    //this.prikaziMeni_1[0].style = "color:#F45E82"
  }

  proba(){
    this.prikaziMeni.meni = false;
  }

  skloniCrticu(name:any)
  {
    // alert("Alert")
    // if(name == this.prikaziMeni_1[this.prikaziMeni_1.length-1].tab)
    // {
    //   this.prikaziMeni_1[this.prikaziMeni_1.length-1].style = "color:#F45E82; border-right:none"
    // }
    // else
    // {
    //   this.prikaziMeni_1[this.prikaziMeni_1.length-1].style = "color:white; border-right:none"
    // }
  }
}
