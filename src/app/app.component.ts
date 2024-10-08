import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject, interval, map, min, Observable, Subject, tap } from 'rxjs';
import { AchiementService } from './achiement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('300ms ease-in-out', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('300ms ease-in-out', style({transform: 'translateX(-100%)', opacity: 0}))
        ])
      ]
    )
  ],
})
export class AppComponent implements OnInit {
  title = 'camel-clicker';
  myAudio: HTMLAudioElement;

  achievementService = inject(AchiementService);

  showAchiement$ = new BehaviorSubject(false);
  recentAchevemten: string = '';

  onachclick() {
    this.achievementService.ensureAchiement('click-achiement');
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.points$.next(Number(localStorage.getItem('points')));

    this.canBuyHand$ = this.points$.pipe(map(x => x >= this.hand.cost));
    this.canUpgradeHand$ = this.points$.pipe(map(x => x >= this.hand.upgradeCost));

    this.canBuyEngineer$ = this.points$.pipe(map(x => x >= this.engineer.cost));
    this.canUpgradeEngineer$ = this.points$.pipe(map(x => x >= this.engineer.upgradeCost));

    this.canBuyAi$ = this.points$.pipe(map(x => x >= this.ai.cost));
    this.canUpgradeAi$ = this.points$.pipe(map(x => x >= this.ai.upgradeCost));

    interval(1000).pipe(tap(x => this.setPoints(Math.round(this.points$.value + this.totalCps())))).subscribe();

    this.myAudio = new Audio('../assets/Not ready to camel.mp3');
    this.myAudio.addEventListener('timeupdate', function(){
      var buffer = .44
      if(this.currentTime > this.duration - buffer){
          this.currentTime = 0
          this.play()
      }
    });

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

    // Change the min spin speed if has upgrades.
    if (this.totalCps() > 0) {
      this.minSpeed = this.minSpeedWithUpgrade;

      this.spinSpeed = this.minSpeed + (this.maxSpeed - this.minSpeed) * (this.clickCount / 160);
      if (this.spinSpeed < this.minSpeed) {
        this.spinSpeed = this.minSpeed;
      } else if (this.spinSpeed > this.maxSpeed) {
        this.spinSpeed = this.maxSpeed;
      }
    }

    this.spin();

    setInterval(() => {
      // Slow down spin code - Gradual slow near end - Based on max spin speed 100.
      if (this.spinSpeed > this.minSpeed) {
        if (this.spinSpeed > 80) {
          this.spinSpeed -= 25;
        }
        else if (this.spinSpeed > 50) {
          this.spinSpeed -= 15;
        }
        else if (this.spinSpeed > 25) {
          this.spinSpeed -= 10;
        }
        else if (this.spinSpeed > 15) {
          this.spinSpeed -= 5;
        }
        else if (this.spinSpeed > 5) {
          this.spinSpeed -= 2;
        }
        else {
          this.spinSpeed -= 1;
        }

        if (this.spinSpeed < this.minSpeed) {
          this.spinSpeed = this.minSpeed;
        }
      }
    }, 500);

    interval(1000).subscribe(() => {
      if (!this.isPowerUp && Math.random() < 0.01)
      {
        this.poewrUpIconLeft = Math.floor(Math.random() * 80);
        this.poewrUpIconTop = Math.floor(Math.random() * 80);
        this.isPowerUpAppear = true;
        setTimeout(() => {
          this.isPowerUpAppear = false;
        }, 3000);
      }
      });
  }

