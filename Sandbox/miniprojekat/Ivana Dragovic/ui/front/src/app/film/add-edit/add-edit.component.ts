import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent implements OnInit {

  constructor(private service:SharedService) { }

  @Input() movie: any;
  filmId:string = "";
  filmNaziv:string = "";
  filmZanr:string = "";
  filmOcena:string = "";

  ngOnInit(): void {
    this.filmId = this.movie.filmId;
    this.filmNaziv = this.movie.filmNaziv;
    this.filmZanr = this.movie.filmZanr;
    this.filmOcena = this.movie.filmOcena;
  }

  dodajFilm()
  {
    var val = {filmId: this.filmId,
               filmNaziv: this.filmNaziv,
               filmZanr: this.filmZanr,
               filmOcena: this.filmOcena}
    this.service.addFilm(val).subscribe(res=>{
      alert(res.toString());
    });
  }

  izmeniFilm()
  {
    var val = {filmId: this.filmId,
               filmNaziv: this.filmNaziv,
               filmZanr: this.filmZanr,
               filmOcena: this.filmOcena}
    this.service.updateFilm(val).subscribe(res=>{
      alert(res.toString());
    });
  }

}
