import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared.service';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-show-emp',
  templateUrl: './show-emp.component.html',
  styleUrls: ['./show-emp.component.css']
})
export class ShowEmpComponent implements OnInit {

  constructor(private service:SharedService) { }

  EmployeeList:any=[];
  
  ModalTitle: string;
  ActivateAddEditEmpComp:boolean=false;
  emp:any;
  ngOnInit(): void {
    this.refreshEmpList();
  }
  addClick(){
    this.emp={
      id:0,
      name:"",
      department:""
    }
    this.ModalTitle="Add Employee";
    this.ActivateAddEditEmpComp=true;
  }
  closeClick(){
    this.ActivateAddEditEmpComp=false;
    this.refreshEmpList();
  }



  refreshEmpList(){
    this.service.getEmpList().subscribe(data=>{
      this.EmployeeList=data;
    });
  }
}
