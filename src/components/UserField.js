import React from 'react';
import Battlefield from './Battlefield.js';

const COLUMN_LETTERS = ["", "А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];
const ROW_NUMBERS = Array(10).fill(null);

class UserField extends React.Component {
  render() {
    const shipsTypes = Object.keys(this.props.playerData.shipsData);
    const ships = [];
    shipsTypes.forEach((type) => {
      ships.push(this.props.playerData.shipsData[type].filter((ship) => !ship.isDestroyed));
    });
    const titleElement = this.props.playerType === "player" ? <h2>Ваше поле</h2> : <h2>Поле противника</h2>;
    return (
      <div className="game-board current-board">
        <div className="game" >
          <ul className="game__column-name">
            {
              COLUMN_LETTERS.map((letter, i) => <li key={i} className={"square"}>{letter}</li>)
            }
          </ul>
          <ul className="game__row-name">
            {
              ROW_NUMBERS.map((item, i) => <li key={i} className={"square"}>{i + 1}</li>)
            }
          </ul>
          <Battlefield
            playerType={this.props.playerType}
            fieldsData={this.props.playerData.currentGameFieldsData}
            shipsData={this.props.playerData.shipsData}
            shipOnPlaceData={this.props.arrangementModeSettings.currentShipOnPlace}
            gameMode={this.props.gameMode}
            lastShot={this.props.lastShot}

            handleBtnPress={this.props.handleBtnPress}
            handleMouseOver={this.props.handleMouseOver}
            handleMouseOut={this.props.handleMouseOut}
            handleWheelRotate={this.props.handleRotate}
            handleBattlefieldClick={this.props.handleBattlefieldClick}
          />
          </div>
          <div className={"game-info"}>
            {
              titleElement
            }            
            {
              !this.props.gameMode.isGame
                ? null
                : <ul className="ships-list">
                  {ships.reverse().map((typeShips, i) => {
                    return <li key={i}>{i + 1} палубных - <span>x{typeShips.length}</span></li>
                  })}
                </ul>
            }                   
        </div>
      </div>
    );
  }
}

export default UserField;