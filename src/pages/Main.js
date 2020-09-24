import React from 'react';

class Main extends React.Component {
  render() {
    
    return (<div className={"game__container"}>
              <button className={"btn"} onClick={this.props.onSinglePlayerModeClick}>Одиночная игра</button>
              <button className={"btn"} onClick={this.props.onMultyPlayerModeClick}>Сетевая игра</button>
            </div>
    );
  }
}

export default Main;