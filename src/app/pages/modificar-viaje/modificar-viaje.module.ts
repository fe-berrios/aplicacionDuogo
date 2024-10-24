import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarViajePageRoutingModule } from './modificar-viaje-routing.module';

import { ModificarViajePage } from './modificar-viaje.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ModificarViajePageRoutingModule
  ],
  declarations: [ModificarViajePage]
})
export class ModificarViajePageModule {}
