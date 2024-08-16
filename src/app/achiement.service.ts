import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AchiementService {

  constructor() {
    var achiements = localStorage.getItem('achiements')
    if (achiements) this.achievements = JSON.parse(achiements);}

  ensureAchiement(key: string) {
    var achievement = this.achievements.find(x => x.key === key);
    if (!achievement) {
      return;
    }

    if (!achievement.unlocked) {
      achievement.unlocked = true;
      this.onAchivemint.next(achievement);
    }

    localStorage.setItem('achiements', JSON.stringify(this.achievements));
  }

  public onAchivemint = new Subject<Achievement>();

  achievements: Achievement[] = [
    {
      key: 'click-camel',
      name: 'Click the camel',
      unlocked: false
    },
    {
      key: '100',
      name: 'Reach 100 points',
      unlocked: false
    },
    {
      key: 'click-achiement',
      name: 'Click the achievement pop-up',
      unlocked: false
    }
  ]
}

export interface Achievement {
  key: string;
  name: string;
  unlocked: boolean;
}
