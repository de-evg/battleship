import React from 'react';
import './App.css';
import Game from './components/Game.js';

import io from 'socket.io-client';
import URL from './data/url.js';

import MainPage from './pages/Main.js';
import MultyPlayerMenuPage from './pages/Multyplayer-menu.js';
import GameCreatingPage from './pages/Create-game.js'
import GameConnectingPage from './pages/Game-connecting.js';

function App() {
    class MainMenu extends React.Component {
        constructor() {
            super();
            this.state = {
                isMultiplayer: null,
                isHost: null,
                isClient: null,
                isWaitSecondPlayer: null,
                isStartGame: null,
                isArragementShips: null,
                gameName: '',
                games: {}
            };
        };

        handleSinglePlayerGameMode = () => {
            this.setState({
                isMultiplayer: false,
                isStartGame: true
            })
        };

        handleMultyPlayerGameMode = () => {
            this.setState({ isMultiplayer: true })
        };

        handelHostGameMode = () => {
            this.setState({ isHost: true })
        };

        handelClientGameMode = () => {
            this.socket.emit('getGames');
            this.socket.on('newGames', (Games) => {
                const games = Object.keys(Games);
                const gamesWithoutSecondPlayer = {};
                games.forEach(gameName => {
                   if (!Games[gameName].isSecondPlayerConnected) {
                    gamesWithoutSecondPlayer[gameName] = Games[gameName];
                   }
                });                
                this.setState({
                    isClient: true,
                    games: gamesWithoutSecondPlayer
                });
            });
        };

        handleSubmitServer = (evt) => {
            evt.preventDefault();
            const gameName = evt.target.gameName.value;
            this.socket.emit('sendGameName', gameName);
            this.setState({ isWaitSecondPlayer: true });
        };

        handleGameNameInputChange = (evt) => {
            this.setState({ gameName: evt.target.value });
        };

        handleSubmitClient = (evt) => {
            evt.preventDefault();
            const gameName = evt.target.gameName.value;
            this.socket.emit('sendSelectedGameName', gameName);
            this.setState({
                isArragementShips: true,
                gameName: gameName
            });
        };

        refreshGames = (evt) => {
            evt.preventDefault();
            this.socket.emit('getGames');
            this.socket.on('newGames', (Games) => {
                const games = Object.keys(Games);
                const gamesWithoutSecondPlayer = {};
                games.forEach(gameName => {
                   if (!Games[gameName].isSecondPlayerConnected) {
                    gamesWithoutSecondPlayer[gameName] = Games[gameName];
                   }
                }); 
                this.setState({                    
                    games: gamesWithoutSecondPlayer
                });
            });
        };

        componentDidMount() {
            this.socket = io(URL.SOCKET, { transports: ['websocket'] });
        };

        componentDidUpdate() {
            if (this.state.isHost && this.state.isWaitSecondPlayer) {
                const makeRequest = () => {
                    this.socket.emit('isSecondPlayerConnected', this.state.gameName);
                    this.socket.on('secondPlayerConnected', (game) => {
                        if (game.isSecondPlayerConnected) {
                            clearInterval(refreshConnect);
                            this.setState({
                                isArragementShips: true,
                                isWaitSecondPlayer: false
                            });
                        }
                    });
                };
                let refreshConnect = setInterval(makeRequest, 1000);
            };
        };

        render() {
            return (
                <>
                    {
                        this.state.isMultiplayer === null && 
                        <MainPage 
                            onSinglePlayerModeClick = {this.handleSinglePlayerGameMode}
                            onMultyPlayerModeClick = {this.handleMultyPlayerGameMode}
                        />
                    }

                    {
                        this.state.isMultiplayer && this.state.isHost === null && this.state.isClient === null &&
                        <MultyPlayerMenuPage 
                            onHostModeClick = {this.handelHostGameMode}
                            onClientModeClick = {this.handelClientGameMode}
                        />
                            
                    }
                    {
                        this.state.isMultiplayer && this.state.isHost && !this.state.isArragementShips &&
                        <GameCreatingPage 
                            gameName={this.state.gameName}
                            isWaitSecondPlayer={this.state.isWaitSecondPlayer}
                            onSubmit={this.handleSubmitServer}
                            onInputChange={this.handleGameNameInputChange}
                        />
                    }

                    {
                        this.state.isMultiplayer && this.state.isClient && !this.state.isArragementShips &&
                        <GameConnectingPage
                            games={this.state.games}
                            handleSubmit={this.handleSubmitClient}
                            handleRefreshGames={this.refreshGames}
                        />                        
                    }

                    {/* Поля для одиночной игры */}
                    {
                        this.state.isStartGame && !this.state.isMultiplayer &&
                        <Game isMultiplayer={this.state.isMultiplayer} />
                    }

                    {/* Поля для игрока-сервера */}
                    {
                        this.state.isArragementShips && this.state.isHost &&
                        <Game
                            isMultiplayer={this.state.isMultiplayer}
                            isHost={this.state.isHost}
                            gameName={this.state.gameName}
                            socket={this.socket}
                        />

                    }

                    {/* Поля для игрока-клиента */}
                    {
                        this.state.isArragementShips && this.state.isClient &&
                        <Game
                            isMultiplayer={this.state.isMultiplayer}
                            isHost={!!this.state.isHost}
                            isClient={!!this.state.isClient}
                            gameName={this.state.gameName}
                            socket={this.socket}
                        />                        

                    }

                </>
            );
        }
    }
    return <MainMenu />
};

export default App;