import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EsperaPageRoutingModule } from './espera-routing.module';

import { EsperaPage } from './espera.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EsperaPageRoutingModule
  ],
  declarations: [EsperaPage]
})
export class EsperaPageModule {}
