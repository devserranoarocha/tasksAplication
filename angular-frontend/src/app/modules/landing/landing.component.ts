import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: []
})
export class LandingComponent {

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
