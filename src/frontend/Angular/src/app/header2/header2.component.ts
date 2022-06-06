import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.css']
})
export class Header2Component implements OnInit {

  public nesto: boolean = true;

  constructor(public jwtHelper: JwtHelperService, private router:Router) { 

  }

  proba()
  {
    
  }

  ngOnInit(): void {
    this.nesto=this.jwtHelper.isTokenExpired();
  }

  odjava(){
    this.nesto=false;
    localStorage.clear();
    this.router.navigate(['/pocetna-strana']);
  }
}
