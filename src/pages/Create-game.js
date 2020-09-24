import React from 'react';
import WaitnigComponent from '../components/Waiting.js'

class GameCreating extends React.Component {
  render() {

    return (this.props.isWaitSecondPlayer
      ? <WaitnigComponent />
      : <div className={"game__container"}>
          <form id="game-name-form" onSubmit={this.props.onSubmit} >
            <label className={"game-name__title"}><span>Введите название игры</span>
              <input
                className={"game-name__input"}
                type="text"
                placeholder="Ваше название игры"
                id="gameName" name="gameName"
                value={this.props.gameName}
                onChange={this.props.onInputChange}
                required />
            </label>
            <button className={"btn"} type="submit">Создать игру</button>
          </form>
        </div>
    );
  }
}

export default GameCreating;