import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-header-banner',
  imports: [AsyncPipe],
  templateUrl: './header-banner.html',
  styleUrl: './header-banner.css',
})
export class HeaderBanner implements OnInit {
  private readonly security = inject(OidcSecurityService);

  isAuthenticated$!: Observable<boolean>;

  ngOnInit(): void {
    this.isAuthenticated$ = this.security.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => {
        console.log(isAuthenticated);
        return isAuthenticated;
      })
    );

    this.security.checkAuth().subscribe(({ isAuthenticated, userData, accessToken }) => {
      console.log('App authenticated', isAuthenticated);
      // You can handle user data or token here if needed
    });

    // this.isAuthenticated$.

    // this.isAuthenticated = this.security.authenticated().isAuthenticated;
    // this.security.checkAuth().subscribe(({ isAuthenticated, userData }) => {
    //   console.log(isAuthenticated);

    //   this.isAuthenticated = isAuthenticated;
    // });
  }

  login() {
    this.security.authorize();
  }

  logout() {
    this.security.logoff().subscribe((result) => console.log(result));
  }
}
