import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, interval, map, Observable, Subject, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'camel-clicker';

  constructor() {
    this.canBuyHand$ = this.points$.pipe(map(x => x > this.hand.cost));
  }


  public points$ = new BehaviorSubject<number>(0);
  public canBuyHand$: Observable<boolean>;

  public onCamelClick() {
    this.points$.next(this.points$.value + 1);
  }

  public buyHand() {
    if (this.hand.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.hand.cost);
    interval(this.hand.interval * 1000).pipe(tap(x => this.onCamelClick())).subscribe();
  }

  public hand: Item = {
    name: "Hand",
    cost: 100,
    interval: 10
  }
}

export interface Item {
  name: string;
  cost: number;
  interval: number;
}
