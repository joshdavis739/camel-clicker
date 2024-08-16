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
    this.canBuyHand$ = this.points$.pipe(map(x => x >= this.hand.cost));
    this.canBuyFoot$ = this.points$.pipe(map(x => x >= this.foot.cost));
    interval(1000).pipe(tap(x => this.points$.next(this.points$.value + this.totalCps()))).subscribe();
  }


  public points$ = new BehaviorSubject<number>(0);
  public canBuyHand$: Observable<boolean>;
  public canBuyFoot$: Observable<boolean>;

  public onCamelClick() {
    this.points$.next(this.points$.value + 1);
  }

  public buyHand() {
    if (this.hand.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.hand.cost);
    this.hand.amount++;
    this.hand.cost += this.hand.costIncrease;
  }

  public buyFoot() {
    if (this.foot.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.foot.cost);
    this.foot.amount++;
    this.foot.cost += this.foot.costIncrease;
  }

  public totalCps() {
    return this.hand.amount * this.hand.cps + this.foot.amount * this.foot.cps;
  }

  public hand: Item = {
    name: "Hand",
    amount: 0,
    cost: 10,
    cps: 1,
    costIncrease: 1
  }

  public foot: Item = {
    name: "Foot",
    amount: 0,
    cost: 20,
    cps: 2,
    costIncrease: 2
  }
}

export interface Item {
  name: string;
  amount: 0;
  cost: number;
  cps: number;
  costIncrease: number;
}
