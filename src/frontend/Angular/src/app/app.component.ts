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
  footer:boolean = true;

  public prikaziMeni_1:any
  constructor(private prikaziMeni: MeniService, private router:Router) {
    this.prikaziMeni_1 = this.prikaziMeni.sendTabs()
  }

  ngOnInit(): void {
  }

  // ngDoCheck(): void
  // {
  //   if(this.router.url=="/prijava" || this.router.url=="/registracija" || ((this.router.url).indexOf("eksperiment") != -1 && this.router.url != "/novi-eksperiment" && this.router.url != "/moji-eksperimenti"))
  //   {
  //     this.header = false;
  //     if((this.router.url).indexOf("eksperiment") != -1)
  //     {
  //       this.header2 = true;
  //     }
  //     else
  //     {
  //       this.header2 = false;
  //     }
  //   }
  //   else
  //   {
  //     this.header = true;
  //     this.header2 = false;
  //   }
  // }

  ngDoCheck(): void
  {
    this.header2 = false;
    if(this.router.url=="/prijava" || this.router.url=="/registracija")
    {
      this.header = false;
      this.footer = true;
      document.body.style.backgroundImage = "url('/assets/wallpaper.jpg')";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundSize = "cover";
      (<HTMLDivElement>document.getElementById("sadrzaj")).style.paddingBottom = "2.5rem";
    }
    else if(this.router.url == "/pocetna-strana")
    {
      this.header = true;
      this.footer = true;
      document.body.style.background = 'linear-gradient(#03001b,#1e012c)';
      (<HTMLDivElement>document.getElementById("sadrzaj")).style.paddingBottom = "0rem";
    }
    else
    {
      this.header = true;
      this.footer = true;
      document.body.style.background = "url('/assets/wallpaper.jpg')";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundSize = "cover";
      (<HTMLDivElement>document.getElementById("sadrzaj")).style.paddingBottom = "2.5rem";
    }

  }

}

