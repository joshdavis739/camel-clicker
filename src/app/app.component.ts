import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'camel-clicker';

  public points$ = new BehaviorSubject<number>(0);

  public onClick() {
    this.points$.next(this.points$.value + 1);
  }
}
