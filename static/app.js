class BoggleGame {
  /* make a new game at this DOM id */

  constructor(boardId, seconds = 60) {
    this.seconds = seconds; // game time limit
    this.boardId = boardId;
    this.score = 0;
    this.words = new Set();
    this.board = $("#" + boardId);
    this.timer = null;
    this.highscore = sessionStorage.getItem('highscore');
    this.plays = sessionStorage.getItem('plays') || 0;
    

    this.scoreGame = this.scoreGame.bind(this);

    // submit a guess by enter
    $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    
    // start the timer countdown on every game initialize 
    this.startTimer();
  }

  
  // Timer function to countdown the number of seconds submitted
  startTimer() {
    let countdown = this.seconds;
    this.timer = setInterval(() => {
      if (countdown === 0) {
        clearInterval(this.timer);
        $(".add-word", this.board).hide();
        // this.showMessage(`Time's up!`, "err");
        this.scoreGame();
        clearInterval(this.timer);
        this.showHighScore();
      } else {
        countdown--;
        $(".timer", this.board).text(` :${countdown}`);
      }
    }, 1000);
  }

  /* show word in list of words */

  showWord(word) {
    $(".words", this.board).append($("<li>", { text: word }));
  }

  /* show score in html */

  showScore() {
    $(".score", this.board).text(this.score);
  }

  // Show the high score on the board
  showHighScore() {
    if (this.score > this.highscore) {
      this.highscore = this.score;
      sessionStorage.setItem('highscore', this.highscore);
      $('.highscore', this.board).text(this.highscore);
      this.showMessage(`${this.highscore} is a new high score!`, "ok");
    } else {
      this.showMessage(`${this.highscore} is the high score.`, "ok");
    }

    // Send score data to server
    fetch('/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ score: this.score })
    })
    .then(response => response.json())
    .then(data => {
      this.highscore = data.highscore;
      $('.highscore', this.board).text(this.highscore);
    });
  }

  /* show a status message */

  showMessage(msg, cls) {
    $(".msg", this.board)
      .text(msg)
      .removeClass()
      .addClass(`msg ${cls}`);
  }

  /* handle submission of word: if unique and valid, score & show */

  async handleSubmit(evt) {
    evt.preventDefault();
    const $word = $(".word", this.board);

    let word = $word.val();
    if (!word) return;

    if (this.words.has(word)) {
      this.showMessage(`Already found ${word}`, "err");
      return;
    }

    // check server for validity
    const resp = await axios.get("/word-check", { params: { word: word }});
    if (resp.data.result === "not-word") {
      this.showMessage(`${word} is not a valid English word`, "err");
    } else if (resp.data.result === "not-on-board") {
      this.showMessage(`${word} is not a valid word on this board`, "err");
    } else {
      this.showWord(word);
      this.score += word.length;
      this.showScore();
      
      this.words.add(word);
      this.showMessage(`Added: ${word}`, "ok");
    }

    $word.val("").focus();
  }

  // Function to provide final score of game
  scoreGame() {
    $(".add-word", this.board).hide();
    $('.restart', this.board).show();
    try {
      const resp = axios.post("/score", { score: this.score, highscore: this.highscore, plays: this.plays });
      this.showHighScore();
    } catch (e) {
      this.showMessage('Server error!', 'err');
    }  
  }

  // This resets the game board, clearing the subitted words and final score.
  restartGame() {
      
      sessionStorage.setItem('plays',++this.plays);
      this.showHighScore();
      window.location.reload();

    }

}


