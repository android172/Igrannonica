import { Component, OnInit } from '@angular/core';
import {ParticlesConfig} from './particles-config';
declare let particlesJS:any

@Component({
  selector: 'app-pocetna-strana',
  templateUrl: './pocetna-strana.component.html',
  styleUrls: ['./pocetna-strana.component.css']
})
export class PocetnaStranaComponent implements OnInit {

  particlesJS:any;

  constructor() { }
  
  ngOnInit(): void {
    this.invokeParticles();
  }

  public invokeParticles():void{
    particlesJS('particles-js', ParticlesConfig, function() {});
  }

}
