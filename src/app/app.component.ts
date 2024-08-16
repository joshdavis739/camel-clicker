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
    this.canUpgradeHand$ = this.points$.pipe(map(x => x >= this.hand.upgradeCost));

    this.canBuyEngineer$ = this.points$.pipe(map(x => x >= this.engineer.cost));
    this.canUpgradeEngineer$ = this.points$.pipe(map(x => x >= this.engineer.upgradeCost));

    this.canBuyAi$ = this.points$.pipe(map(x => x >= this.ai.cost));
    this.canUpgradeAi$ = this.points$.pipe(map(x => x >= this.ai.upgradeCost));

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

    this.engineer.amount = Number(localStorage.getItem('engineerAmount'));
    var engineerCost = localStorage.getItem('engineerCost')
    if (engineerCost) this.engineer.cost = Number(engineerCost);
    var engineerLevel = localStorage.getItem('engineerLevel')
    if (engineerLevel) this.engineer.level = Number(engineerLevel);
    var engineerCps = localStorage.getItem('engineerCps')
    if (engineerCps) this.engineer.cps = Number(engineerCps);
    var engineerUpgradeCost = localStorage.getItem('engineerUpgradeCost')
    if (engineerUpgradeCost) this.engineer.upgradeCost = Number(engineerUpgradeCost);

    this.ai.amount = Number(localStorage.getItem('aiAmount'));
    var aiCost = localStorage.getItem('aiCost')
    if (aiCost) this.ai.cost = Number(aiCost);
    var aiLevel = localStorage.getItem('aiLevel')
    if (aiLevel) this.ai.level = Number(aiLevel);
    var aiCps = localStorage.getItem('aiCps')
    if (aiCps) this.ai.cps = Number(aiCps);
    var aiUpgradeCost = localStorage.getItem('aiUpgradeCost')
    if (aiUpgradeCost) this.ai.upgradeCost = Number(aiUpgradeCost);

    interval(1000).subscribe(() => this.checkInactivity());
  }

  public points$ = new BehaviorSubject<number>(0);
  public canBuyHand$: Observable<boolean>;
  public canBuyEngineer$: Observable<boolean>;
  public canBuyAi$: Observable<boolean>;
  public canUpgradeHand$: Observable<boolean>;
  public canUpgradeEngineer$: Observable<boolean>;
  public canUpgradeAi$: Observable<boolean>;
  public isSpinning: boolean = false;
  public clickCount: number = 0;
  public clickSpeed: number = 0;
  public spinDuration: number = 1;
  private lastClickTime: number = 0;

  public onCamelClick() {
    if (this.isSpinning) {
      this.points$.next(this.points$.value + 2);
    }
    else
    {
      this.points$.next(this.points$.value + 1);
    }
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

  private checkInactivity() {
    const currentTime = Date.now();
    if (currentTime - this.lastClickTime > 5000) { // 5 seconds of inactivity
      this.spinDuration = 3; // Set spin duration to 3 second
    }
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

  public buyEngineer() {
    if (this.engineer.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.engineer.cost);
    this.engineer.amount++;
    this.engineer.cost += Math.round(this.engineer.cost * 1.15);
    localStorage.setItem('engineerAmount', String(this.engineer.amount));
    localStorage.setItem('engineerCost', String(this.engineer.cost));
  }

  public buyAi() {
    if (this.ai.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.ai.cost);
    this.ai.amount++;
    this.ai.cost += Math.round(this.ai.cost * 1.15);
    localStorage.setItem('aiAmount', String(this.ai.amount));
    localStorage.setItem('aiCost', String(this.ai.cost));
  }

  public upgradeHand()
  {
    if (this.hand.upgradeCost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.hand.upgradeCost);

    this.upgrade(this.hand);
    localStorage.setItem('handLevel', String(this.hand.level));
    localStorage.setItem('handCps', String(this.hand.cps));
    localStorage.setItem('handUpgradeCost', String(this.hand.upgradeCost));
  }

  public upgradeEngineer()
  {
    if (this.engineer.upgradeCost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.engineer.upgradeCost);

    this.upgrade(this.engineer);
    localStorage.setItem('engineerLevel', String(this.engineer.level));
    localStorage.setItem('engineerCps', String(this.engineer.cps));
    localStorage.setItem('engineerUpgradeCost', String(this.engineer.upgradeCost));
  }

  public upgradeAi()
  {
    if (this.ai.upgradeCost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.ai.upgradeCost);

    this.upgrade(this.ai);
    localStorage.setItem('aiLevel', String(this.ai.level));
    localStorage.setItem('aiCps', String(this.ai.cps));
    localStorage.setItem('aiUpgradeCost', String(this.ai.upgradeCost));
  }

  public upgrade(item: Item) {
    item.level++;
    item.cps *= 1.5;
    item.upgradeCost *= 2;
  }

  public totalCps() {
    if (this.isSpinning) {
      return (this.hand.amount * this.hand.cps + this.engineer.amount * this.engineer.cps) * 2;
    }
    return this.hand.amount * this.hand.cps + this.engineer.amount * this.engineer.cps;
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

  public engineer: Item = {
    name: "Engineer",
    amount: 0,
    cost: 100,
    cps: 15,
    level: 1,
    upgradeCost: 1000
  }

  public ai: Item = {
    name: "AI",
    amount: 0,
    cost: 1000,
    cps: 200,
    level: 1,
    upgradeCost: 10000
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
