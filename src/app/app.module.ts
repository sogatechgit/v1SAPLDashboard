import { AnomaliesPopupComponent } from './cmp/dashboard/anomalies-popup.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MaterialModule } from './material.module';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DashboardComponent } from './cmp/dashboard/dashboard.component';
import { SymbolAComponent } from './cmp/dashboard/symbol-a.component';
import { SymbolBComponent } from './cmp/dashboard/symbol-b.component';
import { SymbolCComponent } from './cmp/dashboard/symbol-c.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProgressMaskComponent } from './cmp/progress-mask/progress-mask.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SymbolAComponent,
    SymbolBComponent,
    SymbolCComponent,
    AnomaliesPopupComponent,
    ProgressMaskComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
