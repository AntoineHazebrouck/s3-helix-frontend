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
    this.http
      .get('https://av70t4ose5.execute-api.eu-west-1.amazonaws.com/prod/message', {
        responseType: 'text',
      })
      .subscribe({
        next: (next) => {
          const untyped: any = JSON.parse(next);

          this.tweets = JSON.parse(untyped.body).items.map(
            (item: any) =>
              new Tweet(item['userName'], item['content'], item['timestamp_utc_iso8601'])
          );
          this.change.detectChanges();
        },
      });
  }

  onSubmit() {
    this.http
      .post('https://av70t4ose5.execute-api.eu-west-1.amazonaws.com/prod/message', {
        // author: this.security.userData().userData['email'], // TODO username should come from the server
        messageContent: this.form.value.text,
      })
      .subscribe({
        next: (next) => {
          console.log(next);
        },
        error(err) {
          console.log(err);
        },
        complete() {
          console.log('complete');
        },
      });
    console.log(this.form.value.text);
  }
}
