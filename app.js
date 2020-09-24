const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  serveClient: false,
  transports: ['websocket', 'flashsocket', 'xhr-polling']
});
const bodyParser = require('body-parser');
const PORT = 3001;

let Game = {};
class newGame {
  constructor() {
    this.isSecondPlayerConnected = false;
    this.isServerTurn = Math.random() >= 0.5;
    this.isServerPlayerMove = Math.random() >= 0.5;
  }
};

app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({
  extended: true
}));

io.on('connection', (socket) => {
  console.log('Присоединился'); 
  socket.on('disconnect', () => {
    console.log('Отключился ', socket.id);
  })

  socket.on('sendGameName', (gameName) => {
    try {
      Game[gameName] = new newGame();    
      socket.nickname = 'serverPlayer';
      socket.join(`room ${gameName}`);
    } catch (err) {
      console.log(`Не удалось создать игру на сервере`);
    }    
  });

  socket.on('isSecondPlayerConnected', (gameName) => {
    try {
      socket.emit('secondPlayerConnected', Game[gameName]);
    } catch (err) {
      console.log(`Второму игроку не удалось подклчиться`);
    }    
    
  });

  socket.on('getGames', () => {
    try {
      socket.emit('newGames', Game);
    } catch (err) {
      console.log(`Не удалось отправить список доступных игр`);
    }    
  });

  socket.on('sendSelectedGameName', (gameName) => {
    try {
      socket.nickname = 'clientPlayer';
      socket.join(`room ${gameName}`);
      Game[gameName].isSecondPlayerConnected = true;
    } catch (err) {
      console.log(`Не удалось подключиться к выбранной игре`);
    }
  });

  socket.on('setStartStateOnCloud', (gameName, state) => {
    try {
      Game[gameName][socket.nickname] = state;
      Game[gameName][socket.nickname].shots = [];  
    } catch (err) {
      console.log(`Не удалось получить стартовые параметры поля и кораблей`);
    }
  });

  socket.on('playerReady', (state) => {
    try {
      const {nickname, gameName, isPlayerReady, isPlayerMove, currentGameFieldsData, shipsData} = state;    
      Game[state.gameName][nickname].gameName = gameName;
      Game[state.gameName][nickname].isPlayerReady = isPlayerReady;
      Game[state.gameName][nickname].isPlayerMove = isPlayerMove;
      Game[state.gameName][nickname].currentGameFieldsData = currentGameFieldsData;
      Game[state.gameName][nickname].shipsData = shipsData;
    } catch (err) {
      console.log(`Не удалось получить данные игрока о готовности`);
    }
  });

  socket.on('getGame', (gameName) => {
    try {
      if (!Game[gameName][socket.nickname]) {
        console.log(Game[gameName][socket.nickname]);
      }
      if (Game[gameName]['serverPlayer'] && Game[gameName]['clientPlayer']) {
        socket.emit('sendGame', Game[gameName]);
      }
    } catch (err) {
      console.log(`Не удалось отправить данные по состоянию игры`);
    }
  });

  socket.on('sendLastShot', (state) => {
    try {
      const {nickname, squireID, isPlayerMove, gameName} = state;
    if (nickname !== 'serverPlayer') {
      Game[gameName]['serverPlayer'].shots.push(squireID);
      Game[gameName]['serverPlayer'].isDataUpdated = true;
      if (!isPlayerMove) {
        Game[gameName]['serverPlayer'].isPlayerMove = !isPlayerMove;      
      }      
    }
    if (nickname !== 'clientPlayer') {
      Game[gameName]['clientPlayer'].shots.push(squireID);
      Game[gameName]['clientPlayer'].isDataUpdated = true;
      if (!isPlayerMove) {
        Game[gameName]['clientPlayer'].isPlayerMove = !isPlayerMove;
      }
    }
    } catch (err) {
      console.log(`Не удалось отправить данные по состоянию игры после хода сменить ход и отправить новые данные`);
    }
  });

  socket.on('getShotData' , (gameName) => {
    try {
      setInterval(() => {
        if (Game[gameName][socket.nickname].isDataUpdated && Game[gameName][socket.nickname].shots.length) {      
          const shotID = Game[gameName][socket.nickname].shots.splice(0, 1);          
          socket.emit('sendShot', shotID);    
        }
      }, 1000);
    } catch (err) {
      console.log(`Не удалось отправить параметры выстрела`);
    }     
  });

  socket.on('deleteGame', (gameName) => {
    delete Game[gameName];
  });
});


http.listen(PORT, (error) => {
  if (error) return console.log(`Error: ${error}`);
  console.log(`Server listening on port ${http.address().port}`)
});
// routes(app.io);
