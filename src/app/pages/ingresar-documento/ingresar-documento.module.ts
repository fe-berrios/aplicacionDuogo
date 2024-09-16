import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngresarDocumentoPageRoutingModule } from './ingresar-documento-routing.module';

import { IngresarDocumentoPage } from './ingresar-documento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresarDocumentoPageRoutingModule
  ],
  declarations: [IngresarDocumentoPage]
})
export class IngresarDocumentoPageModule {}
