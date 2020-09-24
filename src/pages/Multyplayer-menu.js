import React from 'react';

class MultyPlayerMenu extends React.Component {
  render() {
    
    return (<div className={"game__container"}>
              <button className={"btn"} onClick={this.props.onHostModeClick}>Сервер</button>
              <button className={"btn"} onClick={this.props.onClientModeClick}>Клиент</button>
            </div>
    );
  }
}

export default MultyPlayerMenu;