import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { PonyService, Game, Move } from './pony.service';
import { identifierModuleUrl } from '@angular/compiler';

const convertData = (coordinate) => {
  switch (coordinate.length) {
    case 0: return [false, false];
    case 2: return [true, true];
    case 1: {
      if (coordinate[0] == 'north')
        return [true, false]
      else
        return [false, true]
    }
  }
}

@Component({
  selector: 'app-pony',
  templateUrl: './pony.component.html',
  styleUrls: ['./pony.component.scss'],
  providers: [PonyService]
})
export class PonyComponent implements OnInit, AfterViewInit {
  public baseHref = 'https://ponychallenge.trustpilot.com';
  public game: any = {
    "game-state": { state: 'Active' }
  };

  @Input() pony: string = 'strawberry_blush';
  @Output() idChange = new EventEmitter<string>();

  private _id: string;
  @Input() set id(id: string) {
    this._id = id;
    this.getGame();
  }
  get id() { return this._id; }

  @Input() width;
  @Input() height;
  @ViewChild('canvas') canvas: ElementRef;
  public context: CanvasRenderingContext2D;

  constructor(private ponyService: PonyService) {
  }

  ngAfterViewInit(): void {
    this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
  }
  ngOnInit() {
  }
  getGame() {
    this.ponyService.getGame(this.id).subscribe((game: any) => {
      game.data = game.data.map(convertData);
      this.game = game;
      this.drawGame(game);
    });
  }

  startNewGame(){
    this.idChange.emit(undefined);
  }

  drawGame(game) {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    let lineLength = 25;
    let start = 10;
    game.data.forEach((c, i) => {

      let x = Math.floor(i % game.size[0]) * lineLength + start;
      let y = Math.floor(i / game.size[0]) * lineLength + start;
      if (c[0]) this.drawLine(this.context, x, y, x + lineLength, y);
      if (c[1]) this.drawLine(this.context, x, y, x, y + lineLength);
      if (Math.floor((i + 1) % game.size[0]) == 0)
        this.drawLine(this.context, x + lineLength, y, x + lineLength, y + lineLength);
      if (Math.ceil((i + 1) / game.size[0]) == game.size[1])
        this.drawLine(this.context, x, y + lineLength, x + lineLength, y + lineLength);

    });
    this.insertImage("assets/images/demogorgon1.png",
      Math.floor(game.domokun[0] % game.size[0]) * lineLength + start,
      Math.floor(game.domokun[0] / game.size[0]) * lineLength + start);

    this.insertImage(`assets/images/${this.pony}.png`,
      Math.floor(game.pony[0] % game.size[0]) * lineLength + start,
      Math.floor(game.pony[0] / game.size[0]) * lineLength + start);

    this.insertImage("assets/images/finish.png",
      Math.floor(game['end-point'][0] % game.size[0]) * lineLength + start,
      Math.floor(game['end-point'][0] / game.size[0]) * lineLength + start);

  }
  insertImage(uri, x, y) {
    let img = new Image();
    img.src = uri;
    img.onload = () => this.context.drawImage(img, x, y);
  }
  move(direction) {
    if (!this.canMove(direction)) return;
    let move: Move = { direction: direction }
    this.ponyService.move(this.id, move).subscribe((response) => {
      this.getGame();
    });
  }

  public canMove(direction) {
    if (!this.game || !this.game.data) return false;
    let up = this.game.data[this.game.pony[0]][0],
      left = this.game.data[this.game.pony[0]][1],
      down = this.game.data.length > this.game.pony[0] + this.game.size[0] ? this.game.data[this.game.pony[0] + this.game.size[0]][0] : true,
      right = this.game.data.length > this.game.pony[0] + 1 ? this.game.data[this.game.pony[0] + 1][1] : true;
    switch (direction) {
      case 'north': return !up;
      case 'west': return !left;
      case 'east': return !right;
      case 'south': return !down;
      default: return false;
    }
  }

  drawLine(ctx, xStart, yStart, xEnd, yEnd) {
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
  }

}
