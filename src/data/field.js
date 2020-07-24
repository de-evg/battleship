const generateBasicGameFieldData = () => {
    let basicGameFieldData = {};
    for (let columnNumber = 0; columnNumber < 10; columnNumber++) {
      basicGameFieldData["column" + columnNumber] = [];
      for (let rowNumber = 0; rowNumber < 10; rowNumber++) {
        basicGameFieldData["column" + columnNumber][rowNumber] = {
          id: columnNumber.toString() + rowNumber.toString(),               
          isShip: false,
          shipID: null,
          isMiss: false,
          isBlocked: false,
          isHit: false,
          isDestroyed: false
        };
      }            
    }          
    return basicGameFieldData;
}

export default generateBasicGameFieldData;