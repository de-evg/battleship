import React from 'react';
import Battlefield from './Battlefield.js';

const COLUMN_LETTERS = ["", "А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];
const ROW_NUMBERS = Array(10).fill(null);


class CompField extends React.Component {
  render() {
    const shipsTypes = Object.keys(this.props.computerData.shipsData);
    const ships = [];
    shipsTypes.forEach((type) => {
        ships.push(this.props.computerData.shipsData[type].filter((ship) => !ship.isDestroyed));
    });
    return (
      <div className="seabattle">
        <h2>Поле противника</h2>
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
            fieldsData={this.props.computerData.currentGameFieldsData}
            shipsData={this.props.computerData.shipsData}
            shipOnPlaceData={this.props.arrangementModeSettings.currentShipOnPlace}
            gameMode={this.props.gameMode}
            isPlayerMove={this.props.isPlayerMove}

            handlePlayerMove={this.props.handlePlayerMove}
            handleMoveClick={this.props.handleMoveClick}
          />
        </div>
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
    );
  }
}

export default CompField;