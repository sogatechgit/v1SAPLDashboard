import { DataService } from './../../svc/data.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @HostListener('window:beforeprint')
  onbeforeprint() {
    if (this.prnAnoms) {
      const elem = this.prnAnoms.nativeElement;
      this._prnInfo = ` print info available ${elem.childNodes.length}`;
      elem.childNodes.forEach((e) => {
        // e.style.pageBreakBefore = 'always';
        // e.style.display='none'
      });
      //page-break-before: always;
    } else {
      this._prnInfo = ' no print info';
    }
  }

  @HostListener('window:afterprint')
  onafterprint() {
    this._prnInfo = ' on  after print ';
  }

  @ViewChild('details_wrapper') details_wrapper: any;
  @ViewChild('anom_grid') anom_grid: any;

  @ViewChild('main_wrapper') main_wrapper: any;
  @ViewChild('prnAnoms') prnAnoms: any;

  @ViewChild('mainMenu') mainMenu:ElementRef;

  constructor(public ds: DataService, private elRef: ElementRef) {
    // console.log("host: ",elRef.nativeElement)
  }

  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    if (!this.details_wrapper) return;

    const elem = this.details_wrapper.nativeElement;

    let fac = 910.0;

    this._fontFactor = elem.clientHeight / fac;
    console.log(elem.clientHeight, this._fontFactor);
  }

  public rad = 3;

  private _anomList: Array<IAnomalyInfo>;
  get anomList(): Array<IAnomalyInfo> {
    if (this._anomList == undefined) {
      // call request for anomaly list
      const list: Array<IAnomalyInfo> = [];
    }
    return this._anomList;
  }

  get noAnomDetails(): boolean {
    // return true;
    return !this.ds.showAnoms;
  }

  private _prnInfo: string = ' un init ';
  get prnInfo(): string {
    return this._prnInfo;
  }

  private _fontFactor: number = 0.7;
  fontFactor(): number {
    return this._fontFactor;
  }

  ngOnInit(): void {
    // const anoms = this.ds.anomalies;
    // setTimeout(()=>{
    //   console.clear();
    //   console.log("GET DATA!")
    //   const a = this.ds.anomalies;
    //   console.log("AFTER GET DATA!",a)
    // },4000)
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.ds.dashboard = this;
      this.handleResize(null);

      setTimeout(()=>console.log("mainMenu : ", this.mainMenu),5000)
    });

    const det = this.details_wrapper.nativeElement;
    if (this.prnAnoms) {
      this._prnInfo = ' print info available ';
    } else {
      this._prnInfo = ' no print info';
    }
  }

  get anomClass():any{
    return {
      with_spare:true
    }
  }

  get withWON():boolean{
    return this.ds.AnomListSourceWithWON;
  }

  ToggleAnom(withWON?: boolean) {
    if (withWON == undefined) withWON = false;

    this.ds.AnomListSourceWithWON = withWON;

    this.ds.showAnoms = !this.ds.showAnoms;
    setTimeout(() => this.handleResize(null));
  }

  Reload() {
    this.ds._AnomAssets = undefined;
    this.ds._AnomList = undefined;

    this.ds.ReadOverrides();
    // this.ds.ReadAssets();
  }

  Print() {
    console.log('Print diagram...');
    setTimeout(()=>window.print())
    
  }

  // OpenAnomaly(anomid: any) {
  //   if (window.parent['GotoAnomaly']) {
  //     window.parent['GotoAnomaly'](anomid);
  //   } else {
  //     alert('GotoAnomaly anomaly function does not exist in the parent page.');
  //   }
  // }
}

export interface IAssetStatusInfo {
  symId: string;
  label: string;
  assetId: number;
  treeLoc: string;

  override?: string;
  ovrClr?: number; 
  ovrUP?: number;

  ovrJust?: string;

  color?: string;
  border?: string;
  anoms?: Array<IAnomalyInfo>;

  spare?: boolean;

  choke?: boolean;
  xmasTree?: boolean;
}

export interface IOverride {
  aid: number;
  clr: number;
  just: string;
  up?: number;
}

export interface IAnomalyInfo {
  aid: number;
  ass: string;
  loc: string;
  id: string;

  ref: number;
  tit: string;
  clr: number;
  desc: string;
  ident: string;
  won?: string;
  comm?: string;
  ovr?: number;
}
