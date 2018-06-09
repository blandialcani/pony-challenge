import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpObserve } from '@angular/common/http/src/client';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const httpOptionsForPrint = {
  headers: new HttpHeaders({  'responseType': 'text', observe: 'body' as HttpObserve }),
  return: 'text'
};
const baseUrl = 'https://ponychallenge.trustpilot.com/pony-challenge/maze';

@Injectable({
  providedIn: 'root'
})
export class PonyService {

  constructor(private http: HttpClient) { }

  createGame(game: Game) {
    let body = JSON.stringify(game);
    return this.http.post(baseUrl, body, httpOptions);
  }

  move(id: string, move: Move) {
    let body = JSON.stringify(move);
    return this.http.post(baseUrl + '/' + id, body, httpOptions);
  }
  getGame(id: string) {
    return this.http.get(baseUrl + '/' + id, httpOptions);
  }
  print(id: string) {
    return this.http.get(baseUrl + '/' + id + '/print', {responseType: 'text'});
  }
}

export interface Game {
  "maze-width": number;
  "maze-height": number;
  "maze-player-name": string;
  difficulty: number;
}

export interface Move {
  direction: string;
}

