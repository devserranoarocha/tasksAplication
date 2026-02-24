import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../shared/services/task-service.service';
import { Task } from '../../shared/interfaces/task';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms'; // Clases de control de Forms
import { ReactiveFormsModule } from '@angular/forms'; // Importamos el modulo ReactiveForms
// Importamos operadores Reactive Extensions for JavaScript
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; 
import { ToastService } from '../../shared/services/toast.service';  // Importamos nuestro servicio de toast
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-tasks',
  imports: [CommonModule, RouterModule, ReactiveFormsModule ],  // Importamos el modulo ReactiveForms aqui tambien
  templateUrl: './tasks.component.html',
  styleUrls: []
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];  // Contiene todas las tareas
  filteredTasks: Task[] = []; // Nueva propiedad para las tareas filtradas
  taskForm!: FormGroup; // Declaramos FormGroup   ! (non-null) nos indica que sera inicializada en ngOnInit
  searchControl  = new FormControl(''); // Nuevo FormControl para la busqueda

  constructor(
    private taskService: TaskService,
    private toastService: ToastService,  // Inyectamos nuestro servicio de notificacion
    private router: Router,
    private authService: AuthService // Inyectamos nuestro servicio de Autenticacion
  ) {}
  
  user: any;

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

    // COMPROBAR EL LOGIN ---
    // Comprueba si el token existe en localStorage usando AuthService
    if (!this.authService.getUser()) {
      this.toastService.error('You are not logged in. Please log in to view tasks.');
      this.router.navigate(['/login']); // Redirige al usuario a la página de login
      return; // Detenemos la ejecución del resto del ngOnInit si no hay token
    }

    this.authService.getUser().subscribe({
      next: data => this.user = data,
      error: () => alert('Unauthorized or invalid token')
    });
 

    // Observamos que existe el token en la consola 
    console.log(this.authService.getUser());
    // Inicializa el FormGroup con un FormControl para 'title'
    // Validators.required asegura que el campo no esté vacío 
    // Validators.minLength(3) asegura la longitud minima del campo
    this.taskForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(3)])
    });
    this.loadTasks();  //Carga inicial de las tareas
    
    // Controlamos los cambios del campo de busqueda
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Espera 300 milisegundos antes de emitir un valor
      distinctUntilChanged() // Vigila que el valor sea diferente al anterior
    ).subscribe(searchTerm => {
      this.filterTasks(searchTerm || ''); // llamamos a la nueva funcion de filtrado
    });
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: tasks => {
        this.tasks = tasks;
        //Filtramos despues de cargar
        this.filterTasks(this.searchControl.value || ''); 
      },
      error: err => {
        this.toastService.error('Failed to load task.');   // Usamos nuestro servicio de toast
        console.log('Erro loading tasks;', err);
      }
    });
  }

  // Nueva funcion para la busqueda de tareas
  filterTasks(searchTerm: string): void {
    /* Nos aseguramos de que la busqueda no sea sensible a mayusculuas/minusculas.
      Convirtiendo el texto de la busqueda a minusculas y eliminando espacios al inicio/final. */
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm){
      // En el caso de que no haya nada en el campo de busqueda se muestran todas las task
      this.filteredTasks = [...this.tasks]; 
    } else {
      this.filteredTasks = this.tasks.filter(task => 
        task.title.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
  }

  addTask(): void {
    if (this.taskForm.valid) { // Verifica si el formulario es válido
      const title = this.taskForm.value.title.trim();
      const newTask: Task = { id: 0, title, completed: false };
      
      this.taskService.addTask(newTask).subscribe({
        next: () => {
        this.loadTasks(); // Recarga las tareas y refresca el filtro
        this.taskForm.reset(); // Limpia el formulario después de añadir la tarea
        this.toastService.success('Task added successfully!');   // Usamos nuestro servicio de toast
        },
        error: err => {
        this.toastService.error('Failed to add task'); // Usamos nuestro servicio de toast
        }
      });
    } else {
        // Mostrar un mensaje al usuario si el formulario no es válido
        this.toastService.error('Task title must be at least 3 characters long.'); // Usamos nuestro servicio de toast
      }
  }

  toggleTask(task: Task): void {
    task.completed = !task.completed;
    // Se actualiza el estado local en vez de cargar todas las tasks
    this.taskService.updateTask(task).subscribe(() => this.loadTasks());   
  }

  deleteTask(id: number): void {
    const taskToDelete = this.tasks.find(t => t.id === id);
    this.taskService.deleteTask(id).subscribe({
      next: () => {
      this.tasks = this.tasks.filter(task => task.id !== id); // Se elimina de la lista original
      this.filterTasks(this.searchControl.value || ''); // Volvemos a aplicar el filtro de busqueda
      this.toastService.success(`Task "${taskToDelete?.title || 'Unknown Task'}" deleted.`);  // Usando toastService
      },
      error: err => {
        this.toastService.error(`Failed to delete task "${taskToDelete?.title || 'Unknow Task'}".`);
      }
    });
  }

  // **** Nuevo método para cerrar sesión ****
  onLogout(): void {
    this.authService.logout(); // Llama al método logout del servicio de autenticación
    this.toastService.success('You have been logged out successfully.'); // Muestra un mensaje de éxito
    // El AuthService ya redirige a '/login', por lo que no es necesario aquí:
    // this.router.navigate(['/login']); 
  }
  
}