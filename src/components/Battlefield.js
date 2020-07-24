import React from 'react';
import BattlefieldRow from './BattlefieldRow.js';

class Battlefield extends React.Component {
  componentDidMount() {
    console.log(this.props.gameMode.isArrangement); 
    document.addEventListener('keydown', this.props.handleBtnPress);       
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.props.handleBtnPress)
  }

  render() {
    let battlefieldElement;
    battlefieldElement = <div className="game__battlefield battlefield" >    
  {
    Object.keys(this.props.fieldsData).map((columnName, i) => <BattlefieldRow 
      key={i} 
      columnData={this.props.fieldsData[columnName]} 
      playerType={this.props.playerType}
      gameMode={this.props.gameMode} />)
  }
  </div>
    if (this.props.gameMode.isArrangement) {
      battlefieldElement = this.props.playerType === 'player1' 
        ? <div className="game__battlefield battlefield"
            onWheel={this.props.handleWheelRotate}         
            onMouseOut={this.props.handleMouseOut}
            onMouseOver={this.props.handleMouseOver}
            onClick={this.props.handleBattlefieldClick} >
          {
            Object.keys(this.props.fieldsData).map((columnName, i) => <BattlefieldRow 
              key={i} 
              columnData={this.props.fieldsData[columnName]} 
              playerType={this.props.playerType}
              gameMode={this.props.gameMode} />)
          }
          </div>
        : <div className="game__battlefield battlefield"
            onMouseUp={this.props.handlePlayerMove} >
          {
            Object.keys(this.props.fieldsData).map((columnName, i) => <BattlefieldRow 
              key={i} 
              columnData={this.props.fieldsData[columnName]} 
              playerType={this.props.playerType}
              gameMode={this.props.gameMode} />)
          }
          </div>
    }
    if (this.props.gameMode.isGame) {
      battlefieldElement = this.props.playerType === 'player1' 
        ? <div className="game__battlefield battlefield" >
          {
            Object.keys(this.props.fieldsData).map((columnName, i) => <BattlefieldRow 
              key={i} 
              columnData={this.props.fieldsData[columnName]} 
              playerType={this.props.playerType}
              lastShot={this.props.lastShot}
              gameMode={this.props.gameMode} />)
          }     
          </div>
        : <div className="game__battlefield battlefield"
            onMouseUp={this.props.handlePlayerMove} >
          {
            Object.keys(this.props.fieldsData).map((columnName, i) => <BattlefieldRow 
              key={i}  
              columnData={this.props.fieldsData[columnName]} 
              playerType={this.props.playerType}
              gameMode={this.props.gameMode} />)
          }
          </div>
    }
    if (this.props.gameMode.isOver && this.props.playerType !== 'player1') {
      battlefieldElement = <div className="game__battlefield battlefield" >
      {
        Object.keys(this.props.fieldsData).map((columnName, i) => <BattlefieldRow 
          key={i} 
          columnData={this.props.fieldsData[columnName]} 
          playerType={this.props.playerType}
          lastShot={this.props.lastShot}
          gameMode={this.props.gameMode} />)
      }  
      </div>      
    }
    
    return battlefieldElement;
  }

}

export default Battlefield;