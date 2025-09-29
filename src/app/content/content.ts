import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Tweet } from '../../model/tweet';

@Component({
  selector: 'app-content',
  imports: [ReactiveFormsModule],
  templateUrl: './content.html',
  styleUrl: './content.css',
})
export class Content {
  form = new FormGroup({
    text: new FormControl(''),
  });
  protected readonly tweets: Tweet[] = [
    new Tweet('Antoine HAZEBROUCK', 'Je fais caca'),
    new Tweet('Axel ELIAS', 'Tu fais caca'),
  ];

  onSubmit() {
    console.log(this.form.value.text);
  }
}
