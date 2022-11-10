import { useState } from 'react'
import * as Chess from 'js-chess-engine';

import styles from '../styles/Chess.module.css';

const GLYPHS = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟︎",
};

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

function makeGameFromEngine(div) {
  // make a new html <table> to render chess
  const board = document.createElement('table');
  const message = document.createElement('p');
  let userTurn = true;
  message.id = "message";
  message.innerText="Your turn"


  const updateMessage = (msg) => {
    const _message = document.getElementById('message');
    console.log({_message})
    if(_message)
    _message.innerText = msg;
  }

  /* updateMessage(); */

   
  board.className = styles.board;
  fillInBoard(board);

  // put that table into the div we control
  div?.appendChild(board);

  // make a new chess game
  const game = new Chess.Game();
  /* const [movedFrom, movedTo] = Object.entries(game.aiMove())[0]; */
  /* console.log({ */
  /*   movedFrom, */
  /*   movedTo */
  /* }) */

  let gameState = game.exportJson();


  // loop through and update all the squares with a piece on them
  Object.keys(gameState.pieces).forEach(square => {
    // square will be "A1" through "H8"

    // get the html element representing that square
    const el = document.getElementById(square);

    // take that piece and put its corresponding glyph into the square
    const piece = gameState.pieces[square];
    el.innerText = GLYPHS[piece];
  });

  let selected = null;

  const onClick = event => {
    let square = event.target.id;

    // check to see if we are moving a piece
    if (selected && gameState.moves[selected].includes(square)) {

      updateMessage(userTurn?  "Your turn" : "Bot turn");


      console.log({moves: gameState.moves[selected]})
      gameState.moves[selected].forEach(move =>{
        const item = document.getElementById((move));
        item.classList.remove(styles.isMoveOption)
      } )
      // move the piece
      game.move(selected, square);
      console.log({selected, square})
      gameState = game.exportJson();

      // update the text by clearing out the old square
      document.getElementById(selected).innerText = "";
      // and putting the piece on the new square
      document.getElementById(square).innerText = GLYPHS[gameState.pieces[square]];

      // reset the selection state to unselected
      selected = null;

    } else if (selected) {
      // they tried to move a piece to a random spot on the board
      return updateMessage("Invalid move!");
    } else if (gameState.moves[square]) {
      // clicked on a piece that can move,
      // set the selection to that piece
      selected = square;
    }

    if(gameState.turn === "black"){
      const [movedFrom, movedTo] = Object.entries(game.aiMove())[0];
      /* game.move(movedFrom, movedTo); */
      gameState = game.exportJson();

      // update the text by clearing out the old square
      document.getElementById(movedFrom).innerText = "";
      // and putting the piece on the new square
      document.getElementById(movedTo).innerText = GLYPHS[gameState.pieces[movedTo]];

      updateMessage(`Bot moved from: ${movedFrom} to ${movedTo}`);
      // reset the selection state to unselected
      square = null;
    }

    const moves =gameState.moves[square];


    if(moves){
      moves.forEach(move =>{
        const item = document.getElementById((move));
        item.classList.add(styles.isMoveOption)
      } )
    }

  }



  Array.from(
    board.getElementsByClassName(styles.square)
  ).forEach(el => {
      el.onclick = onClick;
    });


  board.appendChild(message)

}

export default function ChessPage() {
  return <div ref={makeGameFromEngine}/>
}




const fillInBoard = (board) => {
  const COLNAMES = " ABCDEFGH";
  const body = document.createElement('tbody');
  // make each row in the table
  for (let r = 8; r >= 1; r--) {
    const row = document.createElement('tr');
    // number each row
    const rowLabel = document.createElement('td');
    rowLabel.innerText = r.toString();
    row.appendChild(rowLabel);
    // add the board squares
    for (let c = 1; c <= 8; c++) {
      const colName = COLNAMES[c];
      let square = document.createElement('td');
      square.id = colName + r;
      // color alternating squares
      const color = (r + c) % 2 ? styles.white : styles.black;
      square.className = styles.square + ' ' + color;
      row.appendChild(square);
    }
    body.appendChild(row);
  }

  // put column numbers on the bottom
  const footer = document.createElement('tr');

  for (let c = 0; c <= 8; c++) {
    const label = document.createElement('td');
    label.innerText = COLNAMES[c];
    footer.appendChild(label);
  }
  body.appendChild(footer);
  board.appendChild(body);
}
