import React from 'react';
import UserField from './UserField.js';
import CompField from './CompField.js';
import generateShipList from '../data/ships.js';
import generateBasicGameFieldData from '../data/field.js';
import aimList from '../data/moveComputerData.js';
import compShipList from '../data/randomShips.js';
import utils from '../data/utils.js';
import WinnerMessage from './WinnerMessage.js';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerName: null,
            shotsData: null,
            opponentData: '',
            playerData: {
                currentGameFieldsData: generateBasicGameFieldData(),
                shipsData: generateShipList(),
                lastComputerShotCoord: null,
                isVertical: utils.randomBoolean(),
                isDirectionToUpper: utils.randomBoolean(),
                isOrietationChanged: false,
                isDirectionChanged: false,
                aimList: aimList,
                isReplayMove: false,
                isKeepShooting: false,
                lastHitCoord: null,
                intendedAims: {
                    verticalUp: [],
                    verticalDown: [],
                    horizontalUp: [],
                    horizontalDown: []
                },
                isPlayerReady: false
            },
            computerData: {
                currentGameFieldsData: generateBasicGameFieldData(),
                shipsData: compShipList,
                isReplayMove: false,
                shotStatus: null,
                lastShot: null
            },
            arrangementModeSettings: {
                isAllShipPlaced: false,
                shipTypeOnPlace: 4,
                shipNumber: 0,
                currentShipOnPlace: null,
            },
            gameMode: {
                isStart: true,
                isArrangement: false,
                isGame: false,
                isOver: false
            },
            game: {
                isPlayerBoard: true,
                isPlayerMove: null,
                isPlayerWin: null
            }
        }
    };

    postGameData = () => {
        if (this.props.isMultiplayer) {
            const state = {};
            state.gameName = this.props.gameName;
            state.isPlayerMove = null;
            if (this.state.gameMode.isArrangement) {
                if (this.props.isServer) {
                    state.currentGameFieldsData = this.state.playerData.currentGameFieldsData;
                    state.shipsData = this.state.playerData.shipsData;
                }
                if (this.props.isClient) {
                    state.currentGameFieldsData = this.state.playerData.currentGameFieldsData;
                    state.shipsData = this.state.playerData.shipsData;
                }
            }
            if (this.state.gameMode.isGame) {
                if (this.props.isServer) {
                    state.nickname = 'serverPlayer';
                    state.currentGameFieldsData = this.state.playerData.currentGameFieldsData;
                    state.shipsData = this.state.playerData.shipsData;
                    state.currentGameFieldsData = this.state.opponentData.currentGameFieldsData;
                    state.shipsData = this.state.opponentData.shipsData;
                }
                if (this.props.isClient) {
                    state.nickname = 'clientPlayer';
                    state.currentGameFieldsData = this.state.opponentData.currentGameFieldsData;
                    state.shipsData = this.state.opponentData.shipsData;
                    state.currentGameFieldsData = this.state.playerData.currentGameFieldsData;
                    state.shipsData = this.state.playerData.shipsData;
                }
            }
            this.props.socket.emit('sendNewState', state)
        }
    };

    getGameData = () => {
        if (this.props.isMultiplayer && this.state.gameMode.isGame) {
            this.props.socket.emit(`getGame`, this.props.gameName);
            this.props.socket.on(`sendGame`, (data) => {
                if (data && data.clientPlayer && data.serverPlayer) {
                    clearInterval(this.makeGetRequest);
                    if (!data.serverPlayer || !data.clientPlayer) {
                        debugger;
                    }

                    let newOpponentData;
                    const playerData = this.state.playerData;
                    const game = this.state.game;
                    console.log(data);
                    if (this.props.isServer) {
                        newOpponentData = data.clientPlayer;
                        playerData.currentGameFieldsData = data.serverPlayer.currentGameFieldsData;
                        playerData.shipsData = data.serverPlayer.shipsData;
                        game.isPlayerMove = data.serverPlayer.isPlayerMove;
                        console.log(data, 'на сервере');
                        this.setState({
                            opponentData: newOpponentData,
                            playerData: playerData,
                            game: game
                        });
                    }
                    if (this.props.isClient) {
                        newOpponentData = data.serverPlayer;
                        playerData.currentGameFieldsData = data.clientPlayer.currentGameFieldsData;
                        playerData.shipsData = data.clientPlayer.shipsData;
                        game.isPlayerMove = data.clientPlayer.isPlayerMove;
                        console.log(data, 'на клиенте');
                        this.setState({
                            opponentData: newOpponentData,
                            playerData: playerData,
                            game: game
                        });
                    }
                }
            });
        }
    };

    checkCoordsOnBlock(coords) {
        const isFieldBlocked = coords.find((coordinate) => {
            const columnNumber = coordinate.slice(0, 1);
            const rowNumber = +coordinate.slice(1);
            const fieldOnCheck = this.state.playerData.currentGameFieldsData["column" + columnNumber][rowNumber];
            return fieldOnCheck.isBlocked ? true : false;
        });
        return !!isFieldBlocked;
    };

    handleBtnClick = () => {
        const newGameMode = this.state.gameMode;
        newGameMode.isStart = false;
        newGameMode.isArrangement = true;
        const newArrangementModeSettings = this.state.arrangementModeSettings;
        newArrangementModeSettings.currentShipOnPlace = this.state.playerData.shipsData["deck" + this.state.arrangementModeSettings.shipTypeOnPlace][0];

        this.setState({
            gameMode: newGameMode,
            arrangementModeSettings: newArrangementModeSettings
        });
    };

    handleMouseOver = (evtOver) => {
        if (this.state.gameMode.isArrangement && this.state.arrangementModeSettings.currentShipOnPlace) {
            const newArrangementModeSettings = this.state.arrangementModeSettings;
            const currentShipOnPlace = this.state.arrangementModeSettings.currentShipOnPlace;
            currentShipOnPlace.coords = [];
            newArrangementModeSettings.currentShipOnPlace = currentShipOnPlace;
            this.setState({arrangementModeSettings: newArrangementModeSettings});

            const columnNumber = +evtOver.target.id.slice(0, 1);
            const rowNumber = +evtOver.target.id.slice(1);
            const deckLength = +this.state.arrangementModeSettings.currentShipOnPlace.id.slice(0, 1);

            if (this.state.arrangementModeSettings.currentShipOnPlace.isVertical) {
                for (let i = 0; i < deckLength; i++) {
                    if (deckLength <= 10 - rowNumber) {
                        currentShipOnPlace.coords.push(columnNumber.toString() + (rowNumber + i));
                    } else {
                        currentShipOnPlace.coords.push(columnNumber.toString() + (rowNumber - i));
                    }
                }
            } else {
                for (let i = 0; i < deckLength; i++) {
                    if (deckLength <= 10 - columnNumber) {
                        currentShipOnPlace.coords.push((columnNumber + i).toString() + rowNumber);
                    } else {
                        currentShipOnPlace.coords.push((columnNumber - i).toString() + rowNumber);
                    }
                }
            }

            const isCoordsBloked = this.checkCoordsOnBlock(this.state.arrangementModeSettings.currentShipOnPlace.coords)
            if (!isCoordsBloked) {
                const newArrangementModeSettings = this.state.arrangementModeSettings;
                newArrangementModeSettings.currentShipOnPlace = currentShipOnPlace;
                this.setState({currentShipOnPlace: currentShipOnPlace});

                const previewGameFieldsData = this.state.playerData.currentGameFieldsData;
                currentShipOnPlace.coords.forEach((coord) => {
                    previewGameFieldsData["column" + coord.slice(0, 1)][coord.slice(1)].isShip = true;
                });
                const newplayerData = this.state.playerData;
                newplayerData.currentGameFieldsData = previewGameFieldsData
                this.setState({playerData: newplayerData});
            }
        }
    };

    handleMouseOut = (evtOut) => {
        if (this.state.gameMode.isArrangement && this.state.arrangementModeSettings.currentShipOnPlace && !evtOut.target.classList.contains('.ship')) {
            if (!this.checkCoordsOnBlock(this.state.arrangementModeSettings.currentShipOnPlace.coords)) {
                const currentShipOnPlace = this.state.arrangementModeSettings.currentShipOnPlace;
                const nextGameFieldsData = this.state.playerData.currentGameFieldsData;
                currentShipOnPlace.coords.forEach((coord) => {
                    nextGameFieldsData["column" + coord.slice(0, 1)][coord.slice(1)].isShip = false;
                    nextGameFieldsData["column" + coord.slice(0, 1)][coord.slice(1)].isBlocked = false;
                });
                const newplayerData = this.state.playerData;
                newplayerData.currentGameFieldsData = nextGameFieldsData
                this.setState({playerData: newplayerData});
                currentShipOnPlace.coords = [];
                const newArrangementModeSettings = this.state.arrangementModeSettings;
                newArrangementModeSettings.currentShipOnPlace = currentShipOnPlace;
                this.setState({arrangementModeSettings: newArrangementModeSettings});
            }
        }
    };

    handleBattlefieldClick = (evt) => {
        if (this.state.gameMode.isArrangement && !evt.target.classList.contains('.ship') && !this.state.arrangementModeSettings.isAllShipPlaced
            && !this.checkCoordsOnBlock(this.state.arrangementModeSettings.currentShipOnPlace.coords)) {
            const shipType = "deck" + this.state.arrangementModeSettings.currentShipOnPlace.id.slice(0, 1);
            const shipNumber = +this.state.arrangementModeSettings.currentShipOnPlace.id.slice(-1);

            const currentShipOnPlace = this.state.arrangementModeSettings.currentShipOnPlace;
            currentShipOnPlace.isPlaced = true;
            const currentShipsData = this.state.playerData.shipsData;
            currentShipsData[shipType][shipNumber] = currentShipOnPlace;

            const nextGameFieldsData = this.state.playerData.currentGameFieldsData;
            currentShipOnPlace.coords.forEach((coord) => {
                nextGameFieldsData["column" + coord.slice(0, 1)][coord.slice(1)].isShip = true;
                nextGameFieldsData["column" + coord.slice(0, 1)][coord.slice(1)].isBlocked = true;
                nextGameFieldsData["column" + coord.slice(0, 1)][coord.slice(1)].shipID = currentShipOnPlace.id;

                if (+coord.slice(0, 1) > 0) {
                    nextGameFieldsData["column" + (+coord.slice(0, 1) - 1)][coord.slice(1)].isBlocked = true;
                }
                if (+coord.slice(0, 1) < 9) {
                    nextGameFieldsData["column" + (+coord.slice(0, 1) + 1)][+coord.slice(1)].isBlocked = true;
                }
                if (+coord.slice(1) > 0) {
                    nextGameFieldsData["column" + coord.slice(0, 1)][+coord.slice(1) - 1].isBlocked = true;
                }
                if (+coord.slice(1) < 9) {
                    nextGameFieldsData["column" + coord.slice(0, 1)][+coord.slice(1) + 1].isBlocked = true;
                }

                if (+coord.slice(0, 1) < 9 && +coord.slice(1) < 9) {
                    nextGameFieldsData["column" + (+coord.slice(0, 1) + 1)][+coord.slice(1) + 1].isBlocked = true;
                }
                if (+coord.slice(0, 1) > 0 && +coord.slice(1) > 0) {
                    nextGameFieldsData["column" + (+coord.slice(0, 1) - 1)][+coord.slice(1) - 1].isBlocked = true;
                }
                if (+coord.slice(0, 1) < 9 && +coord.slice(1) > 0) {
                    nextGameFieldsData["column" + (+coord.slice(0, 1) + 1)][+coord.slice(1) - 1].isBlocked = true;
                }
                if (+coord.slice(0, 1) > 0 && +coord.slice(1) < 9) {
                    nextGameFieldsData["column" + (+coord.slice(0, 1) - 1)][+coord.slice(1) + 1].isBlocked = true;
                }
            });

            const isShipsTypePlaced = !(this.state.playerData.shipsData["deck" + this.state.arrangementModeSettings.shipTypeOnPlace].find((ship) => ship.isPlaced === false));

            const updatedShipTypeOnPlace = isShipsTypePlaced ? this.state.arrangementModeSettings.shipTypeOnPlace - 1 : this.state.arrangementModeSettings.shipTypeOnPlace;
            const nextShipOnPlaced = updatedShipTypeOnPlace ?
                this.state.playerData.shipsData["deck" + updatedShipTypeOnPlace].find((shipData) => !shipData.isPlaced)
                :
                null;

            const newplayerData = this.state.playerData;
            newplayerData.currentGameFieldsData = nextGameFieldsData;
            newplayerData.shipsData = currentShipsData;

            const newArrangementModeSettings = this.state.arrangementModeSettings;
            newArrangementModeSettings.currentShipOnPlace = nextShipOnPlaced;
            newArrangementModeSettings.shipTypeOnPlace = updatedShipTypeOnPlace;
            newArrangementModeSettings.isAllShipPlaced = !this.state.arrangementModeSettings.shipTypeOnPlace;

            this.setState({
                playerData: newplayerData,
                arrangementModeSettings: newArrangementModeSettings
            });
        }
    };

    handleRotate = () => {
        if (this.state.gameMode.isArrangement && !this.state.arrangementModeSettings.isAllShipPlaced) {
            const newArrangementModeSettings = this.state.arrangementModeSettings;
            const currentShipOnPlace = this.state.arrangementModeSettings.currentShipOnPlace;
            currentShipOnPlace.isVertical = !currentShipOnPlace.isVertical;
            newArrangementModeSettings.currentShipOnPlace = currentShipOnPlace;
            this.setState({arrangementModeSettings: newArrangementModeSettings});
        }
    };

    handleBtnPress = (evtPress) => {
        console.log(evtPress.charCode);
        if (this.state.gameMode.isArrangement && !this.state.arrangementModeSettings.isAllShipPlaced && evtPress.key === 'Tab') {
            evtPress.preventDefault();
            const newArrangementModeSettings = this.state.arrangementModeSettings;
            const currentShipOnPlace = this.state.arrangementModeSettings.currentShipOnPlace;
            currentShipOnPlace.isVertical = !currentShipOnPlace.isVertical;
            newArrangementModeSettings.currentShipOnPlace = currentShipOnPlace;
            this.setState({arrangementModeSettings: newArrangementModeSettings});
        }
    };

    handleBtnPlayClick = () => {
        const playerData = this.state.playerData;
        playerData.isPlayerReady = true;
        const gameMode = this.state.gameMode;
        const newcomputerData = this.state.computerData;
        if (this.props.isMultiplayer && this.state.playerData.isPlayerReady && this.state.gameMode.isArrangement) {
            const state = {};
            state.nickname = this.props.isServer ? 'serverPlayer' : 'clientPlayer';
            state.gameName = this.props.gameName;
            state.isPlayerReady = playerData.isPlayerReady;
            state.isPlayerMove = this.state.game.isPlayerMove;
            state.currentGameFieldsData = playerData.currentGameFieldsData;
            state.shipsData = playerData.shipsData;
            this.props.socket.emit('playerReady', state);
        }
        if (!this.props.isMultiplayer) {
            const placeComputerShips = (fieldData, shipsData) => {
                Object.keys(shipsData).forEach((shipType) => shipsData[shipType].forEach((ship) => {
                    ship.coords.map((coord) => {
                        fieldData["column" + coord.slice(0, 1)][coord.slice(1)].isShip = true;
                        fieldData["column" + coord.slice(0, 1)][coord.slice(1)].isBlocked = true;
                        fieldData["column" + coord.slice(0, 1)][coord.slice(1)].shipID = ship.id;
                        return coord;
                    });
                }))
                return fieldData;
            }
            const placedComputerShipsOnField = placeComputerShips(this.state.computerData.currentGameFieldsData, this.state.computerData.shipsData);
            const newcomputerData = this.state.computerData;
            newcomputerData.currentGameFieldsData = placedComputerShipsOnField;
            gameMode.isArrangement = false;
            gameMode.isGame = true;
        }
        this.setState({
            playerData: playerData,
            computerData: newcomputerData,
            gameMode: gameMode
        });
    };

    handleBattlefieldToggle(evt) {
        evt.preventDefault();
        const currentGameBoardElement = document.querySelector(".current-board");
        const hiddenGameBoardElement = document.querySelector(".hidden-board");
        currentGameBoardElement.classList.toggle("current-board");
        currentGameBoardElement.classList.toggle("hidden-board");
        hiddenGameBoardElement.classList.toggle("current-board");
        hiddenGameBoardElement.classList.toggle("hidden-board");
    }
    //написать условия для корректной смены класса

    checkOnDestroyedShips(shipsData) {
        const shipsTypes = Object.keys(shipsData);
        let survivingShips = [];
        shipsTypes.forEach((type) => {
            const ships = shipsData[type].filter((ship) => !ship.isDestroyed);
            survivingShips = survivingShips.concat(ships);
        });
        return !survivingShips.length;
    };

    gameOver(firstPlayerShips, secondPlayerShips) {
        const gameMode = this.state.gameMode;
        const game = this.state.game;
        const isFirstPlayerAllShipsDestroyed = this.checkOnDestroyedShips(firstPlayerShips);
        const isSecondPlayerAllShipsDestroyed = this.checkOnDestroyedShips(secondPlayerShips);
        gameMode.isOver = isFirstPlayerAllShipsDestroyed || isSecondPlayerAllShipsDestroyed ? true : false;
        if (gameMode.isOver) {
            gameMode.isGame = false;
            game.isPlayerWin = isSecondPlayerAllShipsDestroyed ? true : false;
            this.setState({
                gameMode: gameMode,
                game: game
            });
        }
    };

    computerMove() {
        if (this.state.gameMode.isGame && !this.state.game.isPlayerMove) {
            const aimList = this.state.playerData.aimList;

            const generateRandomAimIndex = () => {
                const aimIndex = utils.randomNumber(0, aimList.length);
                if (aimIndex === -1) {
                    console.log('строка 258');
                    debugger;
                }
                return aimIndex;
            };
            const computerData = this.state.computerData;

            const changeDirection = (playerData) => {
                playerData.isDirectionToUpper = !this.state.playerData.isDirectionToUpper;
                playerData.isDirectionChanged = !playerData.isDirectionChanged;
            };

            const changeOrientation = (playerData) => {
                playerData.isVertical = !this.state.playerData.isVertical;
                playerData.isOrietationChanged = !playerData.isOrietationChanged;
            };

            const shot = (aimIndex) => {
                if (this.state.gameMode.isGame) {
                    console.log(this.state.computerData.shipsData);
                    const aimList = this.state.playerData.aimList;
                    const gameStatus = this.state.game;
                    const playerData = this.state.playerData;
                    const computerData = this.state.computerData;
                    const battlefield = playerData.currentGameFieldsData;

                    const aimNumber = aimList.splice(aimIndex, 1);
                    computerData.lastShot = aimNumber[0];

                    const column = aimNumber[0].slice(0, 1);
                    const row = aimNumber[0].slice(1);

                    const onHit = () => {
                        const shipType = battlefield["column" + column][row].shipID.slice(0, 1);
                        const shipNumber = battlefield["column" + column][row].shipID.slice(-1);
                        const shipOnFire = playerData.shipsData["deck" + shipType][shipNumber];

                        if (shipOnFire) {
                            const x = shipOnFire.coords.find((coord) => {
                                return aimNumber[0] === coord;
                            });
                            console.log('x =', x);
                        }

                        const updateShipsData = () => {
                            if (shipOnFire.hits.length) {
                                shipOnFire.hits.splice(0, 1);
                            }
                            shipOnFire.isDestroyed = shipOnFire.hits.length === 0 ? true : false;
                            playerData.shipsData["deck" + shipType][shipNumber] = shipOnFire;
                        };

                        const updateFieldsData = () => {
                            if (shipOnFire.isDestroyed) {
                                const splitedElements = [];
                                shipOnFire.coords.forEach((coord) => {
                                    let columnNumber = coord.slice(0, 1);
                                    let rowNumber = coord.slice(-1);
                                    battlefield["column" + columnNumber][rowNumber].isDestroyed = true;
                                    if (+columnNumber > 0) {
                                        if (!battlefield["column" + (+columnNumber - 1)][rowNumber].isShip) {
                                            battlefield["column" + (+columnNumber - 1)][rowNumber].isBlocked = true;
                                            battlefield["column" + (+columnNumber - 1)][rowNumber].isMiss = true;
                                            const aimIndex = aimList.findIndex((aim) => aim === (+columnNumber - 1).toString() + rowNumber);
                                            if (aimIndex !== -1) {
                                                const el = aimList.splice(aimIndex, 1);
                                                splitedElements.push(el);
                                            }
                                        }
                                    }
                                    if (+columnNumber < 9) {
                                        if (!battlefield["column" + (+columnNumber + 1)][rowNumber].isShip) {
                                            battlefield["column" + (+columnNumber + 1)][rowNumber].isBlocked = true;
                                            battlefield["column" + (+columnNumber + 1)][rowNumber].isMiss = true;
                                            const aimIndex = aimList.findIndex((aim) => aim === (+columnNumber + 1).toString() + rowNumber);
                                            if (aimIndex !== -1) {
                                                const el = aimList.splice(aimIndex, 1);
                                                splitedElements.push(el);
                                            }
                                        }
                                    }
                                    if (+rowNumber > 0) {
                                        if (!battlefield["column" + columnNumber][+rowNumber - 1].isShip) {
                                            battlefield["column" + columnNumber][+rowNumber - 1].isBlocked = true;
                                            battlefield["column" + columnNumber][+rowNumber - 1].isMiss = true;
                                            const aimIndex = aimList.findIndex((aim) => aim === columnNumber + (+rowNumber - 1).toString());
                                            if (aimIndex !== -1) {
                                                const el = aimList.splice(aimIndex, 1);
                                                splitedElements.push(el);
                                            }
                                        }
                                    }
                                    if (+rowNumber < 9) {
                                        if (!battlefield["column" + columnNumber][+rowNumber + 1].isShip) {
                                            battlefield["column" + columnNumber][+rowNumber + 1].isBlocked = true;
                                            battlefield["column" + columnNumber][+rowNumber + 1].isMiss = true;
                                            const aimIndex = aimList.findIndex((aim) => aim === columnNumber + (+rowNumber + 1).toString());
                                            if (aimIndex !== -1) {
                                                const el = aimList.splice(aimIndex, 1);
                                                splitedElements.push(el);
                                            }
                                        }
                                    }
                                    if (+columnNumber < 9 && +rowNumber < 9) {
                                        battlefield["column" + (+columnNumber + 1)][+rowNumber + 1].isBlocked = true;
                                        battlefield["column" + (+columnNumber + 1)][+rowNumber + 1].isMiss = true;
                                        const aimIndex = aimList.findIndex((aim) => aim === (+columnNumber + 1).toString() + (+rowNumber + 1).toString());
                                        if (aimIndex !== -1) {
                                            const el = aimList.splice(aimIndex, 1);
                                            splitedElements.push(el);
                                        }
                                    }
                                    if (+columnNumber > 0 && +rowNumber > 0) {
                                        battlefield["column" + (+columnNumber - 1)][+rowNumber - 1].isBlocked = true;
                                        battlefield["column" + (+columnNumber - 1)][+rowNumber - 1].isMiss = true;
                                        const aimIndex = aimList.findIndex((aim) => aim === (+columnNumber - 1).toString() + (+rowNumber - 1).toString());
                                        if (aimIndex !== -1) {
                                            const el = aimList.splice(aimIndex, 1);
                                            splitedElements.push(el);
                                        }
                                    }
                                    if (+columnNumber < 9 && +rowNumber > 0) {
                                        battlefield["column" + (+columnNumber + 1)][+rowNumber - 1].isBlocked = true;
                                        battlefield["column" + (+columnNumber + 1)][+rowNumber - 1].isMiss = true;
                                        const aimIndex = aimList.findIndex((aim) => aim === (+columnNumber + 1).toString() + (+rowNumber - 1).toString());
                                        if (aimIndex !== -1) {
                                            const el = aimList.splice(aimIndex, 1);
                                            splitedElements.push(el);
                                        }
                                    }
                                    if (+columnNumber > 0 && +rowNumber < 9) {
                                        battlefield["column" + (+columnNumber - 1)][+rowNumber + 1].isBlocked = true;
                                        battlefield["column" + (+columnNumber - 1)][+rowNumber + 1].isMiss = true;
                                        const aimIndex = aimList.findIndex((aim) => aim === (+columnNumber - 1).toString() + (+rowNumber + 1).toString());
                                        if (aimIndex !== -1) {
                                            const el = aimList.splice(aimIndex, 1);
                                            splitedElements.push(el);
                                        }
                                    }
                                    console.log(splitedElements);
                                });
                            } else {
                                battlefield["column" + column][row].isHit = true;
                            }
                        };

                        const generateIntendedAims = () => {
                            playerData.lastComputerShotCoord = aimNumber[0];

                            if (playerData.intendedAims.verticalUp.length === 0 &&
                                playerData.intendedAims.verticalDown.length === 0 &&
                                playerData.intendedAims.horizontalUp.length === 0 &&
                                playerData.intendedAims.horizontalDown.length === 0) {

                                let column = playerData.lastComputerShotCoord.slice(0, 1);
                                let row = playerData.lastComputerShotCoord.slice(1);
                                let columnUp = column;
                                let columnDown = column;
                                let rowUp = row;
                                let rowDown = row;

                                const checkCoords = (coord) => {
                                    const coordIndex = aimList.findIndex((aimCoord) => aimCoord === coord);
                                    return coordIndex
                                }

                                if (+column === 0 && +row === 0) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnUp + 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalUp.length > 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowUp + 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalUp.length > 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnUp < 9) {
                                            columnUp = +columnUp + 1;
                                        }
                                        if (rowUp < 9) {
                                            rowUp = +rowUp + 1;
                                        }
                                    }
                                }

                                if (+column === 9 && +row === 0) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnDown - 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalDown.length > 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowUp + 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalUp.length > 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnDown > 0) {
                                            columnDown = +columnDown - 1;
                                        }
                                        if (rowUp < 9) {
                                            rowUp = +rowUp + 1;
                                        }
                                    }
                                }

                                if (+column === 9 && +row === 9) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnDown - 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalDown.length > 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowDown - 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalDown.length > 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnDown > 0) {
                                            columnDown = +columnDown - 1;
                                        }
                                        if (rowUp > 0) {
                                            rowUp = +rowUp - 1;
                                        }
                                    }
                                }

                                if (+column === 0 && +row === 9) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnUp + 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalUp.length > 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowDown - 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalDown.length > 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnUp > 0) {
                                            columnUp = +columnUp + 1;
                                        }
                                        if (rowDown > 0) {
                                            rowDown = +rowDown - 1;
                                        }
                                    }
                                }


                                if ((+column > 0 && +column < 9) && +row === 0) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnUp + 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalUp.length > 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords((+columnDown - 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalDown.length > 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowUp + 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalUp.length > 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowDown - 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalDown.length > 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnUp > 0) {
                                            columnUp = +columnUp + 1;
                                        }
                                        if (columnDown > 0) {
                                            columnDown = +columnDown - 1;
                                        }
                                        if (rowUp > 0) {
                                            rowUp = +rowUp + 1;
                                        }
                                    }

                                }

                                if ((+column > 0 && +column < 9) && +row === 9) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnUp + 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalUp.length > 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords((+columnDown - 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalDown.length > 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowDown - 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalDown.length > 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnUp > 0) {
                                            columnUp = +columnUp + 1;
                                        }
                                        if (columnDown > 0) {
                                            columnDown = +columnDown - 1;
                                        }
                                        if (rowDown > 0) {
                                            rowDown = +rowDown - 1;
                                        }
                                    }
                                }

                                if (+column === 0 && (+row > 0 && +row < 9)) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnUp + 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalUp.length > 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowUp + 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalUp.length > 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowDown - 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalDown.length > 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnUp > 0) {
                                            columnUp = +columnUp + 1;
                                        }
                                        if (rowUp > 0) {
                                            rowUp = +rowUp + 1;
                                        }
                                        if (rowDown > 0) {
                                            rowDown = +rowDown - 1;
                                        }
                                    }
                                }

                                if (+column === 9 && (+row > 0 && +row < 9)) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnDown - 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalDown.length > 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowUp + 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalUp.length > 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowDown - 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalDown.length > 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnDown > 0) {
                                            columnDown = +columnDown - 1;
                                        }
                                        if (rowUp > 0) {
                                            rowUp = +rowUp + 1;
                                        }
                                        if (rowDown > 0) {
                                            rowDown = +rowDown - 1;
                                        }
                                    }
                                }

                                if ((+column > 0 && +column < 9) && (+row > 0 && +row < 9)) {
                                    for (let i = 0; i < +shipOnFire.id.slice(0, 1) - 1; i++) {
                                        let checkedCoordIndex = checkCoords((+columnUp + 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalUp.length > 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords((+columnDown - 1).toString() + row);
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.horizontalDown.length > 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.horizontalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowUp + 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalUp.length > 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalUp.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        checkedCoordIndex = checkCoords(column + (+rowDown - 1).toString());
                                        if (checkedCoordIndex !== -1) {
                                            if (i > 0 && playerData.intendedAims.verticalDown.length > 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                            if (i === 0) {
                                                playerData.intendedAims.verticalDown.push(aimList[checkedCoordIndex]);
                                            }
                                        }

                                        if (columnUp > 0) {
                                            columnUp = +columnUp + 1;
                                        }
                                        if (columnDown > 0) {
                                            columnDown = +columnDown - 1;
                                        }
                                        if (rowUp > 0) {
                                            rowUp = +rowUp + 1;
                                        }
                                        if (rowDown > 0) {
                                            rowDown = +rowDown - 1;
                                        }
                                    }
                                }
                                if (playerData.intendedAims.verticalUp.length === 0) {
                                    playerData.isVertical = true;
                                    playerData.isDirectionToUpper = false;
                                }
                                if (playerData.intendedAims.verticalDown.length === 0) {
                                    playerData.isVertical = true;
                                    playerData.isDirectionToUpper = true;
                                }
                                if (playerData.intendedAims.verticalUp.length === 0 && playerData.intendedAims.verticalDown.length === 0) {
                                    playerData.isVertical = false; playerData.isDirectionToUpper = true;
                                }

                                if (playerData.intendedAims.horizontalUp.length === 0) {
                                    playerData.isVertical = false;
                                    playerData.isDirectionToUpper = false;
                                }
                                if (playerData.intendedAims.horizontalDown.length === 0) {
                                    playerData.isVertical = false;
                                    playerData.isDirectionToUpper = true;
                                }
                                if (playerData.intendedAims.horizontalUp.length === 0 && playerData.intendedAims.horizontalDown.length === 0) {
                                    playerData.isVertical = true;
                                }
                            }
                        };

                        if (shipOnFire.hits.length === +shipType) {
                            generateIntendedAims();
                        }
                        updateShipsData();
                        updateFieldsData();
                        if (shipOnFire.hits.length > 0) {
                            playerData.isKeepShooting = true;
                            computerData.shotStatus = 'afterHit';
                        } else {
                            computerData.shotStatus = 'afterDestroy';
                            playerData.isKeepShooting = false;
                            playerData.intendedAims = {
                                verticalUp: [],
                                verticalDown: [],
                                horizontalUp: [],
                                horizontalDown: []
                            };
                            playerData.lastComputerShotCoord = null;
                        };
                        playerData.isReplayMove = true;
                        gameStatus.isPlayerMove = false;

                    };

                    const onMiss = () => {
                        const prevShotStatus = this.state.computerData.shotStatus;

                        if (playerData.isKeepShooting) {
                            if (prevShotStatus === 'afterHit' && !this.state.playerData.isDirectionChanged) {
                                changeDirection(playerData);
                            }
                            if (prevShotStatus === 'afterMiss' && playerData.isDirectionChanged && !playerData.isOrietationChanged) {
                                changeOrientation(playerData);
                            }
                            if (prevShotStatus === 'afterMiss' && playerData.isOrietationChanged) {
                                changeDirection(playerData);
                            }
                        }

                        const newShotStatus = 'afterMiss';
                        computerData.shotStatus = newShotStatus;
                        battlefield["column" + column][row].isMiss = true;
                        playerData.isReplayMove = false;
                        gameStatus.isPlayerMove = true;
                    };

                    battlefield["column" + column][row].isShip ? onHit() : onMiss();

                    this.setState({
                        playerData: playerData,
                        computerData: computerData,
                        game: gameStatus
                    });
                }
            };

            const keepShotOnShip = () => {
                const playerData = this.state.playerData;
                const generateDirection = () => {
                    let direction = this.state.playerData.isVertical ? 'vertical' : 'horizontal';
                    direction = this.state.playerData.isDirectionToUpper ? direction + "Up" : direction + "Down"
                    return direction;
                };

                let direction = generateDirection();

                if (!playerData.intendedAims[direction].length) {
                    changeDirection(playerData);
                    direction = generateDirection();
                    if (!playerData.intendedAims[direction].length) {
                        changeOrientation(playerData);
                        direction = generateDirection();
                    } if (!playerData.intendedAims[direction].length) {
                        changeDirection(playerData);
                        direction = generateDirection();
                    }
                }

                const intendedAimCoords = playerData.intendedAims[direction];
                let intendedCoord = intendedAimCoords.splice(0, 1)[0];
                const aimIndex = aimList.findIndex((aim) => intendedCoord === aim);
                shot(aimIndex);
            };

            const makeShot = () => {
                switch (computerData.shotStatus) {
                    case 'afterHit':
                        keepShotOnShip();
                        break;
                    case 'afterDestroy':
                        shot(generateRandomAimIndex());
                        break;
                    case 'afterMiss':
                        this.state.playerData.isKeepShooting ? keepShotOnShip() : shot(generateRandomAimIndex());
                        break;
                    default: shot(generateRandomAimIndex());
                }
            };
            makeShot();
            this.gameOver(this.state.playerData.shipsData, this.state.computerData.shipsData);
        }
    };

    handlePlayerMove = (evt) => {
        if (evt.target.tagName === 'LI' && this.state.gameMode.isGame && (this.state.game.isPlayerMove ||
            (this.state.isPlayerMove && this.props.isServer) || (this.state.isPlayerMove && this.props.isClient))
        ) {
            const newOpponentData = this.props.isMultiplayer ? this.state.opponentData : this.state.computerData;
            const gameStatus = this.state.game;
            if (this.state.gameMode.isGame && (this.state.game.isPlayerMove || (this.state.isPlayerMove && this.props.isServer) ||
                (this.state.isPlayerMove && this.props.isClient)) &&
                (!newOpponentData.currentGameFieldsData['column' + evt.target.id.slice(0, 1)][evt.target.id.slice(-1)].isHit &&
                    !newOpponentData.currentGameFieldsData['column' + evt.target.id.slice(0, 1)][evt.target.id.slice(-1)].isMiss)) {
                const target = evt.target;
                const shipList = this.props.isMultiplayer ? this.state.opponentData.shipsData : this.state.computerData.shipsData;
                const currentGameFieldsData = this.props.isMultiplayer ? this.state.opponentData.currentGameFieldsData : this.state.computerData.currentGameFieldsData
                const columnNumber = target.id.slice(0, 1);
                const rowNumber = target.id.slice(1);

                const checkFieldOnShip = () => {
                    const isShip = currentGameFieldsData["column" + columnNumber][rowNumber].isShip;
                    return isShip;
                }

                const processOnHit = () => {
                    const shipType = currentGameFieldsData["column" + columnNumber][rowNumber].shipID.slice(0, 1);
                    const shipNumber = currentGameFieldsData["column" + columnNumber][rowNumber].shipID.slice(-1);
                    const shipOnFire = shipList["deck" + shipType][shipNumber];

                    const updateShipsOnHit = () => {
                        if (shipOnFire.hits.length > 0) {
                            shipOnFire.hits.splice(0, 1);
                            shipOnFire.isDestroyed = shipOnFire.hits.length === 0 ? true : false;
                        } else {
                            shipOnFire.isDestroyed = true;
                        }
                        shipList["deck" + shipType][shipNumber] = shipOnFire;
                        return shipList;
                    };

                    const updateFieldOnHit = () => {
                        currentGameFieldsData["column" + columnNumber][rowNumber].isHit = true;
                        if (shipOnFire.isDestroyed) {
                            shipOnFire.coords.forEach((coord) => {
                                let columnNumber = coord.slice(0, 1);
                                let rowNumber = coord.slice(-1);
                                currentGameFieldsData["column" + columnNumber][rowNumber].isDestroyed = true;

                                if (columnNumber > 0) {
                                    currentGameFieldsData["column" + (+columnNumber - 1)][rowNumber].isMiss = true;
                                }
                                if (columnNumber < 9) {
                                    currentGameFieldsData["column" + (+columnNumber + 1)][rowNumber].isMiss = true;
                                }
                                if (rowNumber > 0) {
                                    currentGameFieldsData["column" + columnNumber][+rowNumber - 1].isMiss = true;
                                }
                                if (rowNumber < 9) {
                                    currentGameFieldsData["column" + columnNumber][+rowNumber + 1].isMiss = true;
                                }

                                if (columnNumber < 9 && rowNumber < 9) {
                                    currentGameFieldsData["column" + (+columnNumber + 1)][+rowNumber + 1].isMiss = true;
                                }
                                if (columnNumber > 0 && rowNumber > 0) {
                                    currentGameFieldsData["column" + (+columnNumber - 1)][+rowNumber - 1].isMiss = true;
                                }
                                if (columnNumber < 9 && rowNumber > 0) {
                                    currentGameFieldsData["column" + (+columnNumber + 1)][+rowNumber - 1].isMiss = true;
                                }
                                if (columnNumber > 0 && rowNumber < 9) {
                                    currentGameFieldsData["column" + (+columnNumber - 1)][+rowNumber + 1].isMiss = true;
                                }
                            });
                        }
                        return currentGameFieldsData;
                    };

                    return {
                        shipsData: updateShipsOnHit(),
                        fieldsData: updateFieldOnHit(),
                        isPlayerMove: this.state.game.isPlayerMove,
                        isReplayMove: this.state.computerData.isReplayMove
                    };
                };

                const processdOnMiss = () => {
                    currentGameFieldsData["column" + columnNumber][rowNumber].isMiss = true;
                    return {
                        fieldsData: currentGameFieldsData,
                        shipsData: newOpponentData.shipsData,
                        isPlayerMove: !this.state.game.isPlayerMove,
                        isReplayMove: !this.state.computerData.isReplayMove
                    };
                };

                const newData = checkFieldOnShip() ? processOnHit() : processdOnMiss();

                newOpponentData.shipsData = newData.shipsData;
                newOpponentData.currentGameFieldsData = newData.fieldsData;
                newOpponentData.isReplayMove = newData.isReplayMove;
                gameStatus.isPlayerMove = newData.isPlayerMove;

                this.gameOver(this.state.playerData.shipsData, newOpponentData.shipsData);
                if (this.props.isMultiplayer) {
                    const postLastData = (opponentData) => {
                        if (this.props.isMultiplayer) {
                            const state = {
                            };
                            state.gameName = this.props.gameName;
                            if (this.props.isServer) {
                                state.nickname = 'serverPlayer';
                                state.squireID = target.id;
                            }
                            if (this.props.isClient) {
                                state.nickname = 'clientPlayer';
                                state.squireID = target.id;
                            }

                            state.isPlayerMove = gameStatus.isPlayerMove;

                            this.props.socket.emit('sendLastShot', state);
                        }
                    };
                    postLastData(newOpponentData);

                    this.setState({
                        opponentData: newOpponentData,
                        game: gameStatus
                    });
                } else {
                    this.setState({
                        computerData: newOpponentData,
                        game: gameStatus
                    });
                }
            }
        }
    };

    shotOpponent(shots) {
        if (this.state.gameMode.isGame) {
            const squireID = shots.splice(0, 1)[0];
            const gameStatus = this.state.game;
            const playerData = this.state.playerData;
            const opponentData = this.state.opponentData;
            const battlefield = playerData.currentGameFieldsData;

            opponentData.lastShot = squireID;

            const column = squireID.slice(0, 1);
            const row = squireID.slice(1);

            const onHit = () => {
                const shipType = battlefield["column" + column][row].shipID.slice(0, 1);
                const shipNumber = battlefield["column" + column][row].shipID.slice(-1);
                const shipOnFire = playerData.shipsData["deck" + shipType][shipNumber];

                const updateShipsData = () => {
                    if (shipOnFire.hits.length) {
                        shipOnFire.hits.splice(0, 1);
                    }
                    shipOnFire.isDestroyed = shipOnFire.hits.length === 0 ? true : false;
                    playerData.shipsData["deck" + shipType][shipNumber] = shipOnFire;
                };

                const updateFieldsData = () => {
                    if (shipOnFire.isDestroyed) {
                        shipOnFire.coords.forEach((coord) => {
                            let columnNumber = coord.slice(0, 1);
                            let rowNumber = coord.slice(-1);
                            battlefield["column" + columnNumber][rowNumber].isDestroyed = true;
                            if (+columnNumber > 0) {
                                if (!battlefield["column" + (+columnNumber - 1)][rowNumber].isShip) {
                                    battlefield["column" + (+columnNumber - 1)][rowNumber].isBlocked = true;
                                    battlefield["column" + (+columnNumber - 1)][rowNumber].isMiss = true;
                                }
                            }
                            if (+columnNumber < 9) {
                                if (!battlefield["column" + (+columnNumber + 1)][rowNumber].isShip) {
                                    battlefield["column" + (+columnNumber + 1)][rowNumber].isBlocked = true;
                                    battlefield["column" + (+columnNumber + 1)][rowNumber].isMiss = true;
                                }
                            }
                            if (+rowNumber > 0) {
                                if (!battlefield["column" + columnNumber][+rowNumber - 1].isShip) {
                                    battlefield["column" + columnNumber][+rowNumber - 1].isBlocked = true;
                                    battlefield["column" + columnNumber][+rowNumber - 1].isMiss = true;
                                }
                            }
                            if (+rowNumber < 9) {
                                if (!battlefield["column" + columnNumber][+rowNumber + 1].isShip) {
                                    battlefield["column" + columnNumber][+rowNumber + 1].isBlocked = true;
                                    battlefield["column" + columnNumber][+rowNumber + 1].isMiss = true;
                                }
                            }
                            if (+columnNumber < 9 && +rowNumber < 9) {
                                battlefield["column" + (+columnNumber + 1)][+rowNumber + 1].isBlocked = true;
                                battlefield["column" + (+columnNumber + 1)][+rowNumber + 1].isMiss = true;
                            }
                            if (+columnNumber > 0 && +rowNumber > 0) {
                                battlefield["column" + (+columnNumber - 1)][+rowNumber - 1].isBlocked = true;
                                battlefield["column" + (+columnNumber - 1)][+rowNumber - 1].isMiss = true;
                            }
                            if (+columnNumber < 9 && +rowNumber > 0) {
                                battlefield["column" + (+columnNumber + 1)][+rowNumber - 1].isBlocked = true;
                                battlefield["column" + (+columnNumber + 1)][+rowNumber - 1].isMiss = true;
                            }
                            if (+columnNumber > 0 && +rowNumber < 9) {
                                battlefield["column" + (+columnNumber - 1)][+rowNumber + 1].isBlocked = true;
                                battlefield["column" + (+columnNumber - 1)][+rowNumber + 1].isMiss = true;
                            }
                        });
                    } else {
                        battlefield["column" + column][row].isHit = true;
                    }
                };
                updateShipsData();
                updateFieldsData();
                this.gameOver(playerData.shipsData, this.state.opponentData.shipsData);
            };

            const onMiss = () => {
                battlefield["column" + column][row].isMiss = true;
                gameStatus.isPlayerMove = true;
            };

            battlefield["column" + column][row].isShip ? onHit() : onMiss();

            this.setState({
                playerData: playerData,
                opponentData: opponentData,
                game: gameStatus
            });
        }
    };

    componentWillUpdate() {
        if (!this.props.isMultiplayer && this.state.gameMode.isGame && !this.state.game.isPlayerMove) {
            setTimeout(() => {
                this.computerMove();
            }, 700);
        }
    };

    componentDidUpdate() {
        if (this.props.isMultiplayer && this.state.playerData.isPlayerReady && this.state.gameMode.isArrangement) {
            const makeRequest = () => {
                this.props.socket.emit('getGame', this.props.gameName);
                this.props.socket.on('sendGame', (data) => {
                    if (data && data.serverPlayer.isPlayerReady && data.clientPlayer.isPlayerReady) {
                        clearInterval(this.refreshConnect);
                        const gameState = data;
                        const gameMode = this.state.gameMode;
                        gameMode.isArrangement = false;
                        gameMode.isGame = true;
                        let newOpponentData;
                        const playerData = this.state.playerData;
                        const game = this.state.game;
                        if (this.props.isServer) {
                            if (gameState.serverPlayer.isPlayerMove) {
                                playerData.currentGameFieldsData = gameState.serverPlayer.currentGameFieldsData;
                                playerData.shipsData = gameState.serverPlayer.shipsData;
                                console.log(gameState, 'на сервере');
                            }
                            game.isPlayerMove = gameState.isServerPlayerMove;
                            newOpponentData = gameState.clientPlayer;
                        }
                        if (this.props.isClient) {
                            if (gameState.clientPlayer.isPlayerMove) {

                                playerData.currentGameFieldsData = gameState.clientPlayer.currentGameFieldsData;
                                playerData.shipsData = gameState.clientPlayer.shipsData;
                                console.log(gameState, 'на клиенте');
                            }
                            game.isPlayerMove = !gameState.isServerPlayerMove;
                            newOpponentData = gameState.serverPlayer;
                        }
                        this.setState({
                            gameMode: gameMode,
                            opponentData: newOpponentData,
                            playerData: playerData,
                            game: game
                        });
                    }
                })
            };
            if (this.props.isMultiplayer && this.state.playerData.isPlayerReady && this.state.gameMode.isArrangement) {
                this.refreshConnect = setInterval(makeRequest, 2000);
            }
        }
        if (this.state.shotsData) {
            if (this.state.shotsData.length) {
                const shots = this.state.shotsData;
                this.shotOpponent(shots);
            }
        }
        if (this.props.isMultiplayer && this.state.gameMode.isGame && this.state.game.isPlayerMove) {
            debugger;
            this.gameOver(this.state.playerData.shipsData, this.state.opponentData.shipsData);
        }
    }

    componentDidMount() {
        if (!this.props.isMultiplayer && this.state.gameMode.isArrangement) {
            const placeComputerShips = (fieldData, shipsData) => {
                Object.keys(shipsData).forEach((shipType) => shipsData[shipType].forEach((ship) => {
                    ship.coords.map((coord) => {
                        fieldData["column" + coord.slice(0, 1)][coord.slice(1)].isShip = true;
                        fieldData["column" + coord.slice(0, 1)][coord.slice(1)].isBlocked = true;
                        fieldData["column" + coord.slice(0, 1)][coord.slice(1)].shipID = ship.id;
                        return coord;
                    });
                }))
                return fieldData;
            }
            const placedComputerShipsOnField = placeComputerShips(this.state.computerData.currentGameFieldsData, this.state.computerData.shipsData);
            const newcomputerData = this.state.computerData;
            newcomputerData.currentGameFieldsData = placedComputerShipsOnField;
            this.setState({computerData: newcomputerData});

        }

        if (this.props.isMultiplayer) {
            const sendStartStateOnServer = () => {
                const state = {
                    currentGameFieldsData: this.state.playerData.currentGameFieldsData,
                    shipsData: this.state.playerData.shipsData,
                    isPlayerMove: this.state.game.isPlayerMove
                }
                this.props.socket.emit('setStartStateOnCloud', this.props.gameName, state);
            }
            sendStartStateOnServer();
            this.props.socket.emit('getShotData', this.props.gameName);
            const playerName = this.props.isServer ? 'serverPlayer' : 'clientPlayer';
            let shotsData;
            this.props.socket.on('sendShot', (gameShotData) => {
                shotsData = gameShotData;
                this.setState({
                    playerName: playerName,
                    shotsData: shotsData
                });
            });
        }

    };

    render() {
        const messageMoveElement = this.state.game.isPlayerMove ? <p>Ваш ход</p> : <p>Ход противника</p>
        const titleElement = this.state.game.isPlayerBoard ? <h2>Ваше поле</h2> : <h2>Поле противника</h2>;
        const shipsOnFilter = this.state.game.isPlayerBoard ? this.state.computerData.shipsData : this.state.playerData.shipsData ;
        const shipsTypes = Object.keys(shipsOnFilter);
        const ships = [];
        shipsTypes.forEach((type) => {
            ships.push(shipsOnFilter[type].filter((ship) => !ship.isDestroyed));
        });
        const playBtnElement = <button className="btn seabattle__place-ship-btn" onClick={this.handleBtnPlayClick}>
            {!this.state.playerData.isPlayerReady ? 'Играть' : 'Ждем противника'}</button>
        const messageArrangementElement = [];
        messageArrangementElement.push(
            <p key="setPlace" className="seabattle__place-ship-text" >Укажите куда установить корабль</p>,
            <button key="rotateShip" className="seabattle__rotate-ship-btn btn" onClick={this.handleRotate}>Повернуть корабль</button>
        );
        const arrangementBtnElement = <button className="btn" onClick={this.handleBtnClick}>Разместить корабли</button>
        return (
            <div className="container">
                {
                    !this.state.gameMode.isArrangement && !this.state.gameMode.isGame && !this.state.arrangementModeSettings.isAllShipPlaced
                        ? <div className="header">
                            <h1 className={this.state.gameMode.isGame || this.state.gameMode.isArrangement ? "visually--hidden" : ""}>Морской бой</h1>
                            {arrangementBtnElement}
                        </div>
                        : null
                }

                {
                    this.props.isMultiplayer
                        ? <div className={'main'}>
                            <UserField
                                playerType={'player'}
                                playerData={this.state.playerData}
                                gameMode={this.state.gameMode}
                                arrangementModeSettings={this.state.arrangementModeSettings}
                                lastShot={this.state.opponentData.lastShot}

                                handleMouseOver={this.handleMouseOver}
                                handleMouseOut={this.handleMouseOut}
                                handleRotate={this.handleRotate}
                                handleBtnPress={this.handleBtnPress}
                                handleBattlefieldClick={this.handleBattlefieldClick}
                                handleBattlefieldToggle={this.handleBattlefieldToggle}
                            />

                            {this.state.opponentData
                                ? <CompField
                                    playerType={'opponent'}
                                    computerData={this.state.opponentData}
                                    gameMode={this.state.gameMode}
                                    arrangementModeSettings={this.state.arrangementModeSettings}
                                    isPlayerMove={this.state.game.isPlayerMove}
                                    handlePlayerMove={this.handlePlayerMove}
                                    handleBattlefieldToggle={this.handleBattlefieldToggle}
                                />
                                : null
                            }

                        </div>
                        : this.state.gameMode.isStart
                            ? null
                            : <div className={'main'}>
                                <UserField
                                    playerType={'player'}
                                    playerData={this.state.playerData}
                                    gameMode={this.state.gameMode}
                                    arrangementModeSettings={this.state.arrangementModeSettings}
                                    lastShot={this.state.computerData.lastShot}
                                    whosMove={messageMoveElement}

                                    handleMouseOver={this.handleMouseOver}
                                    handleMouseOut={this.handleMouseOut}
                                    handleRotate={this.handleRotate}
                                    handleBtnPress={this.handleBtnPress}
                                    handleBattlefieldClick={this.handleBattlefieldClick}
                                    handleBattlefieldToggle={this.handleBattlefieldToggle}
                                />

                                <CompField
                                    playerType={'opponent'}
                                    computerData={this.state.computerData}
                                    gameMode={this.state.gameMode}
                                    arrangementModeSettings={this.state.arrangementModeSettings}
                                    isPlayerMove={this.state.game.isPlayerMove}
                                    handlePlayerMove={this.handlePlayerMove}
                                    handleBattlefieldToggle={this.handleBattlefieldToggle}
                                />
                            </div>
                }
                {
                    this.state.gameMode.isGame || this.state.gameMode.isOver ||  this.state.gameMode.isArrangement
                        ? <div className={"game-info"}>
                            {
                                !this.state.gameMode.isStart && !this.state.gameMode.isArrangement ? titleElement : null
                            }
                            {
                                this.state.gameMode.isGame ? messageMoveElement : ""
                            }
                            {
                                this.state.gameMode.isArrangement && !this.state.arrangementModeSettings.isAllShipPlaced ? messageArrangementElement.map((elemnt, i) => elemnt) : null
                            }
                            {
                                this.state.arrangementModeSettings.isAllShipPlaced && this.state.gameMode.isArrangement ? playBtnElement : null
                            }
                            {
                                !this.state.gameMode.isGame
                                    ? null
                                    : <ul className="ships-list">
                                        {ships.reverse().map((typeShips, i) => {
                                            return <li key={i}>{i + 1} палубных - <span>x{typeShips.length}</span></li>
                                        })}
                                    </ul>
                            }
                            {
                                !this.state.gameMode.isStart && !this.state.gameMode.isArrangement
                                    ? <button className={"btn swipe"} onClick={this.handleBattlefieldToggle}>Переключить поле</button>
                                    : null
                            }
                        </div>
                        : null
                }


                {
                    this.state.gameMode.isOver
                        ? <WinnerMessage
                            isPlayerWin={this.state.game.isPlayerWin}
                        /> :
                        null
                }
            </div>
        );
    };
}

export default Game;