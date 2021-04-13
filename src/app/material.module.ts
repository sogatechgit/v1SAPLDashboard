import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Angular Materials
import { MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatMenuModule} from '@angular/material/menu';

import {MatSnackBarModule} from '@angular/material/snack-bar';

// Datepicker deependencies
import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { MatNativeDateModule } from '@angular/material/core';

const MaterialModules = [

  ScrollingModule,
  DragDropModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatCheckboxModule,
  MatChipsModule,
  MatTooltipModule,
  MatIconModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatDatepickerModule,
  // MatMomentDateModule,
  MatNativeDateModule,
  MatExpansionModule,
  MatSnackBarModule,
  MatMenuModule
];

@NgModule({
  declarations: [],
  imports: [MaterialModules],
  exports: [MaterialModules],
})
export class MaterialModule {}
