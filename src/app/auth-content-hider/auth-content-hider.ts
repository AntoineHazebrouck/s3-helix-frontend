import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, Observable } from 'rxjs';
import { Content } from '../content/content';

@Component({
  selector: 'app-auth-content-hider',
  imports: [Content, AsyncPipe],
  templateUrl: './auth-content-hider.html',
  styleUrl: './auth-content-hider.css',
})
export class AuthContentHider {
  private readonly security = inject(OidcSecurityService);

  isAuthenticated$!: Observable<boolean>;

  ngOnInit(): void {
    this.isAuthenticated$ = this.security.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => {
        return isAuthenticated;
      })
    );

    this.security.checkAuth().subscribe();
  }

  login() {
    this.security.authorize();
  }
}
