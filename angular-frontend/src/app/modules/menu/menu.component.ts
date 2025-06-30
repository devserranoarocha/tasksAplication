import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  user: any;

 constructor(private auth: AuthService) {}

 ngOnInit(): void {
   this.auth.getUser().subscribe({
     next: data => this.user = data,
     error: () => alert('Unauthorized or invalid token')
   });
 }


 logout(): void {
   this.auth.logout();
 }
}
