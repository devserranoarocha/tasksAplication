import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
   form: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    this.auth.login(this.form.value).subscribe({
      next: res => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/tasks']);
      },
      error: err => alert(err.error.message || 'Login Error. Email/Pasword Incorrect')
    });
  }
  ngOnInit(): void { 
    // mensaje en consola
  const style = `
    background: #FF8A00; 
    color: white; 
    padding: 5px 10px; 
    border-radius: 5px; 
    font-weight: bold; 
    font-size: 15px;
    font-family: sans-serif;
  `;

  const linkStyle = `
    color: #FF8A00; 
    font-weight: bold;
    font-size: 15px; 
    text-decoration: underline;
  `;

  console.log('%c🚀 Desarrollado con Angular y Symfony', style);
  console.log('%c👤 devserranoarocha', style);
  console.log('%c🔗 https://github.com/devserranoarocha', linkStyle);
  }

}
