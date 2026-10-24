import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface BuildingRequest {
  buildingDescription: string;
  builtUpArea: number | null;
  numberOfFloors: number | null;
  numberOfBasements: number | null;
  maintenanceType: string;
  buildingActivity: string;
  workId?: number;
}
export interface BuildingRecord extends BuildingRequest {
  id: number;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface DropdownOption {
  id: number;
  category: string;
  label: string;
  active: boolean;
  value?: string;
}
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
@Injectable({ providedIn: 'root' })
export class BuildingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/buildings';
  getAllBuildings(
    page = 0,
    size = 10,
  ): Observable<PageResponse<BuildingRecord> | BuildingRecord[]> {
    return this.http.get<PageResponse<BuildingRecord> | BuildingRecord[]>(this.apiUrl, {
      params: new HttpParams().set('page', page).set('size', size),
    });
  }
  createBuilding(data: BuildingRequest): Observable<BuildingRecord> {
    return this.http.post<BuildingRecord>(this.apiUrl, data);
  }
  updateBuilding(id: number, data: BuildingRequest): Observable<BuildingRecord> {
    return this.http.put<BuildingRecord>(`${this.apiUrl}/${id}`, data);
  }
  deleteBuilding(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getOptions(category: string): Observable<DropdownOption[]> {
    return this.http
      .get<DropdownOption[]>(`${this.apiUrl}/options`, {
        params: new HttpParams().set('category', category),
      })
      .pipe(
        map((options) =>
          options
            .filter((option) => option.active)
            .map((option) => ({ ...option, value: option.label })),
        ),
      );
  }
  getAuditHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/audit`);
  }
}
