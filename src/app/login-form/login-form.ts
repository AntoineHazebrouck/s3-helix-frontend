import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  private readonly security = inject(OidcSecurityService);

  loginForm = new FormGroup({
    login: new FormControl(),
    password: new FormControl(),
  });

  onSubmit() {
    console.log(this.loginForm.value.login);
    console.log(this.loginForm.value.password);

    // this.security.setState()
    this.security.authorize()
  }
}
