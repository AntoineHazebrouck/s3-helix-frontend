import { Component } from '@angular/core';
import { Tweet } from '../../model/tweet';

@Component({
  selector: 'app-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.css',
})
export class Content {
  protected readonly tweets: Tweet[] = [
    new Tweet('Antoine HAZEBROUCK', 'Je fais caca'),
    new Tweet('Axel ELIAS', 'Tu fais caca'),
  ];
}
