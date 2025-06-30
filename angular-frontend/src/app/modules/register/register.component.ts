import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule si es necesario para directivas como ngIf, etc.

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule 
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]], // Añadir minLength para password
    });
  }

  submit(): void {
    if (this.form.valid) { // Verificar si el formulario es válido antes de enviar
      this.auth.register(this.form.value).subscribe({
        next: () => {
          alert('¡Registration successful! Please log in.'); // Mensaje de éxito
          this.router.navigate(['/login']);
        },
        error: err => {
          // Mejorar el manejo de errores para mostrar mensajes más específicos
          console.error('Registration error:', err);
          alert(err.error.message || 'Registration error. Try again.');
        }
      });
    } else {
      // Marcar los campos como tocados para mostrar mensajes de validación si existen
      this.form.markAllAsTouched();
      alert('Please complete all required fields correctly.');
    }
  }
}