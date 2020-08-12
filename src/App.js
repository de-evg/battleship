import React from 'react';
import './App.css';
import Game from './components/Game.js';
import Client from './components/Client.js';
import io from 'socket.io-client';
import URL from './data/url.js';

function App() {
    class MainMenu extends React.Component {
        constructor() {
            super();
            this.state = {
                isMultiplayer: null,
                isServer: null,
                isClient: null,
                isWaitSecondPlayer: null,
                isStartGame: null,
                gameName: '',
                games: {}
            };
        };

        handleOnePlayerGameMode = () => {
            this.setState({
                isMultiplayer: false,
                isStartGame: true
            })
        };

        handleMultyPlayerGameMode = () => {
            this.setState({ isMultiplayer: true })
        };

        handelServerGameMode = () => {
            this.setState({ isServer: true })
        };

        handelClientGameMode = () => {
            this.socket.emit('getGames');
            this.socket.on('newGames', (games) => {
                this.setState({
                    isClient: true,
                    games: games
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
                isStartGame: true,
                gameName: gameName
            });
        };

        componentDidMount() {
            this.socket = io(URL.SOCKET, { transports: ['websocket'] });
        };

        componentDidUpdate() {
            if (this.state.isServer && this.state.isWaitSecondPlayer) {
                const makeRequest = () => {
                    this.socket.emit('isSecondPlayerConnected', this.state.gameName);
                    this.socket.on('secondPlayerConnected', (game) => {
                        if (game.isSecondPlayerConnected) {
                            clearInterval(refreshConnect);
                            this.setState({
                                isStartGame: true,
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
                        this.state.isMultiplayer === null
                            ? <div>
                                <button onClick={this.handleOnePlayerGameMode}>Одиночная игра</button>
                                <button onClick={this.handleMultyPlayerGameMode}>Сетевая игра</button>
                            </div>
                            : null
                    }

                    {
                        this.state.isMultiplayer && this.state.isServer === null && this.state.isClient === null
                            ? <div>
                                <button onClick={this.handelServerGameMode}>Сервер</button>
                                <button onClick={this.handelClientGameMode}>Клиент</button>
                            </div>
                            : null
                    }
                    {
                        this.state.isServer && (!this.state.isStartGame || !this.state.isWaitSecondPlayer)
                            ? <div>
                                <form id="game-name-form" onSubmit={this.handleSubmitServer} >
                                    <label>Введите название игры
                                        <input
                                            type="text"
                                            placeholder="Ваше название игры"
                                            id="gameName" name="gameName"
                                            value={this.state.gameName}
                                            onChange={this.handleGameNameInputChange}
                                            required />
                                    </label>
                                    <button type="submit">Создать игру</button>
                                </form>
                            </div>
                            : null
                    }
                    {
                        this.state.isWaitSecondPlayer
                            ? <div>
                                <p>Ждем второго игрока...</p>
                            </div>
                            : null
                    }
                    {
                        this.state.isClient && !this.state.isStartGame
                            ? <Client
                                games={this.state.games}
                                handleSubmit={this.handleSubmitClient} />
                            : null
                    }
                    {/* Поля для одиночной игры */}
                    {
                        this.state.isStartGame && !this.state.isMultiplayer
                            ? <section>
                                <Game isMultiplayer={this.state.isMultiplayer} />
                            </section>
                            : null
                    }
                    {/* Поля для игрока-сервера */}
                    {
                        this.state.isStartGame && this.state.isServer
                            ? <section>
                                <Game
                                    isMultiplayer={this.state.isMultiplayer}
                                    isServer={this.state.isServer}
                                    gameName={this.state.gameName}
                                    socket={this.socket}
                                />
                            </section>
                            : null
                    }
                    {/* Поля для игрока-клиента */}

                    {
                        this.state.isStartGame && this.state.isClient
                            ? <section>
                                <Game
                                    isMultiplayer={this.state.isMultiplayer}
                                    isServer={!!this.state.isServer}
                                    isClient={!!this.state.isClient}
                                    gameName={this.state.gameName}
                                    socket={this.socket}
                                />
                            </section>
                            : null
                    }

                </>
            );
        }
    }
    return <MainMenu />
};

export default App;