let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let nbaAPIURL = "http://data.nba.net/10s/prod/v1/"

app.get('/', function (req, res) {
  res.send('hello world');
});

app.post('/v1/nba', function (req, res) {
  console.log(req.body);
  let today = "20190225";
  if (req.body.text === 'scoreboard') {
    console.log('Scoreboard');
    request(nbaAPIURL + "/" + today + "/scoreboard.json", function(error, response, body) {
      console.log('error: ', error);
      console.log('statusCode: ', response && response.statusCode);
      // console.log('body:', body);
      let scoreBoard = ""
      if (response.statusCode === 200) {
        let gamesObject = JSON.parse(body);
        // console.log(gamesObject);
        for (let game of gamesObject.games ){
          scoreBoard += `${game.hTeam.score} ${game.hTeam.triCode} (${game.hTeam.win}-${game.hTeam.win}) VS ${game.vTeam.score} ${game.vTeam.triCode} (${game.vTeam.win}-${game.vTeam.win})\n`;
          console.log(scoreBoard);
        }
        res.statusCode = 200;
        return res.send(scoreBoard);
      }
    })
  }
});

app.listen(3000);

