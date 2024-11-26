import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private dolarURL: string = 'https://mindicador.cl/api';
  private gatoURL: string = 'https://api.thecatapi.com/v1/images/search';

  constructor(private http: HttpClient) { }

  getGato(){
    return this.http.get(this.gatoURL);
  }

  getDolar(){
    return this.http.get(this.dolarURL);
  }
}
