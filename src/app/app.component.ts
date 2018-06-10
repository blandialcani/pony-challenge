import { Component } from '@angular/core';
import { Game, PonyService } from './pony/pony.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AppAnimations } from './app.animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [ AppAnimations.newGame, AppAnimations.game]
})
export class AppComponent {
  public form;
  public id: string;
  public ponies  = [
    {id: 'twilight_sparkle', description: 'Twilight Sparkle'},
    {id: 'rainbow_dash', description: 'Rainbow Dash'},
    {id: 'rarity', description: 'Rarity'},
    {id: 'fluttershy', description: 'Fluttershy'},
    {id: 'pinkie_pie', description: 'Pinkie Pie'}
  ];

  ngOnInit(){
    this.form = new FormGroup({
      width:   new FormControl(15, [Validators.required, Validators.min(15), Validators.max(25)]),
      height:   new FormControl(15, [Validators.required, Validators.min(15), Validators.max(25)]),
      pony:   new FormControl(undefined, [Validators.required]),
      difficulty:   new FormControl(0, [Validators.required, Validators.min(0), Validators.max(10)]),
    });
  }

  constructor(private ponyService: PonyService){}

  public startGame(){
    if(this.form.invalid) return;
    let form = this.form.value;
    let game: Game = {
      "maze-width": form.width,
      "maze-height": form.height,
      "maze-player-name": form.pony.description,
      difficulty: form.difficulty,
    }
    this.ponyService.createGame(game).subscribe((response: any) => {
      this.id = response.maze_id;
    });
  }
}
