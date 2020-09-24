import React from 'react';

class Waiting extends React.Component {
  render() {
    
    return (<div className={"game__container"}>
              <p className={"game-name__message"}>Ждем второго игрока...</p>
            </div>
    );
  }
}

export default Waiting;