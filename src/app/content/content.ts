import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.css',
})
export class Content {
  protected readonly tweets: string[] = ['Je fais caca', 'sqdsqdsqd', 'tototoaorrf'];
}
