import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UnitOption {
  id: number;
  shortName: string;
  description: string;
  active: boolean;
}

export interface OthersRecord {
  id: number;
  description: string;
  unit: UnitOption;
  quantity: number;
  deleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OthersRequest {
  description: string;
  unitId: number;
  quantity: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class OthersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  getUnits(): Observable<UnitOption[]> {
    return this.http.get<UnitOption[]>(`${this.apiUrl}/units`);
  }

  getOthers(page = 0, size = 5): Observable<PageResponse<OthersRecord>> {
    return this.http.get<PageResponse<OthersRecord>>(
      `${this.apiUrl}/others`,
      { params: { page, size } }
    );
  }

  getOther(id: number): Observable<OthersRecord> {
    return this.http.get<OthersRecord>(`${this.apiUrl}/others/${id}`);
  }

  createOther(request: OthersRequest): Observable<OthersRecord> {
    return this.http.post<OthersRecord>(`${this.apiUrl}/others`, request);
  }

  updateOther(id: number, request: OthersRequest): Observable<OthersRecord> {
    return this.http.put<OthersRecord>(`${this.apiUrl}/others/${id}`, request);
  }

  deleteOther(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/others/${id}`);
  }

  getAuditHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/others/${id}/audit`);
  }
}