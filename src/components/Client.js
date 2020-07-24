import React from 'react';

class Client extends React.Component {        
    render() {
        const games = Object.keys(this.props.games);
        return (
            <div>
                <form onSubmit={this.props.handleSubmit}>
                    <fieldset>
                        <legend>Выберете игру</legend>
                        {
                            games.map((gameName, i) => {
                                return (
                                    <label key={'label' + i}>{gameName}
                                            <input type="radio" name="gameName" value={gameName} />
                                    </label>
                                )
                            })
                        }
                        
                    </fieldset>
                    <button type="submit">Присоединиться к игре</button>
                </form>
            </div>
        )
    }
}

export default Client;