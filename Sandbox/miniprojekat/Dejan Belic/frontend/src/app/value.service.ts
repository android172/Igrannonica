import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValueService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post(`http://localhost:5000/api/neki/login`, {"username": username, "password": password}, {responseType: 'text'})
  }

  getValue(id: number) {
    return this.http.post(`http://localhost:5000/api/neki/login`, {"username": "abc", "password": "cba"}, {responseType: 'text'})
  }  
}
