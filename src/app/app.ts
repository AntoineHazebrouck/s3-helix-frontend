import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModule } from 'angular-auth-oidc-client';
import { HeaderBanner } from './header-banner/header-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthModule, CommonModule, HeaderBanner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('s3-helix-frontend');
}
