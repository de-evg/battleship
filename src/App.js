import React from 'react';
import './App.css';
import UserField from './components/UserField.js';
import CompField from './components/CompField.js';
import generateShipList from './data/ships.js';
import generateBasicGameFieldData from './data/field.js';
import aimList from './data/moveComputerData.js';
import compShipList from './data/randomShips.js';
import utils from './data/utils.js';
import WinnerMessage from './components/WinnerMessage.js'

function App() {
    class Game extends React.Component {
        constructor() {
            super();
            this.state = {
                users: [],
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
                    }
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
                    isPlayerMove: true,
                    isPlayerWin: null
                }
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
                this.setState({ arrangementModeSettings: newArrangementModeSettings });

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
                    this.setState({ currentShipOnPlace: currentShipOnPlace });

                    const previewGameFieldsData = this.state.playerData.currentGameFieldsData;
                    currentShipOnPlace.coords.forEach((coord) => {
                        previewGameFieldsData["column" + coord.slice(0, 1)][coord.slice(1)].isShip = true;
                    });
                    const newplayerData = this.state.playerData;
                    newplayerData.currentGameFieldsData = previewGameFieldsData
                    this.setState({ playerData: newplayerData });
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
                    this.setState({ playerData: newplayerData });
                    currentShipOnPlace.coords = [];
                    const newArrangementModeSettings = this.state.arrangementModeSettings;
                    newArrangementModeSettings.currentShipOnPlace = currentShipOnPlace;
                    this.setState({ arrangementModeSettings: newArrangementModeSettings });
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

                this.setState({
                    playerData: newplayerData,
                    computerData: newcomputerData,
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
                this.setState({ arrangementModeSettings: newArrangementModeSettings });
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
                this.setState({ arrangementModeSettings: newArrangementModeSettings });
            }
        };

        handleBtnPlayClick = () => {
            const gameMode = this.state.gameMode;
            gameMode.isArrangement = false;
            gameMode.isGame = true;
            this.setState({ gameMode: gameMode });
        };

        isVictoryCheck(shipsData) {
            const shipsTypes = Object.keys(shipsData);
            let survivingShips = [];
            shipsTypes.forEach((type) => {
                const ships = shipsData[type].filter((ship) => !ship.isDestroyed);
                survivingShips = survivingShips.concat(ships);
            });
            return !survivingShips.length;
        };

        gameOver() {
            const gameStatus = this.state.gameMode;
            const game = this.state.game;
            const isPlayerWin = this.isVictoryCheck(this.state.computerData.shipsData);
            const isCompWin = this.isVictoryCheck(this.state.playerData.shipsData);
            gameStatus.isOver = isPlayerWin || isCompWin ? true : false;
            if (gameStatus.isOver) {
                gameStatus.isGame = false;
                game.isPlayerWin = isPlayerWin ? true : false;
            }
            this.setState({
                gameMode: gameStatus,
                game: game
            });
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
                this.gameOver();
            }
        };

        handlePlayerMove = (evt) => {
            if (evt.target.tagName === 'LI' && this.state.game.isPlayerMove && this.state.gameMode.isGame) {
                const newComputerData = this.state.computerData;
                const gameStatus = this.state.game;
                if (this.state.gameMode.isGame && this.state.game.isPlayerMove &&
                    (!newComputerData.currentGameFieldsData['column' + evt.target.id.slice(0, 1)][evt.target.id.slice(-1)].isHit &&
                        !newComputerData.currentGameFieldsData['column' + evt.target.id.slice(0, 1)][evt.target.id.slice(-1)].isMiss)) {
                    const target = evt.target;
                    const compShipList = this.state.computerData.shipsData;
                    const currentGameFieldsData = this.state.computerData.currentGameFieldsData
                    const columnNumber = target.id.slice(0, 1);
                    const rowNumber = target.id.slice(1);

                    const checkFieldOnShip = () => {
                        const isShip = currentGameFieldsData["column" + columnNumber][rowNumber].isShip;
                        return isShip;
                    }

                    const processOnHit = () => {
                        const shipType = currentGameFieldsData["column" + columnNumber][rowNumber].shipID.slice(0, 1);
                        const shipNumber = currentGameFieldsData["column" + columnNumber][rowNumber].shipID.slice(-1);
                        const shipOnFire = compShipList["deck" + shipType][shipNumber];

                        const updateShipsOnHit = () => {
                            if (shipOnFire.hits.length > 0) {
                                shipOnFire.hits.splice(0, 1);
                                shipOnFire.isDestroyed = shipOnFire.hits.length === 0 ? true : false;
                            } else {
                                shipOnFire.isDestroyed = true;
                            }
                            compShipList["deck" + shipType][shipNumber] = shipOnFire;
                            return compShipList;
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
                            shipsData: this.state.computerData.shipsData,
                            isPlayerMove: !this.state.game.isPlayerMove,
                            isReplayMove: !this.state.computerData.isReplayMove
                        };
                    };

                    const newData = checkFieldOnShip() ? processOnHit() : processdOnMiss();

                    newComputerData.shipsData = newData.shipsData;
                    newComputerData.currentGameFieldsData = newData.fieldsData;
                    newComputerData.isReplayMove = newData.isReplayMove;
                    gameStatus.isPlayerMove = newData.isPlayerMove;

                    const gameMode = this.state.gameMode;
                    if (this.isVictoryCheck(this.state.computerData.shipsData)) {
                        gameMode.isOver = true;
                        gameMode.isGame = false;
                        gameStatus.isPlayerWin = true;
                    }
                    this.setState({
                        computerData: newComputerData,
                        game: gameStatus,
                        gameMode: gameMode,
                    });
                }
                this.gameOver();
            }
        };

        componentWillUpdate() {
            if (this.state.gameMode.isGame && !this.state.game.isPlayerMove) {
                setTimeout(() => {
                    this.computerMove();
                }, 700);
            }
        };

        componentDidMount() {
            fetch('/users')
                .then(res => res.json())
                .then(users => this.setState({ users: users }));
                console.log(this.state);
        };

        render() {
            const messageMoveElement = this.state.game.isPlayerMove ? <p>Ваш ход</p> : <p>Ход компьютера</p>
            const playBtnElement = <button className="seabattle__place-ship-btn" onClick={this.handleBtnPlayClick}>Играть</button>
            const messageArrangementElement = [];
            messageArrangementElement.push(
                <p className="seabattle__place-ship-text" >Укажите куда установить корабль</p>,
                <button className="seabattle__rotate-ship-btn btn" onClick={this.handleRotate}>Повернуть корабль</button>
            );
            const arrangementBtnElement = <button className="seabattle__place-ship-btn btn" onClick={this.handleBtnClick}>Разместить корабли</button>



            return (
                <div className="container">
                    <h1>Морской бой</h1>
                    {
                        this.state.gameMode.isStart
                            ? null
                            : <div className={'main'}>
                                <UserField
                                    playerType={'player1'}
                                    playerData={this.state.playerData}
                                    gameMode={this.state.gameMode}
                                    arrangementModeSettings={this.state.arrangementModeSettings}
                                    lastShot={this.state.computerData.lastShot}

                                    handleMouseOver={this.handleMouseOver}
                                    handleMouseOut={this.handleMouseOut}
                                    handleRotate={this.handleRotate}
                                    handleBtnPress={this.handleBtnPress}
                                    handleBattlefieldClick={this.handleBattlefieldClick}
                                />

                                <CompField
                                    playerType={'comp'}
                                    computerData={this.state.computerData}
                                    gameMode={this.state.gameMode}
                                    arrangementModeSettings={this.state.arrangementModeSettings}
                                    ispPlayerMove={this.state.game.isPlayerMove}
                                    handlePlayerMove={this.handlePlayerMove}
                                />
                            </div>
                    }

                    {
                        this.state.gameMode.isGame ? messageMoveElement : ""
                    }
                    {
                        this.state.arrangementModeSettings.isAllShipPlaced && !this.state.gameMode.isGame ? playBtnElement : null
                    }
                    {
                        this.state.gameMode.isArrangement && !this.state.arrangementModeSettings.isAllShipPlaced ? messageArrangementElement.map((elemnt) => elemnt) : null
                    }
                    {
                        !this.state.gameMode.isArrangement && !this.state.gameMode.isGame &&
                            !this.state.arrangementModeSettings.isAllShipPlaced ? arrangementBtnElement : null
                    }
                    {
                        this.state.gameMode.isOver
                            ? <WinnerMessage
                                gameMode={this.state.gameMode}
                                isPlayerWin={this.state.game.isPlayerWin}
                            /> :
                            null
                    }
                </div>
            );
        };
    }
    return <Game />
};

export default App;