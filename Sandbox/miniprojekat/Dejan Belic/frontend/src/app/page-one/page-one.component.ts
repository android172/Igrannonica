import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ValueService } from '../value.service';

@Component({
  selector: 'app-page-one',
  templateUrl: './page-one.component.html',
  styleUrls: ['./page-one.component.css']
})
export class PageOneComponent implements OnInit {

  ngOnInit(): void {
  }

  username = '';
  password = '';
  response = '';

  constructor(private values: ValueService, private router: Router) {}

  sendLoginRequest() {
    console.log("Usao");
    this.values.login(this.username, this.password).subscribe((response) => {
      this.response = response;
      this.router.navigate(['two', response])
    });
  }
}
