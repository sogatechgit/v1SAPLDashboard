import { AnomaliesPopupComponent } from './../cmp/dashboard/anomalies-popup.component';
import {
  DashboardComponent,
  IAnomalyInfo,
  IAssetStatusInfo,
  IOverride,
} from './../cmp/dashboard/dashboard.component';
import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { sharedStylesheetJitUrl, syntaxError } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppModule } from '../app.module';
import { NotesPopupComponent } from '../cmp/dashboard/notes-popup.component';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // public url: string = './anomalies.json';
  public url: string = './assets/json/anomalies.json';
  // public configURL: string =this.url;
  public configURL: string = './assets/json/config.json';

  public CL_GREEN: string = '#28a745';
  public CL_YELLOW: string = 'yellow';
  public CL_ORANGE: string = 'orange';
  public CL_RED: string = '#dc3545';
  public CL_DARK: string = 'black';
  public CL_LIGHT: string = 'white';
  public CL_LIGHT_BLUE: string = '#b4d5ff';
  public CL_SECONDARY: string = '#6c757d';

  public colors: Array<string> = [
    this.CL_GREEN,
    this.CL_YELLOW,
    this.CL_ORANGE,
    this.CL_RED,
  ];

  public colorNames: Array<string> = ['Green', 'Yellow', 'Orange', 'Red'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // get Setup data
    this.SetupData();
  }

  private _assets_url: string;
  private _anomalies_url: string;
  private _overrides_url: string;
  private _override_url: string;
  private _commentary_url: string;
  private _show_anoms: boolean;
  private _log_post: boolean;

  get showAnoms(): boolean {
    return this._show_anoms != undefined ? this._show_anoms : false;
  }
  set showAnoms(value: boolean) {
    this._show_anoms = value;
  }

  public dashboard: DashboardComponent;

  public processing: boolean = false;

  private _subConfig: Subscription;
  SetupData() {
    setTimeout(() => (this.processing = true));
    this._subConfig = this.http.get(this.FormatURL(this.configURL)).subscribe(
      (data: any) => {
        this._subConfig.unsubscribe();
        this._subConfig = null;
        const {
          anomalies_url,
          assets_url,
          override_url,
          overrides_url,
          commentary_url,
          show_anoms,
          broadcast_all_override_post_events
        } = data;

        this._anomalies_url = anomalies_url;
        this._assets_url = assets_url;
        this._override_url = override_url;
        this._commentary_url = commentary_url;
        this._overrides_url = overrides_url;
        this._show_anoms = show_anoms;
        this._log_post = broadcast_all_override_post_events;

        console.log('CONFIG PATHS: ', data);

        this.ReadAssets();
      },
      (err) => {
        console.log('Config ERROR: ', err);
      },
      () => {
        console.log('Config Complete!');
      }
    );
  }

  FormatURL(url: string): string {
    let ret: string = url;
    if (ret.endsWith('&')) {
      // url is ready to receive next parameter name
      ret += 'tm=' + new Date().toString();
    } else if (ret.indexOf('?') != -1) {
      // url already contains parameter(s)
      ret += '&tm=' + new Date().toString();
    } else {
      // url without parameter specified yet
      ret += '?tm=' + new Date().toString();
    }
    return ret;
  }

  private _subAssets: Subscription;
  private _spareAssets: Array<IAssetStatusInfo>;

  ReadAssets() {
    this.itemInfo = {}  // reset symbol info
    this._subAssets = this.http.get(this.FormatURL(this._assets_url)).subscribe(
      (data: any) => {
        this._subAssets.unsubscribe();
        this._subAssets = null;
        const { symbols } = data;

        this._symbols = data.symbols;

        this._spareAssets = this._symbols.filter(ass => ass.spare)

        this.ReadOverrides();
      },
      (err) => {
        console.log('Assets ERROR: ', err);
      },
      () => {
        console.log('Assets Complete!');
      }
    );
  }

  private _subOverrides: Subscription;
  ReadOverrides() {
    this.processing = true;
    this.itemInfo = {}  // reset symbol info
    this._subOverrides = this.http
      .get(this.FormatURL(this._overrides_url))
      .subscribe(
        (data: any) => {
          this._subOverrides.unsubscribe();
          this._subOverrides = null;
          this._overrides = data;
          this.ReadAnomalies();
        },
        (err) => {
          console.log('Overrides ERROR: ', err);
        },
        () => {
          console.log('Overrides Complete!');
        }
      );
  }

  private _anomalies: Array<IAnomalyInfo>;
  private _subAnomalies: Subscription = null;
  private _dataReady: boolean = false;

  ReadAnomalies() {
    this._subAnomalies = this.http
      .get(this.FormatURL(this._anomalies_url))
      .subscribe(
        (data: any) => {
          const dataStr = JSON.stringify(data)
            .replace(/"AID":/gi, '"aid":')
            .replace(/"LOC":/gi, '"loc":')
            .replace(/"ID":/gi, '"id":')
            .replace(/"REF":/gi, '"ref":')
            .replace(/"TIT":/gi, '"tit":')
            .replace(/"COMM":/gi, '"comm":')
            .replace(/"WON":/gi, '"won":')
            .replace(/"DESC":/gi, '"desc":')
            .replace(/"IDENT":/gi, '"ident":')
            .replace(/"CLR":/gi, '"clr":')
            .replace(/"OVR":/gi, '"ovr":');

          this._anomalies = JSON.parse(dataStr);
          this._subAnomalies.unsubscribe();
          this._subAnomalies = null;

          this.UpdateAssetStatus();
        },
        (err) => {
          console.log('ERROR: ', err);
        },
        () => {
          console.log('Complete!');
        }
      );
  }

  InitAssetStatus() {
    const syms = this.symbols;
    syms.forEach((sym) => {
      sym.color = '';
      sym.border = '';
      sym.override = '';
      sym.anoms = [];
    });
  }

  UpdateAssetStatus() {
    const anoms = this._anomalies;
    const syms = this.symbols;
    // console.log("UpdateAssetSta anomalies(anoms): ",syms , anoms)

    const ovrs = this.overrides;

    syms.forEach((sym) => {
      if (!sym.treeLoc) return;

      // set override
      const ovr = ovrs.find((o) => o.aid == sym.assetId);
      if (ovr) {
        sym.ovrClr = ovr.clr;
        sym.ovrUP = ovr.up;
        sym.ovrJust = ovr.just;
        sym.override = this.colors[ovr.clr - 1];
      } else {
        sym.ovrJust = '';
        sym.ovrUP = 0;
        sym.ovrClr = null;
        sym.override = '';
      }

      const { symId, treeLoc } = sym;
      // select all items under the current location
      const recs = anoms.filter((a) => a.loc.startsWith(treeLoc));
      if (recs.length > 1) {
        // get to worst anomalies
        recs.sort((x, y) => {
          return y.clr - x.clr;
        });
        sym.anoms = [];
        const clr = recs[0].clr;
        for (let i = 0; i < recs.length; i++) {
          if (recs[i].clr != clr) break;
          recs[i].ass = sym.label;
          sym.anoms.push(recs[i]);
        }

        // if(sym.label == 'ASD'){
        //   console.log("## ASD" , sym);
        // }

        // set color
        sym.color = this.colors[clr - 1];
        // sym.anoms = recs;
      } else {
        sym.anoms = recs;
        if (recs.length) {
          recs[0].ass = sym.label;
          sym.color = this.colors[recs[0].clr - 1];
        }
      }
    });
    this._dataReady = true;
    this.processing = false;

    if (this.dashboard) {
      this.dashboard.handleResize(null)
    }

  }

  public _AnomAssets: Array<IAssetStatusInfo>;
  get AnomAssets(): Array<IAssetStatusInfo> {
    if (!this._dataReady) return [];

    if (this._AnomAssets == undefined) {
      this._AnomAssets = this.symbols.filter((sym) => sym.anoms.length);
    }
    return this._AnomAssets ? this._AnomAssets : [];
  }

  public _AnomList: Array<IAnomalyInfo>;
  get AnomList(): Array<IAnomalyInfo> {
    if (!this._dataReady) return [];

    if (
      (this._AnomList == undefined || this._AnomAssets == undefined) &&
      !this.processing
    ) {
      const assets = this.AnomAssets;
      const list: Array<IAnomalyInfo> = [];
      assets.forEach((ass) => {
        ass.anoms.forEach((anom) => list.push(anom));
      });
      this._AnomList = list;
    }
    return this._AnomList ? this._AnomList : [];
  }

  private _AnomListNoGreenWithWON: Array<IAnomalyInfo> = [];
  private _AnomListNoGreen: Array<IAnomalyInfo>;
  private _AnomListSpare: Array<IAnomalyInfo>;

  get AnomListNoGreen(): Array<IAnomalyInfo> {
    if (!this._dataReady) return [];
    const anoms = this.AnomList;
    if (this._AnomListNoGreen == undefined && this._AnomList) {
      const incAnom = {};
      const noGreens = this._AnomList.filter(anom => anom.clr != 1);

      const anoms: IAnomalyInfo[] = [];
      const anomsWons: IAnomalyInfo[] = [];
      const anomsSpare: IAnomalyInfo[] = [];
      noGreens.forEach(an => {
        if (!incAnom['an_' + an.id]) {
          incAnom['an_' + an.id] = true

          const isSpare = this._spareAssets.find(as => as.assetId == an.aid) ? true : false;
          if (!isSpare) {
            anoms.push(an);
            if (an.won) anomsWons.push(an);
          } else {
            anomsSpare.push(an);
          }

        }
      })
      this._AnomListNoGreen = anoms;
      this._AnomListNoGreenWithWON = anomsWons;
      this._AnomListSpare = anomsSpare;

      // console.log("anomsSpare: ", anomsSpare,this._spareAssets);


      // this._AnomListNoGreen = this._AnomList.filter(anom => anom.clr != 1);
      // this._AnomListNoGreenWithWON = this._AnomList.filter(anom => anom.clr != 1 && anom.won != "");

      console.log("AnomListNoGreen: ", this._AnomListNoGreen.length, ", AnomListNoGreenWithWON: ", this._AnomListNoGreenWithWON.length)
    }

    return this._AnomListNoGreen ? this._AnomListNoGreen : [];
  }

  get AnomListNoGreenWithWON(): Array<IAnomalyInfo> {
    return this._AnomListNoGreenWithWON;
  }

  private _AnomListSourceWithWON: boolean = false;
  set AnomListSourceWithWON(value: boolean) {
    this._AnomListSourceWithWON = value;
  }
  get AnomListSourceWithWON(): boolean {
    return this._AnomListSourceWithWON;
  }
  get AnomListSource(): Array<IAnomalyInfo> {
    return this._AnomListSourceWithWON ? this.AnomListNoGreenWithWON : this.AnomListNoGreen;
  }

  get AnomListSpare(): Array<IAnomalyInfo> {
    return this._AnomListSpare;

  }

  private _overrides: Array<IOverride>;
  get overrides(): Array<IOverride> {
    return this._overrides ? this._overrides : [];
  }

  private _symbols: Array<IAssetStatusInfo>;
  get symbols(): Array<IAssetStatusInfo> {
    return this._symbols ? this._symbols : [];
  }

  private itemInfo: any = {};

  info(symId: string): IAssetStatusInfo {
    let item = this.itemInfo[symId];
    if (item != undefined) return item;
    item = this.symbols.find((i) => i.symId == symId);
    this.itemInfo[symId] = item ? item : null;
    return this.itemInfo[symId];
  }

  border(symId: string): string {
    const info = this.info(symId);
    if (!info) return this.CL_GREEN;
    if (!info.border) {
      return info.spare ? this.CL_SECONDARY : this.CL_GREEN;
    }
    return info.border;
  }

  // back(symId: string): string {
  override(symId: string): string {
    const info = this.info(symId);
    if (info && info.ovrUP) return this.CL_LIGHT_BLUE;

    if (!info ? true : !info.color) {
      if (info && !info.color) {
        // default
        // return info.spare ? this.CL_LIGHT_BLUE : this.CL_GREEN;
        return this.CL_GREEN;
      } else {
        return this.CL_GREEN;
      }
    }
    return info.color;
  }

  // override(symId: string): string {
  back(symId: string, linkedId?: string): string {

    const info = this.info(symId);
    if (info && info.ovrUP) return this.CL_LIGHT_BLUE;

    if (!info ? true : !info.override) return this.override(symId);
    return info.override;
  }

  ovr(symId: string): boolean {
    const info = this.info(symId);
    if (!info ? true : !info.override) return false;
    if (info.ovrUP) return false;
    return true;
  }

  fore(symId: string): string {
    const back = this.back(symId);
    if (back == this.CL_GREEN || back == this.CL_RED) {
      return this.CL_LIGHT;
    } else {
      return this.CL_DARK;
    }
  }

  mo(mo: any): string {
    const idx = +mo;
    const mos = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return mos[idx - 1];
  }
  dateStr(str: string): string {
    // return str;
    if (!str) return '';
    if (str.length != 8) return '';

    const yr = str.substr(0, 4);
    const mo = str.substr(4, 2);
    const dy = str.substr(6, 2);

    // return `${mo}-${str.substr(4,2)}-${yr}`;
    return `${dy}-${this.mo(mo).substr(0, 3)}-${yr}`;
  }

  NotesClick(anom: IAnomalyInfo) {
    console.log("Asset id: ", anom.id, anom.won);
    const ref = this.dialog.open(NotesPopupComponent, {
      minWidth: `480px`,
      maxWidth: '480px',
      maxHeight: `240px`,
      minHeight: `240px`,
      disableClose: true,
      data: {
        title: 'Commentary',
        info: anom,
        ds: this
      },
    });
  }

  ProcessClick(symId: string, linkedSymbolId?: string) {

    const info = this.info(symId);
    if (!info) {
      console.log(symId, this.symbols);

      return;
    }
    //console.log(info); return;

    const linkedSymbol = linkedSymbolId ? this.symbols.find(s => s.symId == linkedSymbolId) : null;

    const ref = this.dialog.open(AnomaliesPopupComponent, {
      minWidth: `800px`,
      maxWidth: '800px',
      maxHeight: `480px`,
      minHeight: `480px`,
      disableClose: true,
      data: {
        // data belonging to popup
        // component: {
        //   component: PromptComponent,
        //   data: {
        //     message: message,
        //     icon: icon,
        //     icon_color: icon_color,
        //     action: action,
        //   },
        // },
        title: 'Anomalies',
        info: info,
        ds: this,
        linked: linkedSymbol
        // buttons: buttons ? buttons : [],
        // icon: icon,
        // buttonClick: form.PromptButtonClick,
      },
    });
  }

  FormatDesc(desc: string): string {
    return '<br/>' + desc.replace(/\n/gi, '<br>');
  }

  OpenAnomaly(anomid: any, dialog?: any) {
    if (dialog) dialog.close();
    if (window.parent['GotoAnomaly']) {
      window.parent['GotoAnomaly'](anomid);
    } else {
      alert('GotoAnomaly anomaly function does not exist in the parent page.');
    }
  }

  public postingNotes: boolean = false;
  PostNotes(anomObj: IAnomalyInfo, comment: string, onSuccess: Function, onError: Function) {
    this.postingNotes = true;
    const fd = new FormData();

    fd.append('anomid', anomObj.id);
    fd.append('comm', comment);

    const obs = this.http.post(this._commentary_url, fd, {
      reportProgress: true,
      observe: 'events',
    });

    const subs = obs.subscribe(
      (event) => {
        if (event.type === HttpEventType.Response) {
          const body: any = event.body;
          onSuccess(event, anomObj);
          this.postingNotes = false;
        }
        if (this._log_post) console.log("RawEvent from server: ", event);
      },
      (err) => {
        console.log("Error from server: ", err);
        onError(err);
        this.postingNotes = false;
      },
      () => {
        console.log('***** Commentary Complete! *****');
        subs.unsubscribe();
        this.postingNotes = false;
      }
    );


  }

  public postingOverrides: boolean = false;
  PostOverride(aid: any, clr: any, just: string, up: number, onSuccess: Function, onError: Function) {
    this.postingOverrides = true;
    const fd = new FormData();

    fd.append('aid', aid);
    fd.append('clr', clr);
    fd.append('just', just);
    fd.append('up', String(up));

    // console.log("Post Data: ", fd.get('aid'), this.symbols)

    //
    const assSyms = this.symbols.filter(sym => sym.assetId == aid)

    const obs = this.http.post(this._override_url, fd, {
      reportProgress: true,
      observe: 'events',
    });

    const subs = obs.subscribe(
      (event) => {
        if (event.type === HttpEventType.Response) {
          const body: any = event.body;
          onSuccess(event, assSyms);
          this.postingOverrides = false;
        }
        if (this._log_post) console.log("RawEvent from server: ", event);
      },
      (err) => {
        console.log("Error from server: ", err);
        onError(err);
        this.postingOverrides = false;
      },
      () => {
        console.log('***** Override Complete! *****');
        subs.unsubscribe();
        this.postingOverrides = false;
      }
    );
  }

  openSnackBar(
    message: string,
    action?: string,
    duration?: number,
    horizontalPosition?: any,
    verticalPosition?: any
  ) {
    if (!horizontalPosition) horizontalPosition = 'end';
    if (!verticalPosition) verticalPosition = 'bottom';
    if (!duration) duration = 500;

    this.snackBar.open(message, action ? action : '', {
      duration: duration,
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
      panelClass: 'custom-class',
    });
  }
}
