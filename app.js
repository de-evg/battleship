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
    console.log('Отключился ', socket.id);
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
    Game[gameName][socket.nickname].shots = [];
  });

  socket.on('playerReady', (state) => {
    console.log('6 playerReady - Игрок разместил корабли, отправил данные на серв и готов к игре');
    const {nickname, gameName, isPlayerReady, isPlayerMove, currentGameFieldsData, shipsData} = state;    
    Game[state.gameName][nickname].gameName = gameName;
    Game[state.gameName][nickname].isPlayerReady = isPlayerReady;
    Game[state.gameName][nickname].isPlayerMove = isPlayerMove;
    Game[state.gameName][nickname].currentGameFieldsData = currentGameFieldsData;
    Game[state.gameName][nickname].shipsData = shipsData;
  });

  socket.on('getGame', (gameName) => {
    console.log(`7 getGame --- Отправка состояния игры игроку ${socket.nickname}`);
    if (!Game[gameName][socket.nickname]) {
      console.log(Game[gameName][socket.nickname]);
    }
    if (Game[gameName]['serverPlayer'] && Game[gameName]['clientPlayer']) {
      socket.emit('sendGame', Game[gameName]);
    }
  });

  socket.on('sendLastShot', (state) => {
    console.log(`8 sendLastData --- Отправка на серв данных после хода ${socket.nickname} --> изменение хода и отправка игроку новых данных`);
    const {nickname, squireID, isPlayerMove, gameName} = state;
    if (nickname !== 'serverPlayer') {
      Game[gameName]['serverPlayer'].shots.push(squireID);
      Game[gameName]['serverPlayer'].isDataUpdated = true;
      if (!isPlayerMove) {
        Game[gameName]['serverPlayer'].isPlayerMove = !isPlayerMove;      
      }
      console.log(Game[gameName]['serverPlayer'].shots);
    }
    if (nickname !== 'clientPlayer') {
      Game[gameName]['clientPlayer'].shots.push(squireID);
      Game[gameName]['clientPlayer'].isDataUpdated = true;
      if (!isPlayerMove) {
        Game[gameName]['clientPlayer'].isPlayerMove = !isPlayerMove;
      } 
      console.log(Game[gameName]['clientPlayer'].shots);     
    }
  });

  socket.on('getShotData' , (gameName) => {
    console.log(`10 getShotData --- Запрос параметра выстрела ${socket.nickname}`);
    console.log(Game[gameName][socket.nickname].shots);
    setInterval(() => {
      if (Game[gameName][socket.nickname].isDataUpdated && Game[gameName][socket.nickname].shots.length) {      
        const shotID = Game[gameName][socket.nickname].shots.splice(0, 1);
        console.log('условие отправки выполено ', shotID)
        socket.emit('sendShot', shotID);    
      }
    }, 1000);        
  });

  socket.on('sendClearSquireIDs', (gameName) => {    
    Game[gameName][socket.nickname].isDataUpdated = false;
  });
});


http.listen(port, (error) => {
  if (error) return console.log(`Error: ${error}`);
  console.log(`Server listening on port ${http.address().port}`)
});
// routes(app.io);
