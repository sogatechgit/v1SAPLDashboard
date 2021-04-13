import { IAssetStatusInfo } from './dashboard.component';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-symbol-c',
  templateUrl: './symbol-c.component.html',
  styleUrls: ['./symbol-c.component.scss']
})
export class SymbolCComponent implements OnInit {

  constructor() { }


  get override():string{
    return 'red'
  }

  @Input() info:IAssetStatusInfo;

  ngOnInit(): void {
  }

}
