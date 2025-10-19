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
  tweets: Tweet[] = [];
  pagination?: string;

  constructor(
    private readonly http: HttpClient,
    private readonly change: ChangeDetectorRef,
    private readonly security: OidcSecurityService
  ) {}

  ngOnInit(): void {
    this.loadTweets();
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

          this.loadTweets();
          // this.form.value.text = '';
        });
    });
  }

  authenticated(action: (token: string) => void): void {
    this.security.getIdToken().subscribe((token) => action(token));
  }

  loadTweets(pagination?: string): void {
    this.authenticated((token) => {
      this.http
        .get(
          `https://av70t4ose5.execute-api.eu-west-1.amazonaws.com/prod/message${
            pagination ? '?lastKey=' + pagination : ''
          }`,
          {
            responseType: 'text',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .subscribe((next) => {
          const untyped: any = JSON.parse(next);

          this.pagination = untyped.nextKey;

          const newItems = untyped.items.map((item: any) => {
            const username = item['username'] || item['userName'];
            return new Tweet(username, item['content'], item['timestamp_utc_iso8601']);
          });
          // .sort((left: Tweet, right: Tweet) => (left.time > right.time ? -1 : 1));

          console.log(pagination);
          console.log(newItems);

          if (pagination) this.tweets = this.tweets.concat(newItems);
          else this.tweets = newItems;

          this.change.detectChanges();

          console.log('Reloaded tweets : ');
          console.log(this.tweets);
          console.log('Reloaded nextPage : ');
          console.log(this.pagination);
        });
    });
  }

  loadNextTweets(): void {
    if (!this.pagination) throw new Error('this.pagination is null');

    this.loadTweets(this.pagination);
  }
}
