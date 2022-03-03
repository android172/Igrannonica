import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  readonly APIUrl = "http://localhost:5000/api";

  constructor(private http:HttpClient) { }

  getFilm():Observable<any[]>
  {
    return this.http.get<any>(this.APIUrl + "/Film");
  }

  addFilm(val:any)
  {
    return this.http.post(this.APIUrl + "/Film", val);
  }

  updateFilm(val:any)
  {
    return this.http.put(this.APIUrl + "/Film", val);
  }

  deleteFilm(val:any)
  {
    return this.http.delete(this.APIUrl + "/Film/" + val);
  }
}
