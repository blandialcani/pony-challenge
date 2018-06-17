import { Injectable } from '@angular/core';
import { Move } from './pony/pony.service';

@Injectable({
  providedIn: 'root'
})
export class PonyHelperService {

  constructor() { }

  getAllowedDirections(game): string[] {
    let directions: string[] = [];
    if (this.canMove('north', game)) directions.push('north');
    if (this.canMove('east', game)) directions.push('east');
    if (this.canMove('west', game)) directions.push('west');
    if (this.canMove('south', game)) directions.push('south');
    return directions;
  }

    //wallFlower
  getWallFlowerMove(directions, previousMove): string {
    let move: Move = {
      direction: ''
    }
    switch (previousMove) {
      case 'north': {
        if (directions.indexOf('west') >= 0) move.direction = 'west';
        else if (directions.indexOf('north') >= 0) move.direction = 'north';
        else if (directions.indexOf('east') >= 0) move.direction = 'east';
        else move.direction = 'south';
        break;
      }
      case 'west': {
        if (directions.indexOf('south') >= 0) move.direction = 'south';
        else if (directions.indexOf('west') >= 0) move.direction = 'west';
        else if (directions.indexOf('north') >= 0) move.direction = 'north';
        else move.direction = 'east';
        break;
      }
      case 'south': {
        if (directions.indexOf('east') >= 0) move.direction = 'east';
        else if (directions.indexOf('south') >= 0) move.direction = 'south';
        else if (directions.indexOf('west') >= 0) move.direction = 'west';
        else move.direction = 'north';
        break;
      }
      case 'east': {
        if (directions.indexOf('north') >= 0) move.direction = 'north';
        else if (directions.indexOf('east') >= 0) move.direction = 'east';
        else if (directions.indexOf('south') >= 0) move.direction = 'south';
        else move.direction = 'west';
        break;
      }
    }
    return move.direction;
  }

  public solve(game: GameData): string[] {
    let moves: any[]  = [];
    let previousMove = 'north';
    let previousPony;
    let nextMove =''

    while(game.pony[0] != game["end-point"][0]){
      nextMove = this.getNextMove(game, previousMove).direction;
      previousMove = nextMove;
      previousPony = game.pony[0];
      game = this.movePony(game, nextMove);
      let previousPonyPosition = moves.map(move => move.pony).indexOf(previousPony);
      if(previousPonyPosition>=0){
        moves = moves.slice(0, previousPonyPosition);
      }
      moves.push({
        pony: previousPony,
        direction: previousMove
      });
    }

    console.log(moves.map(move => move.pony));
    return moves.map(move => move.direction);
  }

  movePony(game: GameData, direction: string): GameData{
    switch(direction){
      case 'west':{
        game.pony[0]--; break;
      }
      case 'east':{
        game.pony[0]++; break;
      }
      case 'north':{
        game.pony[0]= game.pony[0] - game.size[0]; break;
      }
      case 'south':{
        game.pony[0]= game.pony[0] + game.size[0]; break;
      }
    }
    return game;
  }

  public getNextMove(game, previousMove: string = 'north'): Move {
    let move: Move = {
      direction: ''
    }
    let directions: string[] = this.getAllowedDirections(game);

    // random mouse
    //move.direction = directions[Math.floor(Math.random()*directions.length)];

    move.direction = this.getWallFlowerMove(directions, previousMove)
    return move;
    ;
  }


  public canMove(direction: string, game) {
    if (!game || !game.data) return false;
    let cantMoveUp = game.data[game.pony[0]][0],
      cantMoveLeft = game.data[game.pony[0]][1],
      // also check if in last row, because no  south walls
      cantMoveDown =
        game.data.length > game.pony[0] + game.size[0]
          ? game.data[game.pony[0] + game.size[0]][0]
          : true,
      // also check if in last column, because no  east walls
      cantMoveRight =
        game.data.length > game.pony[0] + 1
          ? game.data[game.pony[0] + 1][1]
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

export interface GameData{
  data: string[][];
  domokun: number[];
  pony: number[];
  "end-point": number[];
  maze_id: string;
  "game-state": any;
  size: number[];
  difficulty: number;
}
