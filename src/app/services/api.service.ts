import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiKey: string = 'BYAe/7Uid7Z8PLnN6IyGUg==bfjuXEusaLUEtP60';
  private baseUrl: string = 'https://private-anon-cc6e00aed5-carsapi1.apiary-mock.com/';

  constructor(private http: HttpClient) { }

  getManufacturers(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer YOUR_API_KEY', // Cambia por tu API Key si es necesaria
    });

    const url = `${this.baseUrl}/manufacturers`;
    return this.http.get(url, { headers });
  }

}
