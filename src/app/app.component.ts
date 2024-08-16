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
    this.points$.next(Number(localStorage.getItem('points')));
    this.canBuyHand$ = this.points$.pipe(map(x => x >= this.hand.cost));
    this.canBuyFoot$ = this.points$.pipe(map(x => x >= this.foot.cost));

    interval(1000).pipe(tap(x => this.setPoints(this.points$.value + this.totalCps()))).subscribe();

    var myAudio = new Audio('../assets/Not ready to camel.mp3');
    myAudio.addEventListener('timeupdate', function(){
      var buffer = .44
      if(this.currentTime > this.duration - buffer){
          this.currentTime = 0
          this.play()
      }
    });
    myAudio.play();

    this.hand.amount = Number(localStorage.getItem('handAmount'));
    var handCost = localStorage.getItem('handCost')
    if (handCost) this.hand.cost = Number(handCost);
    this.foot.amount = Number(localStorage.getItem('footAmount'));
    var footCost = localStorage.getItem('footCost')
    if (footCost) this.hand.cost = Number(footCost);
  }

  public points$ = new BehaviorSubject<number>(0);
  public canBuyHand$: Observable<boolean>;
  public canBuyFoot$: Observable<boolean>;
  public isSpinning: boolean = false;
  public clickCount: number = 0;

  public onCamelClick() {
    this.points$.next(this.points$.value + 1);
    this.isSpinning = true;
    this.clickCount++;
    setTimeout(() => {
        this.clickCount--;
        if (this.clickCount === 0) {
            this.isSpinning = false;
        }
    }, 1000 * this.clickCount);
  }

  public buyHand() {
    if (this.hand.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.hand.cost);
    this.hand.amount++;
    this.hand.cost += this.hand.costIncrease;
    localStorage.setItem('handAmount', String(this.hand.amount));
    localStorage.setItem('handCost', String(this.hand.cost));
  }

  public buyFoot() {
    if (this.foot.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.foot.cost);
    this.foot.amount++;
    this.foot.cost += this.foot.costIncrease;
    localStorage.setItem('footAmount', String(this.foot.amount));
    localStorage.setItem('footCost', String(this.foot.cost));
  }

  public totalCps() {
    return this.hand.amount * this.hand.cps + this.foot.amount * this.foot.cps;
  }

  public setPoints(points: number) {
    this.points$.next(points);
    localStorage.setItem('points', String(points));
  }

  public hand: Item = {
    name: "Hand",
    amount: 0,
    cost: 10,
    cps: 1,
    costIncrease: 1
  };

  public foot: Item = {
    name: "Foot",
    amount: 0,
    cost: 20,
    cps: 2,
    costIncrease: 2
  };
}

export interface Item {
  name: string;
  amount: number;
  cost: number;
  cps: number;
  costIncrease: number;
}
