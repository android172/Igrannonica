import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DepartmanComponent } from './departman/departman.component';
import { ShowDepComponent } from './departman/show-dep/show-dep.component';
import { AddEditDepComponent } from './departman/add-edit-dep/add-edit-dep.component';
import { ZaposleniComponent } from './zaposleni/zaposleni.component';
import { ShowEmpComponent } from './zaposleni/show-emp/show-emp.component';
import { AddEditEmpComponent } from './zaposleni/add-edit-emp/add-edit-emp.component';
import { SharedService } from './shared.service';

import {HttpClientModule} from '@angular/common/http';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DepartmanComponent,
    ShowDepComponent,
    AddEditDepComponent,
    ZaposleniComponent,
    ShowEmpComponent,
    AddEditEmpComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
