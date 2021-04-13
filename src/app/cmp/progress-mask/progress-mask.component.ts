import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-mask',
  templateUrl: './progress-mask.component.html',
  styleUrls: ['./progress-mask.component.scss']
})
export class ProgressMaskComponent implements OnInit {

  @Input() fontFactor:number = 0.9;
  @Input() prompt: string = 'Processing. Please wait...';

  constructor() { }

  ngOnInit(): void {
  }

}
