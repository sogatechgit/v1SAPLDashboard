import { DataService } from './../../svc/data.service';
import { IAssetStatusInfo } from './dashboard.component';
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-symbol-b',
  templateUrl: './symbol-b.component.html',
  styleUrls: ['./symbol-b.component.scss'],
})
export class SymbolBComponent implements OnInit, AfterViewInit {
  public _id: any;
  constructor(public ds: DataService, private elRef: ElementRef) {
    this._id = elRef.nativeElement.id;
  }

  @ViewChild('label') label: ElementRef;

  @Output() overrideClick: EventEmitter<any> = new EventEmitter();

  @Input() info: IAssetStatusInfo;

  @Input() hor: boolean = false;
  @Input() ver: boolean = false;
  @Input() ul: boolean = false;
  @Input() ur: boolean = false;
  @Input() ll: boolean = false;
  @Input() lr: boolean = false;

  @Input() lblR: boolean = false;
  @Input() lblM: boolean = false;
  @Input() lblL: boolean = false;

  @Input() lineWidth: number = 0.1;

  @Input() horOff: number = 1;
  @Input() verOff: number = 1;

  @Input() dashed: boolean = false;

  @Input() fontFactor: number;

  get lblClass(): any {
    return {
      right: this.hor && this.lblR,
      mid: this.hor && this.lblM,
      left: this.hor && this.lblL,
    };
  }

  get ff(): any {
    return this.fontFactor ? this.fontFactor : null;
  }

  get gridTemplate(): string {
    //const vOff =
    //this.verOff == undefined ? 'auto' : this.verOff - this.lineWidth / 2;
    //this.horOff == undefined ? 'auto' : this.horOff - this.lineWidth / 2;

    let colLeft = 1 + (1 - this.horOff) + 'fr';
    let colRight = this.horOff + 'fr';

      // return `1fr ${this.lineWidth}px 1fr / 1fr ${this.lineWidth}px 1fr`;

    if (this.ll) {
      return `${this.verOff}fr ${this.lineWidth}em ${1 + (1 - this.verOff)}fr / ${1 + (1 - this.horOff)}fr ${this.lineWidth}em ${this.horOff}fr`;
    } else if (this.lr) {
      return `${this.verOff}fr ${this.lineWidth}em ${1 + (1 - this.verOff)}fr / ${this.horOff}fr ${this.lineWidth}em ${1 + (1 - this.horOff)}fr`;
    } else if (this.ul) {
      return `${1 + (1 - this.verOff)}fr ${this.lineWidth}em ${this.verOff}fr / ${1 + (1 - this.horOff)}fr ${this.lineWidth}em ${this.horOff}fr`;
    } else if (this.ur) {
      return `${1 + (1 - this.verOff)}fr ${this.lineWidth}em ${this.verOff}fr / ${this.horOff}fr ${this.lineWidth}em ${1 + (1 - this.horOff)}fr`;
    }
    return `1fr ${this.lineWidth}em 1fr / 1fr ${this.lineWidth}em 1fr`;
  }

  private _lblChecked: boolean = false;
  private _lblContent: string;
  private _lbl: string;
  get lbl(): string {
    const info = this.ds.info(this._id);
    // return !info ? "no label " : "item"
    if (!info) return '';
    if (this._lbl == undefined || !this._lblChecked) {
      if (this._lblContent) this._lbl = this._lblContent;
      else {
        const lblArr = info.label.split('`');
        this._lbl = lblArr[0];

      }
    }

    return this._lbl;
  }


  ngOnInit(): void {
    //auto 4px auto / 1fr 4px 1fr;
    const host = this.elRef.nativeElement;
    host.style.gridTemplate = this.gridTemplate;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this._lblContent && this.label)
        this._lblContent = this.label.nativeElement.innerHTML;
      setTimeout(() => (this._lblChecked = true), 0);
    }, 0);
  }

  SetOverride(event: any) {
    this.ds.ProcessClick(this._id)
    // console.log("Clicked item: " + this._id)
    // this.overrideClick.emit(this);
  }
}
