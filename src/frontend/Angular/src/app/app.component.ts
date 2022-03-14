import { Component } from '@angular/core';
import { MeniService } from './meni.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular';

  header:boolean = true;

  public prikaziMeni_1:any
  constructor(private prikaziMeni: MeniService) {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs()
  }

  ngOnInit(): void {
  }

  ngDoCheck(): void{
    if(this.prikaziMeni.meni == false)
      this.header = false
    else
      this.header = true
  }
}

