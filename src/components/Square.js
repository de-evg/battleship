import React from 'react';

class Square extends React.Component {
  render () {
    const fieldClasses = ["square battlefield__square "];
    const shipClass = this.props.fieldData.isShip && (this.props.playerType === 'player' || this.props.gameMode.isOver) ? "ship " : "";
    const hitClass = this.props.fieldData.isHit ? "hit " : "";
    const destroyedClass = this.props.fieldData.isDestroyed ? "destroyed " : "";
    const missClass = !this.props.fieldData.isShip && this.props.fieldData.isMiss ? "miss " : "";    
    const lastShot = this.props.fieldData.id === this.props.lastShot ? "lastshot" : "";

    fieldClasses.push(shipClass, hitClass, destroyedClass, missClass, lastShot);    
    return (
      <>
        <li key={this.props.fieldData.id} 
          className={fieldClasses.join("")} 
          id={this.props.fieldData.id} 
          title={this.props.fieldData.id} >         
        </li> 
      </>
    );
 };
}

 export default Square;