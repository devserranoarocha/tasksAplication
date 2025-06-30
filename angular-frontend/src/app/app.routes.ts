import { Routes } from '@angular/router';
import { TasksComponent } from './modules/tasks/tasks.component';
import { LandingComponent } from './modules/landing/landing.component';
//Importamos nuevos componentes para login
import { RegisterComponent } from './modules/register/register.component'; 
import { LoginComponent } from './modules/login/login.component';
import { MenuComponent } from './modules/menu/menu.component';

export const routes: Routes = [
    {path: "", component: LandingComponent},
    {path: "tasks", component: TasksComponent},
    // establecemos las nuevas path
    {path: "register", component: RegisterComponent},
    {path: "login", component: LoginComponent},
    {path: "menu", component: MenuComponent},
    {path: "**", redirectTo: "login"}
];
