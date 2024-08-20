import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WjGridModule } from '@grapecity/wijmo.angular2.grid';
import { AngularSplitModule } from 'angular-split';

import { AppComponent } from './app.component';
import { MethodService } from './services/method.service';
import { HttpClientModule } from '@angular/common/http';
import { WatFlexGridComponent } from './components/wat-flexgrid/wat-flexgrid.component';

@NgModule({
  declarations: [
    AppComponent,
    WatFlexGridComponent
  ],
  imports: [
    BrowserModule,
    WjGridModule,
    FormsModule,
    HttpClientModule,
    AngularSplitModule,
  ],
  exports: [WatFlexGridComponent],
  providers: [
    MethodService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }

}
