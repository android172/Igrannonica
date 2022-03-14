import { Component, OnInit } from '@angular/core';
import { MeniService } from '../meni.service';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {

  constructor(private prikaziMeni: MeniService) {
  }


  ngOnInit(): void {
  }

  changeBoolean()
  {
    this.prikaziMeni.meni=true;
  }

}
