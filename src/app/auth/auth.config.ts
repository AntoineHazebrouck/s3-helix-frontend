import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_Jl5Jdh54R',
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    clientId: '58tvolrl5imlvi1qpsa5h3rp5e',
    scope: 'phone openid email', // 'openid profile offline_access ' + your scopes
    responseType: 'code',
    // silentRenew: true,
    // useRefreshToken: true,
    // renewTimeBeforeTokenExpiresInSeconds: 30,
  },
};

// import { NgModule } from '@angular/core';
// import { AuthModule, LogLevel } from 'angular-auth-oidc-client';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { BrowserModule } from '@angular/platform-browser';
// // // ...

// @NgModule({
//   // ...
//   imports: [
//     BrowserModule,
//     AuthModule.forRoot({
//       config: {
//         authority: 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_Jl5Jdh54R',
//         redirectUrl: window.location.origin,
//         postLogoutRedirectUri: window.location.origin,
//         clientId: '58tvolrl5imlvi1qpsa5h3rp5e',
//         scope: 'phone openid email', // 'openid profile offline_access ' + your scopes
//         responseType: 'code',
//         silentRenew: true,
//         useRefreshToken: true,
//         renewTimeBeforeTokenExpiresInSeconds: 30,
//       },
//     }),
//   ],
//   // ...
// })
// export class AppModule {}
