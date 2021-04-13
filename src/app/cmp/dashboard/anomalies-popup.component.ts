import { DataService } from './../../svc/data.service';
import { IAnomalyInfo, IAssetStatusInfo } from './dashboard.component';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-anomalies-popup',
  templateUrl: './anomalies-popup.component.html',
  styleUrls: ['./anomalies-popup.component.scss'],
})
export class AnomaliesPopupComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AnomaliesPopupComponent>
  ) {}

  ngOnInit(): void {}

  Close() {
    this.dialogRef.close();
  }

  SetOverride(value: number) {

    if(this.info.anoms.length == 0) return;

    let ovrVal: number = this.info.ovrClr == value ? -1 : value;
    let clear: boolean = ovrVal == -1;

    this.ds.PostOverride(
      this.info.assetId,
      ovrVal,
      (event) => {
        console.log('Override event: ', event);
        //this.ds.openSnackBar("Status override set: " + err.message,'x',3000)
        if (clear) {
          this.ds.openSnackBar(
            `Status override for ${this.info.label} removed`,
            'x',
            3000
          );
        } else {
          this.ds.openSnackBar(
            `Status override for ${this.info.label} set to ${
              this.ds.colorNames[ovrVal - 1]
            }`,
            'x',
            3000
          );
        }

        if (clear) {
          this.info.ovrClr = -1;
          this.info.override = '';
        } else {
          this.info.ovrClr = ovrVal;
          this.info.override = this.ds.colors[ovrVal - 1];
        }

        this.dialogRef.close();
      },
      (err) => {
        console.log('Override error: ', err);
        this.ds.openSnackBar('Override Error: ' + err.message, 'x', 3000);
      }
    );
  }

  SwitchClass(value: number): any {
    return {
      fa: true,
      'fa-toggle-on': this.info.ovrClr == value && this.info.anoms.length != 0,
      'fa-toggle-off': this.info.ovrClr != value || this.info.anoms.length == 0,
      disable: this.info.anoms.length == 0,
    };
  }

  get info(): IAssetStatusInfo {
    return this.data.info;
  }

  get ds(): DataService {
    return this.data.ds;
  }
}
