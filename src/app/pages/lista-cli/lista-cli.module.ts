import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaCliPageRoutingModule } from './lista-cli-routing.module';

import { ListaCliPage } from './lista-cli.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaCliPageRoutingModule
  ],
  declarations: [ListaCliPage]
})
export class ListaCliPageModule {}
