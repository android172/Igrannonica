import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import {ZaposleniComponent} from './zaposleni/zaposleni.component';
import {DepartmanComponent} from './departman/departman.component';

const routes: Routes = [
  {path:'zaposleni',component:ZaposleniComponent},
  {path:'departman',component:DepartmanComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
