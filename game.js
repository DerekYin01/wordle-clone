let targetWord, currentRow, currentCol, board, gameOver, keyStates;

function initGame() {
  targetWord = ANSWERS[Math.floor(Math.random() * ANSWERS.length)].toUpperCase();
  currentRow = 0;
  currentCol = 0;
  gameOver = false;
  keyStates = {};

  document.getElementById('message').textContent = '';
  document.getElementById('new-game-btn').style.display = 'none';

  buildBoard();
  buildKeyboard();
}

function buildBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  board = [];
  for (let r = 0; r < 6; r++) {
    const row = document.createElement('div');
    row.className = 'row';
    const tiles = [];
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      row.appendChild(tile);
      tiles.push(tile);
    }
    boardEl.appendChild(row);
    board.push(tiles);
  }
}

function buildKeyboard() {
  const rows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Enter','Z','X','C','V','B','N','M','⌫']
  ];
  const kbEl = document.getElementById('keyboard');
  kbEl.innerHTML = '';
  rows.forEach(keys => {
    const row = document.createElement('div');
    row.className = 'kb-row';
    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'key' + (k.length > 1 ? ' wide' : '');
      btn.textContent = k;
      btn.dataset.key = k;
      btn.addEventListener('click', () => handleKey(k));
      row.appendChild(btn);
    });
    kbEl.appendChild(row);
  });
}

function handleKey(key) {
  if (gameOver) return;
  if (key === '⌫' || key === 'Backspace') {
    deleteLetter();
  } else if (key === 'Enter') {
    submitGuess();
  } else if (/^[A-Za-z]$/.test(key)) {
    addLetter(key.toUpperCase());
  }
}

function addLetter(letter) {
  if (currentCol >= 5) return;
  const tile = board[currentRow][currentCol];
  tile.textContent = letter;
  tile.dataset.letter = letter;
  tile.classList.add('pop');
  tile.addEventListener('animationend', () => tile.classList.remove('pop'), { once: true });
  currentCol++;
}

function deleteLetter() {
  if (currentCol <= 0) return;
  currentCol--;
  const tile = board[currentRow][currentCol];
  tile.textContent = '';
  delete tile.dataset.letter;
}

function submitGuess() {
  if (currentCol < 5) {
    showMessage('Not enough letters');
    shakeRow(currentRow);
    return;
  }

  const guess = board[currentRow].map(t => t.textContent).join('');

  if (!VALID_GUESSES.has(guess.toLowerCase())) {
    showMessage('Not in word list');
    shakeRow(currentRow);
    return;
  }

  const result = evaluate(guess);
  revealRow(currentRow, result, () => {
    updateKeyboard(guess, result);

    if (result.every(r => r === 'correct')) {
      const msgs = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
      showMessage(msgs[currentRow] || 'Nice!');
      gameOver = true;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    } else if (currentRow === 5) {
      showMessage(targetWord);
      gameOver = true;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    }

    currentRow++;
    currentCol = 0;
  });
}

function evaluate(guess) {
  const result = Array(5).fill('absent');
  const target = targetWord.split('');
  const guessArr = guess.split('');
  const used = Array(5).fill(false);

  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === target[i]) {
      result[i] = 'correct';
      used[i] = true;
      guessArr[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === null) continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guessArr[i] === target[j]) {
        result[i] = 'present';
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

function revealRow(row, result, onDone) {
  board[row].forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('reveal', result[i]);
      if (i === 4) setTimeout(onDone, 500);
    }, i * 300);
  });
}

function shakeRow(row) {
  board[row].forEach(tile => {
    tile.classList.add('shake');
    tile.addEventListener('animationend', () => tile.classList.remove('shake'), { once: true });
  });
}

function updateKeyboard(guess, result) {
  const priority = { correct: 3, present: 2, absent: 1 };
  guess.split('').forEach((letter, i) => {
    const cur = keyStates[letter];
    if (!cur || priority[result[i]] > priority[cur]) {
      keyStates[letter] = result[i];
    }
  });
  document.querySelectorAll('.key').forEach(btn => {
    const k = btn.dataset.key;
    if (keyStates[k]) {
      btn.className = 'key' + (k.length > 1 ? ' wide' : '') + ' ' + keyStates[k];
    }
  });
}

function showMessage(msg) {
  const el = document.getElementById('message');
  el.textContent = msg;
  if (msg && !gameOver) {
    setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 1500);
  }
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  handleKey(e.key === 'Backspace' ? 'Backspace' : e.key);
});

initGame();
