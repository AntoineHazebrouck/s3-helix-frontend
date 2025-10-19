import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Tweet } from '../../model/tweet';

@Component({
  selector: 'app-content',
  imports: [ReactiveFormsModule],
  templateUrl: './content.html',
  styleUrl: './content.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Content implements OnInit {
  form = new FormGroup({
    text: new FormControl(''),
  });
  public tweets: Tweet[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly change: ChangeDetectorRef,
    private readonly security: OidcSecurityService
  ) {}

  ngOnInit(): void {
    this.authenticated((token) => {
      this.http
        .get('https://av70t4ose5.execute-api.eu-west-1.amazonaws.com/prod/message', {
          responseType: 'text',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .subscribe((next) => {
          const untyped: any = JSON.parse(next);

          this.tweets = untyped.items
            .map(
              (item: any) =>
                new Tweet(item['userName'], item['content'], item['timestamp_utc_iso8601'])
            )
            .sort((left: Tweet, right: Tweet) => (left.time > right.time ? -1 : 1));
          this.change.detectChanges();
        });
    });
  }

  onSubmit() {
    this.authenticated((token) => {
      console.log(token);

      this.http
        .post(
          'https://av70t4ose5.execute-api.eu-west-1.amazonaws.com/prod/message',
          {
            messageContent: this.form.value.text,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .subscribe((response) => {
          console.log(response);

          // TODO reload the messages
        });
    });
  }

  authenticated(action: (token: string) => void) {
    this.security.getIdToken().subscribe((token) => action(token));
  }
}
