import {Injectable, EventEmitter} from '@angular/core';
import {Subject, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * 首页设施分层
 */
export class FacilityShowService {
  public subject: Subject<any>;

  constructor() {
    this.subject = new Subject<any>();
  }
}
