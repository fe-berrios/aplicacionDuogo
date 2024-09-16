import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngresarVehiculoPageRoutingModule } from './ingresar-vehiculo-routing.module';

import { IngresarVehiculoPage } from './ingresar-vehiculo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresarVehiculoPageRoutingModule
  ],
  declarations: [IngresarVehiculoPage]
})
export class IngresarVehiculoPageModule {}
