import { Component } from '@angular/core';
import { MeniService } from './meni.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular';

  header:boolean = true;
  header2:boolean = true;

  public prikaziMeni_1:any
  constructor(private prikaziMeni: MeniService, private router:Router) {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs()
  }

  ngOnInit(): void {
  }

  ngDoCheck(): void{
    /*if(this.prikaziMeni.meni == false)
      this.header = false
    else
      this.header = true*/

    if(this.router.url=="/prijava" || this.router.url=="/registracija" || this.router.url=="/eksperiment")
    {
      this.header = false;
      if(this.router.url == "/eksperiment")
      {
        this.header2 = true;
      }
      else
      {
        this.header2 = false;
      }
    }
    else
    {
      this.header = true;
      this.header2 = false;
    }
  }
}

