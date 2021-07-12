import { DataService } from './../../svc/data.service';
import { IAssetStatusInfo } from './dashboard.component';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-symbol-a',
  templateUrl: './symbol-a.component.html',
  styleUrls: ['./symbol-a.component.scss'],
})
export class SymbolAComponent implements OnInit, AfterViewInit {
  public _id: any;
  constructor(public ds: DataService, private elRef: ElementRef) {
    this._id = elRef.nativeElement.id;
  }

  @ViewChild('cont') cont: ElementRef;
  @ViewChild('label') label: ElementRef;

  @Output() overrideClick: EventEmitter<any> = new EventEmitter();

  @Input() lblUL: string = '';
  @Input() lblUR: string = '';
  @Input() lblLL: string = '';
  @Input() lblLR: string = '';

  @Input() lblTop:boolean;
  @Input() lblBottom:boolean;
  @Input() lblLeft:boolean;
  @Input() lblRight:boolean;

  @Input() labelOnly:boolean;

  @Input() fixedColor:string;


  @Input() cw90:boolean;


  @Input() locid: number;

  @Input() vt: boolean;
  @Input() rad: number = 0;

  @Input() round: boolean = false;

  @Input() backColor: string;
  @Input() foreColor: string;

  @Input() noFill: boolean = false;

  @Input() fontFactor: number;

  @Input() ovrBottom: boolean;

  @Input() linkedParentSymbolId: string;

  get isVertical(): boolean {
    if (!this.cont) return false;
    const ht = this.cont.nativeElement.clientHeight;
    const wd = this.cont.nativeElement.clientWidth;

    return ht > wd;
  }

  get info(): IAssetStatusInfo {
    return this.ds.info(this._id);
  }

  get back(): string {
    if (this.backColor) return this.backColor;
    return this.noFill ? 'none' : this.ds.back(this._id);
    // return this.ds.back(this._id);
  }

  get fore(): string {
    if (this.foreColor) return this.foreColor;
    return this.ds.fore(this._id);
  }

  get border(): string {
    
    return this.fixedColor  ? this.fixedColor : this.ds.back(this._id) ;
    // return this.noFill ? this.ds.back(this._id) : this.ds.border(this._id);

  }

  private _lblChecked: boolean = false;
  private _lblContent: string;
  private _lbl: string;
  get lbl(): string {
    const info = this.info;
    if (!info) return '';
    if (this._lbl == undefined || !this._lblChecked) {
      if (this._lblContent) this._lbl = this._lblContent;
      else {
        const lblArr = info.label.split('`');
        this._lbl = lblArr[0];
        if (lblArr.length >= 2) if (lblArr[1]) this.lblUL = lblArr[1];
        if (lblArr.length >= 3) if (lblArr[2]) this.lblUR = lblArr[2];
        if (lblArr.length >= 4) if (lblArr[3]) this.lblLR = lblArr[3];
        if (lblArr.length >= 5) if (lblArr[4]) this.lblLL = lblArr[4];
      }
    }

    return this._lbl;
  }

  ngOnInit(): void { }
  ngAfterViewInit() {
    // this.handleResize(null);
    // console.log('sub:', this.sub.nativeElement.clientHeight);
    setTimeout(() => {
      if (!this._lblContent && this.label)
        this._lblContent = this.label.nativeElement.innerHTML;
      setTimeout(() => (this._lblChecked = true), 0);
    }, 0);
  }

  SetOverride(event: any) {
    this.ds.ProcessClick(this._id, this.linkedParentSymbolId);
  }
}
