import generateShipList from './ships.js';
import generateBasicGameFieldData from './field.js';
const fieldData = generateBasicGameFieldData();

const generateFieldValues = () => {
    const fieldValues = [];
    for (let column = 0; column < 10; column++) {
        for (let row = 0; row < 10; row++) {
            fieldValues.push(column.toString() + row.toString());
        }

    }
    return fieldValues;
};

const fieldValues = generateFieldValues();

const generateRandomShipList = (shipsData, fieldData) => {
    const generateRandomOrientation = (shipsData) => {
        Object.keys(shipsData)
            .forEach((shipType) => shipsData[shipType].map((ship) => {
                ship.isVertical = Math.random() >= 0.5;
                return ship;
            }))
    };

    const generateCoords = (shipsData) => {
        const checkCoordsOnBlock = (coords) => {
            const isFieldBlocked = coords.find((coordinate) => {
                const columnNumber = coordinate.slice(0, 1);
                const rowNumber = +coordinate.slice(1);
                const fieldOnCheck = fieldData["column" + columnNumber][rowNumber];
                return fieldOnCheck.isBlocked ? true : false;
            });
            return !!isFieldBlocked;
        };
        const generateRandomNumber = (min, max) => {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        const generateShipCoords = (ship, shipType) => {
            generateRandomOrientation(shipsData);
            const deckLength = +shipType.slice(-1);
            const startCoord = fieldValues[generateRandomNumber(0, fieldValues.length)];
            let columnNumber = +startCoord.slice(0, 1);
            let rowNumber = +startCoord.slice(1);

            ship.coords.push(startCoord);
            if (ship.isVertical) {
                for (let i = 1; i < deckLength; i++) {
                    if (deckLength <= 10 - rowNumber) {
                        ship.coords.push(columnNumber.toString() + (rowNumber + i).toString());
                    } else {
                        ship.coords.push(columnNumber.toString() + (rowNumber - i).toString());

                    }
                }
            } else {
                for (let i = 1; i < deckLength; i++) {
                    if (deckLength <= 10 - columnNumber) {
                        ship.coords.push((columnNumber + i).toString() + rowNumber);
                    } else {
                        ship.coords.push((columnNumber - i).toString() + rowNumber);

                    }
                }
            }
        }

        const removeBlockedField = (coords) => {
            coords.forEach((coord) => {
                let columnNumber = +coord.slice(0, 1);
                let rowNumber = +coord.slice(1);

                let values = [];
                values.push(coord);
                values.push((columnNumber - 1).toString() + rowNumber.toString());
                values.push((columnNumber + 1).toString() + rowNumber.toString());
                values.push(columnNumber.toString() + (rowNumber - 1).toString());
                values.push(columnNumber.toString() + (rowNumber - 1).toString());
                values.push((columnNumber + 1).toString() + (rowNumber + 1).toString());
                values.push((columnNumber - 1).toString() + (rowNumber - 1).toString());
                values.push((columnNumber - 1).toString() + (rowNumber - 1).toString());
                values.push((columnNumber + 1).toString() + (rowNumber - 1).toString());
                values.push((columnNumber - 1).toString() + (rowNumber + 1).toString());

                values.forEach((value) => {
                    const valueIndex = fieldValues.findIndex((fieldValue) => fieldValue === value);
                    if (valueIndex > -1) {
                        fieldValues.splice(valueIndex, 1);
                    }
                });
            });
        };

        Object.keys(shipsData).forEach((shipType) => shipsData[shipType].map((ship) => {
            let isBlocked = true;
            while (isBlocked) {
                ship.coords = [];
                generateShipCoords(ship, shipType);
                isBlocked = checkCoordsOnBlock(ship.coords);
                if (!isBlocked) {
                    removeBlockedField(ship.coords);
                    ship.coords.forEach((coord) => {
                        const columnNumber = +coord.slice(0, 1);
                        const rowNumber = +coord.slice(1);

                        fieldData["column" + columnNumber][rowNumber].isShip = true;
                        fieldData["column" + columnNumber][rowNumber].isBlocked = true;
                        
                        if (columnNumber > 0) {
                            fieldData["column" + (columnNumber - 1)][rowNumber].isBlocked = true;
                        }
                        if (columnNumber < 9) {
                            fieldData["column" + (columnNumber + 1)][rowNumber].isBlocked = true;
                        }
                        if (rowNumber > 0) {
                            fieldData["column" + columnNumber][rowNumber - 1].isBlocked = true;
                        }
                        if (rowNumber < 9) {
                            fieldData["column" + columnNumber][rowNumber + 1].isBlocked = true;
                        }

                        if (columnNumber < 9 && rowNumber < 9) {
                            fieldData["column" + (columnNumber + 1)][rowNumber + 1].isBlocked = true;
                        }
                        if (columnNumber > 0 && rowNumber > 0) {
                            fieldData["column" + (columnNumber - 1)][rowNumber - 1].isBlocked = true;
                        }
                        if (columnNumber < 9 && rowNumber > 0) {
                            fieldData["column" + (columnNumber + 1)][rowNumber - 1].isBlocked = true;
                        }
                        if (columnNumber > 0 && rowNumber < 9) {
                            fieldData["column" + (columnNumber - 1)][rowNumber + 1].isBlocked = true;
                        }
                    });
                }
            };            
            return ship;
        }));
    };
    generateCoords(shipsData);
    return shipsData;
};
const compShipList = generateRandomShipList(generateShipList(), fieldData);

export default compShipList;