import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
  constructor(title: Title) {
    title.setTitle('Twitter Wish');
  }
}
