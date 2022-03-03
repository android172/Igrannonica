import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-show-delete',
  templateUrl: './show-delete.component.html',
  styleUrls: ['./show-delete.component.css']
})
export class ShowDeleteComponent implements OnInit {

  constructor(private service:SharedService) { }

  FilmList:any=[];
  ModalTitle:string = "";
  ActivateAddEdit:boolean = false;
  movie:any;
  filmNazivFilter:string="";
  filmoviListWithoutFilter:any=[];

  ngOnInit(): void {
    this.refreshFilmList();
  }

  addDugme()
  {
    this.movie={
      filmId:0,
      filmNaziv:"",
      filmZanr:"",
      filmOcena:""
    }
    this.ModalTitle = "Dodaj film";
    this.ActivateAddEdit = true;
  }

  closeDugme()
  {
    this.ActivateAddEdit = false;
    this.refreshFilmList();
  }

  editDugme(film:any)
  {
    this.movie = film;
    this.ModalTitle = "Izmeni film";
    this.ActivateAddEdit = true;
  }

  deleteDugme(film:any)
  {
    if(confirm("Da li ste sigurni da zelite da obrisete ovaj film?"))
    {
      this.service.deleteFilm(film.filmId).subscribe(data=>{
        alert(data.toString());
        this.refreshFilmList();
      })
    }
  }

  refreshFilmList()
  {
    this.service.getFilm().subscribe(data =>{
      this.FilmList = data;
      this.filmoviListWithoutFilter=data;
    });
  }

  filter()
  {
    var filmNameFilter = this.filmNazivFilter;
    this.FilmList = this.filmoviListWithoutFilter.filter(function (el:any){
      return el.filmNaziv.toString().toLowerCase().includes(
        filmNameFilter.toString().trim().toLowerCase())});
  }

}
