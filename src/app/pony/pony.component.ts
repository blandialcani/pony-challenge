import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { PonyService, Move } from './pony.service';
import { PonyHelperService } from '../pony-helper.service';

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
  providers: [PonyService, PonyHelperService]
})
export class PonyComponent implements OnInit, AfterViewInit {
  speed: number = 15;
  public baseHref = 'https://ponychallenge.trustpilot.com';
  public game: any = {
    "game-state": { state: 'Active' }
  };

  @Input() pony: string = 'strawberry_blush';
  @Output() idChange = new EventEmitter<string>();

  private _id: string;
  private _width: number;
  private _height: number;
  public showHint: boolean = true;
  lastMove: string = 'north';
  solution: any;
  nextMove: number = 0;
  public solveAutomatically: boolean = false;
  @Input() set id(id: string) {
    this._id = id;
    this.nextMove = 0;
    this.game  = {
      "game-state": { state: 'Active' }
    }
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

  constructor(private ponyService: PonyService, private ponyHelper: PonyHelperService) {}

  ngAfterViewInit(): void {
    setTimeout(_ => this.showHint = false, 5000);
    this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
  }

  startNewGame() { this.idChange.emit(undefined);}

  ngOnInit() {}

  ngDestroy(){

  }
  startStop(){
    this.solveAutomatically = !this.solveAutomatically;
    this.solution= null;
    this.nextMove = 0;
    this.getGame()
  }

  getGame() {
    this.ponyService.getGame(this.id).subscribe((game: any) => {
      game.data = game.data.map(convertData);
      this.game = Object.assign({},game);
      this.drawGame(game);
      if(this.solveAutomatically){
        this.playNextMove()
      }
    });
  }
  playNextMove(){
    if(!this.solution){
      let g = JSON.parse(JSON.stringify(this.game));
      this.solution = this.ponyHelper.solve(g);
      console.log(this.solution);
    }

    setTimeout(() => {
      this.move(this.solution[this.nextMove++]);
    },1000/this.speed);
  }
  move(direction: string, $event: Event = undefined) {
    if ($event !== undefined) {
      $event.preventDefault();
      $event.stopPropagation();
    }
    if (!this.ponyHelper.canMove(direction, this.game))
     return;
    let move: Move = { direction: direction }
    this.ponyService.move(this.id, move).subscribe((response) => {
      this.getGame();
    });
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

  public canMove(direction: string) {
    return this.ponyHelper.canMove(direction, this.game);
  }
}
