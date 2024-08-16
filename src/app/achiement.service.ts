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
      description: 'You clicked the camel... What do you want, a cookie?',
      unlocked: false
    },
    {
      key: '100',
      name: 'Private',
      description: 'Reach 100 points',
      unlocked: false
    },
    {
      key: '10000',
      name: 'Lieutenant',
      description: 'Reach 10,000 points',
      unlocked: false
    },
    {
      key: '1000000',
      name: 'Major',
      description: 'Reach 1,000,000 points',
      unlocked: false
    },
    {
      key: '100000000',
      name: 'General',
      description: 'Reach 100,000,000 points',
      unlocked: false
    },
    {
      key: '10000000000',
      name: 'Nerd',
      description: 'Reach 10,000,000,000 points',
      unlocked: false
    },
    {
      key: '1000000000000',
      name: 'Don\'t you have work to do?',
      description: 'Reach 1,000,000,000,000 points',
      unlocked: false
    },
    {
      key: 'click-achiement',
      name: 'This isn\'t clickable',
      description: 'Click the achievement pop-up',
      unlocked: false
    },
    {
      key: 'click-sonic',
      name: 'Carpal tunnel',
      description: 'Reach click speed > 15',
      unlocked: false
    },
    {
      key: 'cheater',
      name: 'You\'re definitely cheating',
      description: 'Reach click speed > 100',
      unlocked: false
    },
    {
      key: 'handy',
      name: 'That\'s handy',
      description: 'Outsource your camel pats by buying a hand',
      unlocked: false
    },
    {
      key: 'light-work',
      name: 'Light work',
      description: 'Have 100 hands on the go',
      unlocked: false
    },
  ]
}

export interface Achievement {
  key: string;
  name: string;
  unlocked: boolean;
  description: string;
}
