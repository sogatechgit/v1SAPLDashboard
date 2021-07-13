import { DataService } from './../../svc/data.service';
import { IAssetStatusInfo } from './dashboard.component';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-anomalies-popup',
  templateUrl: './anomalies-popup.component.html',
  styleUrls: ['./anomalies-popup.component.scss'],
})
export class AnomaliesPopupComponent implements OnInit, AfterViewInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AnomaliesPopupComponent>
  ) { }

  @ViewChild('just') just: ElementRef;

  _ovrJust: string;
  _ovrClr: number;
  _ovrUP: number = 0;

  ngOnInit(): void {
    this._ovrClr = this.info.ovrClr;
    this._ovrUP = this.info.ovrUP;
    // this._ovrJust = this.info.ovrJust;
  }

  ngAfterViewInit() {
    // console.log(this.data)
  }

  Close() {
    this.dialogRef.close();
  }

  SetOverride(value: number) {
    if (value == this._ovrClr) {
      // clear override
      this._ovrClr = -1;
    } else {
      this._ovrClr = value;
    }
  }

  ToggleUP(){
    this._ovrUP = this._ovrUP ? 0 : 1;
  }

  Submit() {

    //if (this.info.anoms.length == 0) return;
    const noAnom = (this.info.anoms.length == 0);

    let ovrVal: number =noAnom ? -1 : this._ovrClr;
    let ovrUP: number = this._ovrUP;
    let ovrJust: string =noAnom ? '' : this.just.nativeElement.value;
    const clear: boolean = ovrVal == -1;

    this.ds.PostOverride(
      this.info.assetId,
      ovrVal,
      ovrJust,
      ovrUP,
      (event, symbols?) => {
        console.log('Override event: ', event);
        const { body } = event;
        //this.ds.openSnackBar("Status override set: " + err.message,'x',3000)
        this.info.ovrUP = this._ovrUP;
        if (clear) {
          this.ds.openSnackBar(
            `Status override for ${this.info.label} removed`,
            'x',
            3000
          );
        } else {
          
          this.ds.openSnackBar(
            `Status override for ${this.info.label} set to ${this.ds.colorNames[ovrVal - 1]
            }`,
            'x',
            3000
          );
        }

        ovrVal = clear ? -1 : body.clr;
        ovrJust = clear ? '' : body.just;
        let ovr = clear ? '' : this.ds.colors[ovrVal - 1];

        if (symbols) {

          symbols.forEach(sym => {
            sym.ovrClr = ovrVal;
            sym.override = ovr;
            sym.ovrJust = ovrJust;
          });

        } else {

          this.info.ovrClr = ovrVal;
          this.info.override = ovr;
          this.info.ovrJust = ovrJust;

        }


        this.dialogRef.close();
      },
      (err) => {
        console.log('Override error: ', err);
        this.ds.openSnackBar('Override Error: ' + err.message, 'x', 3000);
      }
    );
  }

  get title(): string {
    if (this.data.linked) return this.data.linked.label.replace(/<br\/>/gi,' ');
    return this.info.label.replace(/<br\/>/gi,' ');
  }

  get withAnoms(): boolean {
    if (!this.info) return false;
    if (!this.info.anoms) return false;
    return this.info.anoms.length != 0
  }

  UPClass():any{
    return {
      fa: true,
      'fa-toggle-off': this._ovrUP == null || this._ovrUP == undefined || this._ovrUP == 0, 
      'fa-toggle-on': this._ovrUP == 1,
    }
  }

  SwitchClass(value: number): any {
    return {
      fa: true,
      // 'fa-toggle-on': this.info.ovrClr == value && this.info.anoms.length != 0,
      // 'fa-toggle-off': this.info.ovrClr != value || this.info.anoms.length == 0,
      'fa-toggle-on': this._ovrClr == value && this.withAnoms,
      'fa-toggle-off': this._ovrClr != value || !this.withAnoms,
      disable: !this.withAnoms,
    };
  }

  get info(): IAssetStatusInfo {
    return this.data.info;
  }

  get ds(): DataService {
    return this.data.ds;
  }
}
