import React from 'react';

class GameConnecting extends React.Component {
    render() {
        const games = Object.keys(this.props.games);
        return (
            <div className={"board"}>
                <form className={"board-form"} onSubmit={this.props.handleSubmit}>
                    <fieldset className={"board-form__games"}>
                        <legend className={"board-form__title"}>Выберете игру</legend>
                        <div className={"board-form__games-container"}>
                        {
                            games.map((gameName, i) => {
                                return (
                                    <>
                                        <input id={"game" + i} className={"board-form__game-radio"}
                                            type="radio" name="gameName"
                                            value={gameName}
                                            required
                                            key={"input" + i} />
                                        <label htmlFor={"game" + i} className={"board-form__game-title"} key={"label" + i}>{gameName}</label>

                                    </>
                                )
                            })
                        }
                        </div>

                    </fieldset>
                    {
                        games.length ? <button className={"btn"} type="submit">Присоединиться к игре</button> : null
                    }
                    <button className={"btn"} onClick={this.props.handleRefreshGames}>Обновить</button>

                </form>

            </div>
        )
    }
}

export default GameConnecting;