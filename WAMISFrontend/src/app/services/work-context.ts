import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WorkContext {
  workId: number | null = null;
}
