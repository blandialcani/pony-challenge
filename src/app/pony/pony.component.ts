import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { PonyService, Move } from './pony.service';

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
const lineLength = 25;
const lineStart = 10;

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
  private _width: number;
  private _height: number;
  @Input() set id(id: string) {
    this._id = id;
    this.getGame();
  }
  get id() { return this._id; }

  @Input() set width(width: number) {
    if (!width) return;
    this._width = width * lineLength + 2 * lineStart;
  };
  get width() { return this._width; }

  @Input() set height(height: number) {
    if (!height) return;
    this._height = height * lineLength + 2 * lineStart;
  };
  get height() { return this._height; }

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

  startNewGame() {
    this.idChange.emit(undefined);
  }

  drawGame(game) {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    game.data.forEach((c, i) => {
      let x = Math.floor(i % game.size[0]) * lineLength + lineStart;
      let y = Math.floor(i / game.size[0]) * lineLength + lineStart;
      //insert north
      if (c[0]) this.drawLine(this.context, x, y, x + lineLength, y);
      //insert west
      if (c[1]) this.drawLine(this.context, x, y, x, y + lineLength);
      // if end of row, draw closing line
      if (Math.floor((i + 1) % game.size[0]) == 0)
        this.drawLine(this.context, x + lineLength, y, x + lineLength, y + lineLength);
      // if end of column, draw closing line
      if (Math.ceil((i + 1) / game.size[0]) == game.size[1])
        this.drawLine(this.context, x, y + lineLength, x + lineLength, y + lineLength);

    });
    //insert domokun
    this.insertImage("assets/images/demogorgon1.png",
      Math.floor(game.domokun[0] % game.size[0]) * lineLength + lineStart,
      Math.floor(game.domokun[0] / game.size[0]) * lineLength + lineStart);
    //insert pony
    this.insertImage(`assets/images/${this.pony}.png`,
      Math.floor(game.pony[0] % game.size[0]) * lineLength + lineStart,
      Math.floor(game.pony[0] / game.size[0]) * lineLength + lineStart);
    //insert endpoint
    this.insertImage("assets/images/finish.png",
      Math.floor(game['end-point'][0] % game.size[0]) * lineLength + lineStart,
      Math.floor(game['end-point'][0] / game.size[0]) * lineLength + lineStart);
  }

  insertImage(uri: string, x: number, y: number) {
    let img = new Image();
    img.src = uri;
    img.onload = () => this.context.drawImage(img, x, y);
  }

  drawLine(ctx: CanvasRenderingContext2D, xStart: number, yStart: number, xEnd: number, yEnd: number) {
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
  }
  move(direction: string, $event: Event = undefined) {
    if ($event !== undefined) {
      $event.preventDefault();
      $event.stopPropagation();
    }
    if (!this.canMove(direction))
      return;
    let move: Move = { direction: direction }
    this.ponyService.move(this.id, move).subscribe((response) => {
      this.getGame();
    });
  }

  public canMove(direction: string) {
    if (!this.game || !this.game.data) return false;
    let cantMoveUp = this.game.data[this.game.pony[0]][0],
      cantMoveLeft = this.game.data[this.game.pony[0]][1],
      // also check if in last row, because no  south walls
      cantMoveDown =
        this.game.data.length > this.game.pony[0] + this.game.size[0]
          ? this.game.data[this.game.pony[0] + this.game.size[0]][0]
          : true,
      // also check if in last column, because no  east walls
      cantMoveRight =
        this.game.data.length > this.game.pony[0] + 1
          ? this.game.data[this.game.pony[0] + 1][1]
          : true;
    switch (direction) {
      case 'north': return !cantMoveUp;
      case 'west': return !cantMoveLeft;
      case 'east': return !cantMoveRight;
      case 'south': return !cantMoveDown;
      default: return false;
    }
  }


}
