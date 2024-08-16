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
    this.canUpgradeHand$ = this.points$.pipe(map(x => x >= this.hand.upgradeCost));
    this.canUpgradeFoot$ = this.points$.pipe(map(x => x >= this.foot.upgradeCost));

    interval(1000).pipe(tap(x => this.setPoints(Math.round(this.points$.value + this.totalCps())))).subscribe();

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
    var handLevel = localStorage.getItem('handLevel')
    if (handLevel) this.hand.level = Number(handLevel);
    var handCps = localStorage.getItem('handCps')
    if (handCps) this.hand.cps = Number(handCps);
    var handUpgradeCost = localStorage.getItem('handUpgradeCost')
    if (handUpgradeCost) this.hand.upgradeCost = Number(handUpgradeCost);

    this.foot.amount = Number(localStorage.getItem('footAmount'));
    var footCost = localStorage.getItem('footCost')
    if (footCost) this.foot.cost = Number(footCost);
    var footLevel = localStorage.getItem('footLevel')
    if (footLevel) this.foot.level = Number(handLevel);
    var footCps = localStorage.getItem('footCps')
    if (footCps) this.foot.cps = Number(footCps);
    var footUpgradeCost = localStorage.getItem('footUpgradeCost')
    if (footUpgradeCost) this.foot.upgradeCost = Number(footUpgradeCost);
  }

  public points$ = new BehaviorSubject<number>(0);
  public canBuyHand$: Observable<boolean>;
  public canBuyFoot$: Observable<boolean>;
  public canUpgradeHand$: Observable<boolean>;
  public canUpgradeFoot$: Observable<boolean>;
  public isSpinning: boolean = false;
  public clickCount: number = 0;
  public clickSpeed: number = 0;
  public spinDuration: number = 1;
  private lastClickTime: number = 0;

  public onCamelClick() {
    this.points$.next(this.points$.value + 1);
    this.isSpinning = true;
    this.clickCount++;

    // Calculate click speed
    const currentTime = Date.now();
    if (this.lastClickTime !== 0) {
      this.clickSpeed = 1000 / (currentTime - this.lastClickTime);
      this.spinDuration = 1 / this.clickSpeed;
    }
    this.lastClickTime = currentTime;

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
    this.hand.cost = Math.round(this.hand.cost * 1.15);
    localStorage.setItem('handAmount', String(this.hand.amount));
    localStorage.setItem('handCost', String(this.hand.cost));
  }

  public buyFoot() {
    if (this.foot.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.foot.cost);
    this.foot.amount++;
    this.foot.cost += Math.round(this.hand.cost * 1.15);
    localStorage.setItem('footAmount', String(this.foot.amount));
    localStorage.setItem('footCost', String(this.foot.cost));
  }

  public upgradeHand()
  {
    this.upgrade(this.hand);
    localStorage.setItem('handLevel', String(this.hand.level));
    localStorage.setItem('handCps', String(this.hand.cps));
    localStorage.setItem('handUpgradeCost', String(this.hand.upgradeCost));
  }

  public upgradeFoot()
  {
    this.upgrade(this.foot);
    localStorage.setItem('footLevel', String(this.foot.level));
    localStorage.setItem('footCps', String(this.foot.cps));
    localStorage.setItem('footUpgradeCost', String(this.foot.upgradeCost));
  }

  public upgrade(item: Item) {
    item.level++;
    item.cps *= 1.5;
    item.upgradeCost *= 2;
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
    level: 1,
    upgradeCost: 50
  }

  public foot: Item = {
    name: "Foot",
    amount: 0,
    cost: 20,
    cps: 2,
    level: 1,
    upgradeCost: 100
  }
}

export interface Item {
  name: string;
  amount: number;
  cost: number;
  cps: number;
  level: number;
  upgradeCost: number;
}
