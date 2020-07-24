import React from 'react';
import Battlefield from './Battlefield.js';

const COLUMN_LETTERS = ["", "А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];
const ROW_NUMBERS = Array(10).fill(null);

class UserField extends React.Component {
  render() {
    return (
      <div className="seabattle">
      {this.props.playerType === 'player' ? <h2>Ваше поле</h2> : <h2>Поле противника</h2>}
      
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
      </div>
    );
  }
}

export default UserField;