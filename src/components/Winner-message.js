import React from 'react';

class WinnerMessage extends React.Component {    
    render() {
        return (
            <div className="message-container" >
                <p className="message">{this.props.isPlayerWin ? 'Поздравляю! Вы победили!' : 'Вы проиграли!'}</p>                
            </div>
        )
    }
}

export default WinnerMessage;