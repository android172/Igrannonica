import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profilna-strana-izmena-podataka',
  templateUrl: './profilna-strana-izmena-podataka.component.html',
  styleUrls: ['./profilna-strana-izmena-podataka.component.css']
})
export class ProfilnaStranaIzmenaPodatakaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  url = "./assets/ikonica.png";

  onselectFile(e:any){

    if(e.target.files)
    {
        var reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = (event:any) => {
          this.url = event.target.result;
        }
    }
  }
}
