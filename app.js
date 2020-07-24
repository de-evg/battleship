const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  serveClient: false,
  transports: ['websocket', 'flashsocket', 'xhr-polling']
});
const bodyParser = require('body-parser');
const port = 3001;

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

// io.on('reconnect_attempt', () => {
//   io.io.opts.transports = ['polling', 'websocket'];
// });

io.on('connection', (socket) => {
  console.log('Присоединился');
  socket.on('disconnect', () => {
    console.log('Отключился');
  })

  socket.on('sendGameName', (gameName) => {
    console.log('1 sendGameName --- Создана игра на сервере');
    Game[gameName] = new newGame();    
    socket.nickname = 'serverPlayer';
    socket.join(`room ${gameName}`);
  });

  socket.on('isSecondPlayerConnected', (gameName) => {
    console.log('2 isSecondPlayerConnected --- Ждем когда второй игрок подключится');
    socket.emit('secondPlayerConnected', Game[gameName]);
  });

  socket.on('getGames', () => {
    console.log('3 getGames --- Клиент получает список всех игр');
    socket.emit('newGames', Game);
  });

  socket.on('sendSelectedGameName', (gameName) => {
    console.log('4 sendSelectedGameName --- Клиент подключается к выбранной игре');
    socket.nickname = 'clientPlayer';
    socket.join(`room ${gameName}`);
    Game[gameName].isSecondPlayerConnected = true;
  });

  socket.on('setStartStateOnCloud', (gameName, state) => {
    console.log('5 setStartStateOnCloud - На сервак отправляются стартовые параметры поля и кораблей');
    console.log('nickname ', socket.nickname);
    Game[gameName][socket.nickname] = state;
  });

  socket.on('playerReady', (state) => {
    console.log('6 playerReady - Игрок разместил корабли, отправил данные на серв и готов к игре');
    Game[state.gameName][state.nickname] = state;
  });

  socket.on('getGame', (gameName) => {
    console.log(`7 getGame --- Отправка состояния игры игроку ${socket.nickname}`);
    if (!Game[gameName][socket.nickname]) {
      console.log(Game[gameName][socket.nickname]);
    }
    if (Game[gameName]['serverPlayer'] && Game[gameName]['clientPlayer']) {
      console.log('все есть');
      socket.emit('sendGame', Game[gameName]);
    } else {
      console.log('пропали ');
    }
  });

  socket.on('getShotData' , (gameName) => {
    console.log(`10 getShotData --- Запрос параметра выстрела ${socket.nickname}`);
    socket.emit('sendShot', Game[gameName]);       
  });

  socket.on('sendLastShot', (state) => {
    console.log(`8 sendLastData --- Отправка на серв данных после хода ${socket.nickname} --> изменение хода и отправка игроку новых данных`);
    if (!Game[state.gameName][socket.nickname]) {
      console.log(Game[state.gameName][socket.nickname]);
    }
    
    if (state.nickname && state.nickname !== 'serverPlayer' && !state.isPlayerMove) {
      Game[state.gameName]['serverPlayer'] = state;
      Game[state.gameName]['serverPlayer'].isPlayerMove = !state.isPlayerMove;
      
    }
    if (state.nickname && state.nickname !== 'clientPlayer' && !state.isPlayerMove) {
      Game[state.gameName]['clientPlayer'] = state;
      Game[state.gameName]['clientPlayer'].isPlayerMove = !state.isPlayerMove
    }       
  });

  socket.on('sendClearSquireID', (gameName) => {
    Game[gameName][socket.nickname].squireID = null;
  });

  socket.on('sendNewState', (state) => {
    console.log('9 sendNewState');
    if (!Game[state.gameName][socket.nickname]) {
      console.log(Game[state.gameName][socket.nickname]);
    }  
    
    if (state.nickname && state.nickname !== 'serverPlayer' && !state.isPlayerMove) {
      Game[state.gameName]['serverPlayer'] = state;
      Game[state.gameName]['serverPlayer'].isPlayerMove = !state.isPlayerMove;
      
    }
    if (state.nickname && state.nickname !== 'clientPlayer' && !state.isPlayerMove) {
      Game[state.gameName]['clientPlayer'] = state;
      Game[state.gameName]['clientPlayer'].isPlayerMove = !state.isPlayerMove
    }
  });
});


http.listen(port, (error) => {
  if (error) return console.log(`Error: ${error}`);
  console.log(`Server listening on port ${http.address().port}`)
});
// routes(app.io);
