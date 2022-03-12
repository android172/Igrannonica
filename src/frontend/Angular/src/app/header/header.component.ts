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
  }

  proba(){
  }
  

}
