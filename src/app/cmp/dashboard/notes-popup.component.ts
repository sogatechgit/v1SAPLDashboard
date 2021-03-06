import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/svc/data.service';
import { IAnomalyInfo } from './dashboard.component';

@Component({
  selector: 'app-notes-popup',
  templateUrl: './notes-popup.component.html',
  styleUrls: ['./notes-popup.component.scss']
})
export class NotesPopupComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NotesPopupComponent>
  ) { }

  @ViewChild('comm') comm:ElementRef;
  ngOnInit(): void {
  }

  get ds():DataService{
    return this.data.ds;
  }

  get info():IAnomalyInfo{
    return this.data.info;
  }

  Submit(){
    
    let commentary: string = this.comm.nativeElement.value;

    this.ds.PostNotes(
      this.info,
      commentary,
      (event, symbols?) => {
        console.log('Override event: ', event);
        const { body } = event;
        const { status, error } = body;
        const { id } = this.info;

        if(status == 'success'){
          this.ds.openSnackBar( `Anomaly commentary saved.`, 'x', 3000);

          const allAnoms = this.ds._AnomList.filter(anom=>(anom.id == id));
          allAnoms.forEach(an=>an.comm = commentary);

          console.log("Update anomaly recs: ", allAnoms, this.ds._AnomList, this.info, id);


        }else{
          this.ds.openSnackBar( `Error posting commentary. ${error}`, 'x', 3000);
        }

        this.dialogRef.close();
      },
      (err) => {
        console.log('Override error: ', err);
        this.ds.openSnackBar('Override Error: ' + err.message, 'x', 3000);
      }
    );
  }

}