  ngOnInit(): void {
    this.achievementService.onAchivemint.pipe(tap(x => {
      this.showAchiement$.next(true);
      this.recentAchevemten = x.name;
      setTimeout(() => {
        this.showAchiement$.next(false);
      }, 5000)

      this.changeDetectorRef.detectChanges();
      // this._snackBar.open(x.name, 'Close');
    })).subscribe();

    this.points$.pipe(tap(x => {
      if (x > 100) {
        this.achievementService.ensureAchiement('100');
      }
      if (x > 10000) {
        this.achievementService.ensureAchiement('10000');
      }
      if (x > 1000000) {
        this.achievementService.ensureAchiement('1000000');
      }
      if (x > 100000000) {
        this.achievementService.ensureAchiement('100000000');
      }
      if (x > 10000000000) {
        this.achievementService.ensureAchiement('10000000000');
      }
      if (x > 1000000000000) {
        this.achievementService.ensureAchiement('1000000000000');
      }
    })).subscribe();
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
  public isPowerUp: boolean = false;
  public isPowerUpAppear: boolean = false;
  public poewrUpIconLeft: number = 0;
  public poewrUpIconTop: number = 0;

  private minSpeed: number = 0; // Minimum spin speed
  private minSpeedWithUpgrade: number = 5;
  private maxSpeed: number = 100; // Maximum spin speed
  private spinSpeed: number = 0; // Initial spin speed
  public angle: number = 0; // Initial angle

  public onCamelClick($event: MouseEvent) {
    this.myAudio.play();
    this.achievementService.ensureAchiement('click-camel');

    if (this.isSpinning) {
      this.points$.next(this.points$.value + this.hand.amount + 2);
    }
    else
    {
      this.points$.next(this.points$.value + this.hand.amount + 1);
    }

    this.clickCount++;


    // Calculate click speed
    // const currentTime = Date.now();
    // if (this.lastClickTime !== 0) {
    //   this.clickSpeed = 1000 / (currentTime - this.lastClickTime);
    //   this.spinDuration = 1 / this.clickSpeed;
    // }
    // this.lastClickTime = currentTime;

    // setTimeout(() => {
    //     this.clickCount--;
    //     if (this.clickCount === 0) {
    //         this.isSpinning = false;
    //     }
    // }, 1000 * this.clickCount);

     // Thank you chat gpt for this
    // Create a new div element
    const newDiv = document.createElement('img');

    // Set the position and style of the new div

    var yPosOFf = (Math.random() * 2 - 1) * 50;
    setTimeout(() => {

      newDiv.style.transition = '1s'
      newDiv.style.opacity ='0'
      newDiv.style.top = 'calc(' + $event.clientY + 'px - 140px + ' + yPosOFf + 'px)';
    },2)
    newDiv.src = "../assets/cash-money.png";
    newDiv.style.left = 'calc(' + $event.clientX + 'px - 40px + ' + (Math.random() * 2 - 1) * 50 + 'px)';
    newDiv.style.top = 'calc(' + $event.clientY + 'px - 40px + ' + yPosOFf + 'px)';
    newDiv.style.zIndex = '99';
    newDiv.style.position = 'absolute';
    newDiv.style.width = '80px';
    newDiv.style.height = '80px';
    newDiv.style.pointerEvents = 'none';

    // Add the new div to the body
    document.body.appendChild(newDiv);



    let currentTime = new Date().getTime();

    // If the current click is within 1 second of the last click, increment the click count
    if (currentTime - this.lastClickTime < 1000) {
      this.clickCount++;
    }
    // If the current click is more than 1 second after the last click, reset the click count
    else {
      this.clickCount = 1;
    }

    // Update the spin speed based on the click count
    this.spinSpeed = this.minSpeed + (this.maxSpeed - this.minSpeed) * (this.clickCount / 160);
    if (this.spinSpeed < this.minSpeed) {
      this.spinSpeed = this.minSpeed;
    } else if (this.spinSpeed > this.maxSpeed) {
      this.achievementService.ensureAchiement('maximum-camel-velocity');
      this.spinSpeed = this.maxSpeed;
    }

    if (this.lastClickTime !== 0) {
      this.clickSpeed = 1000 / (currentTime - this.lastClickTime);
      if (this.clickSpeed > 75) {
        this.achievementService.ensureAchiement('click-sonic');
      }
      this.spinDuration = 1 / this.clickSpeed;
    }

    // Update the last click time
    this.lastClickTime = currentTime;
  }

  private spin() {
    // Update the angle
    console.log('spinSpeed', this.spinSpeed);
    this.angle += this.spinSpeed;

    // Request the next frame

       setTimeout(() => {
        requestAnimationFrame(this.spin.bind(this));
    }, 10);
  }

  public onPowerUpClick() {
    this.isPowerUpAppear = false;
    this.achievementService.ensureAchiement('star');

    if (this.isPowerUp) {
      return;
    }

    this.isPowerUp = true;

    setTimeout(() => {
        this.isPowerUp = false;
    }, 15000);
  }

  private checkInactivity() {
    const currentTime = Date.now();
    if (currentTime - this.lastClickTime > 5000) { // 5 seconds of inactivity
      this.spinDuration = 3; // Set spin duration to 3 second
    }
  }

  private bootUpTheCamel() {
    this.minSpeed = this.minSpeedWithUpgrade;
    this.spinSpeed = this.minSpeedWithUpgrade;
    if (this.spinSpeed < this.minSpeed) {
      this.spinSpeed = this.minSpeed;
    } else if (this.spinSpeed > this.maxSpeed) {
      this.spinSpeed = this.maxSpeed;
    }
  }

  public buyHand() {
    if (this.hand.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.hand.cost);
    this.hand.amount++;
    this.hand.cost = Math.round(this.hand.cost * 1.15);

    this.bootUpTheCamel();

    localStorage.setItem('handAmount', String(this.hand.amount));
    localStorage.setItem('handCost', String(this.hand.cost));

    this.achievementService.ensureAchiement('handy');
    if (this.hand.amount > 99) {
      this.achievementService.ensureAchiement('light-work');
    }
  }

  public buyEngineer() {
    if (this.engineer.cost > this.points$.value) {
      return;
    }

    this.points$.next(this.points$.value - this.engineer.cost);
    this.engineer.amount++;
    this.engineer.cost += Math.round(this.engineer.cost * 1.15);
    this.bootUpTheCamel();
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
    this.bootUpTheCamel();
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
    var cps = this.hand.amount * this.hand.cps + this.engineer.amount * this.engineer.cps
    if (this.isSpinning) {
      cps *= 2;
    }
    if (this.isPowerUp)
    {
      cps *= 4;
    }
    return cps;
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
