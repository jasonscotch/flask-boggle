
from flask import Flask, request, render_template, session, jsonify
from boggle import Boggle
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev'
app.config.from_pyfile('config.py')

app.debug = True
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

toolbar = DebugToolbarExtension(app)

boggle_game = Boggle()

@app.route("/", methods=["GET", "POST"])
def homepage():
    """Show homepage."""
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get('highscore',0)
    plays = session.get('plays',0)
     
    return render_template('index.html', board=board, highscore=highscore, plays=plays)

@app.route("/word-check")
def check_word():
  """Check if a submitted word is valid."""
  word = request.args["word"]
  board = session["board"]
  response = boggle_game.check_valid_word(board, word)

  return jsonify({'result': response})
  
@app.route('/score', methods=["POST", "GET"])
def show_score():
  """Display the score after every word added"""
  score = request.json['score']
  highscore = session.get('highscore', 0)
  plays = session.get('plays', 0)
  session['plays'] = plays + 1
  session['highscore'] = max(score, highscore)
  highscore = session['highscore']

  return jsonify({'score': score, 'highscore': highscore })