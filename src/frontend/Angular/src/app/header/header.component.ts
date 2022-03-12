import { Component, OnInit } from '@angular/core';
import { MeniService } from '../meni.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public prikaziMeni_1:any
  constructor(private prikaziMeni: MeniService) {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs()
  }

  ngOnInit(): void {
    this.prikaziMeni_1[0].style = "color:#F45E82"
  }

  proba(){
  }

  promeniBoju(name:any)
  {
    for(let i=0; i<this.prikaziMeni_1.length; i++)
    {
      if(name == this.prikaziMeni_1[i].tab)
      {
        this.prikaziMeni_1[i].style = "color:#F45E82"
      }
      else
      {
        this.prikaziMeni_1[i].style = "color:white"
      }
    }
  }
}
