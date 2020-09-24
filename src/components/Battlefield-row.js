import React from 'react';
import Square from './Square.js';

class BattlefieldRow extends React.Component {
    render(prop) {
      const columnData = this.props.columnData;
      return (
        <ul>
          {
            columnData.map((fieldData, i) => <Square 
              fieldData={fieldData} 
              key={i} 
              playerType={this.props.playerType}
              lastShot={this.props.lastShot}
              gameMode={this.props.gameMode} />)  
          }
        </ul>
      );
    }
}

export default BattlefieldRow;