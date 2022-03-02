import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';  

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  readonly APIUrl="http://localhost:19109/api";
  constructor(private http:HttpClient) { }

  getDepList():Observable<any[]>{
    return this.http.get<any>(this.APIUrl+'/departman');
  }

  
  addDepartment(val:any){
    return this.http.post(this.APIUrl+'/departman',val);
  }

  updateDepartment(val:any){
    return this.http.put(this.APIUrl+'/departman',val);
  }

  deleteDepartment(val:any){
    return this.http.delete(this.APIUrl+'/departman/'+val);
  }


  getEmpList():Observable<any[]>{
    return this.http.get<any>(this.APIUrl+'/zaposleni');
  }

  addEmployee(val:any){
    return this.http.post(this.APIUrl+'/zaposleni',val);
  }

  updateEmployee(val:any){
    return this.http.put(this.APIUrl+'/zaposleni',val);
  }

  deleteEmployee(val:any){
    return this.http.delete(this.APIUrl+'/zaposleni/'+val);
  }

  getAllDepartmentNames():Observable<any[]>{
    return this.http.get<any[]>(this.APIUrl+'/zaposleni/GetAllDepartmentNames');
  }
}
