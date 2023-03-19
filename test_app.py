from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle

app.config['TESTING'] = True
app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

class FlaskTests(TestCase):

    def setUp(self):
        self.client = app.test_client()
        app.config['TESTING'] = True
    
    def test_homepage(self):
        """Test if the homepage is setup properly"""
        with self.client:
            resp = self.client.get('/')
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('plays'))
            
    def test_check_word(self):
        """Test if the check word function is working with a demo board"""
        with self.client:
            with self.client.session_transaction() as sesh:
                sesh['board'] = [['A', 'B', 'C', 'D', 'E'],
                ['F', 'G', 'H', 'I', 'J'],
                ['K', 'L', 'M', 'N', 'O'],
                ['P', 'Q', 'R', 'S', 'T'],
                ['U', 'V', 'W', 'X', 'Y']]
                
            response = self.client.get('/word-check?word=hello')
            self.assertEqual(response.json, {'result': 'not-on-board'})
            
            response2 = self.client.get('/word-check?word=jjk;l')
            self.assertEqual(response2.json, {'result': 'not-word'})
            
    def test_show_score(self):
        """Test if the scoring functions return the correct responses"""
        with self.client:
            with self.client.session_transaction() as sesh:
                sesh['highscore'] = 10
                sesh['plays'] = 2
            response = self.client.post('/score', json={'score': 15})
            self.assertEqual(response.json, {'highscore': 15, 'score': 15})    
    
    