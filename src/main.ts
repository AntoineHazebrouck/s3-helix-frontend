/// <reference types="@angular/localize" />

import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'angular-auth-oidc-client';
import { App } from './app/app';

const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter([]),
    provideAuth({
      config: {
        authority: 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_Jl5Jdh54R',
        redirectUrl: 'http://localhost:4200',
        postLogoutRedirectUri: window.location.origin,
        clientId: '58tvolrl5imlvi1qpsa5h3rp5e',
        scope: 'phone openid email',
        responseType: 'code',
      },
    }),
    provideHttpClient(),
  ],
};

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
