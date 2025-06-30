import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService, ToastNotification } from '../../services/toast.service';
import { CommonModule } from '@angular/common'; // Importa CommonModule para *ngIf y ngClass
// Importamos operadores Reactive Extensions for JavaScript
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast, [app-toast]',
  standalone: true,            //Simplificamos el componente declarandolo como autonomo 
  imports: [CommonModule],     // Se usa para standalone components
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  currentNotification: ToastNotification | null = null;
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.getToast().pipe(
      takeUntil(this.destroy$)
    ).subscribe(notification => {
      this.currentNotification = notification;
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getNotificationClass(): string {  // Mostramos toast segun tipo de notificacion.
    if (!this.currentNotification){
        return '';
    }
    switch (this.currentNotification.type) {
       case 'success': return 'bg-green-500 toast-succeess';
       case 'error': return 'bg-red-500 toast-error'; 
       default: return 'bg-gray-700';   
    }
  }

  hideNotification(): void {     // Escondemos notificacion.
    this.toastService.clear();
  }
  
}
