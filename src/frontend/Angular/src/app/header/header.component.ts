import { Component, OnInit } from '@angular/core';
import { MeniService } from '../meni.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public prikaziMeni_1:any
  public nesto: boolean = true;
  constructor(private prikaziMeni: MeniService, public jwtHelper: JwtHelperService) {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs()
  }

  ngOnInit(): void {
    this.prikaziMeni_1[0].style = "color:#F45E82"
    this.nesto=this.jwtHelper.isTokenExpired();
  }

  proba(){
    this.prikaziMeni.meni = false;
  }

  promeniBoju(name:any)
  {
    for(let i=0; i<this.prikaziMeni_1.length; i++)
    {
      if(name == this.prikaziMeni_1[i].tab)
      {
        if(i==this.prikaziMeni_1.length-1)
          this.prikaziMeni_1[i].style = "color:#F45E82; border-right:none"
        else
          this.prikaziMeni_1[i].style = "color:#F45E82"
      }
      else
      {
        if(i==this.prikaziMeni_1.length-1)
          this.prikaziMeni_1[i].style = "color:white; border-right:none"
        else
          this.prikaziMeni_1[i].style = "color:white"
      }
    }
  }
}
