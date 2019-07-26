import React from 'react'
import {History} from 'history'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Components
import {Button} from '../Button/Button'

// styles
import styles from './BackButton.module.css'
import {path} from 'd3-path'

// Types
interface IBackButtonProps {
    history: History
    className?: string
    textClassName?: string
}

// Primary Component
export const BackButton: React.SFC<IBackButtonProps> = props => {
    const {history, className = '', textClassName = ''} = props

    var pathArray = history.location.state ? history.location.state.prev.pathname.split('/') : 'Back'
    var text =
        pathArray.length > 2
            ? pathArray[1][pathArray[1].length - 1] === 's'
                ? pathArray[1].substring(0, pathArray[1].length - 1)
                : pathArray[1]
            : pathArray[1] === 'dashboard'
            ? pathArray[1]
            : 'All ' + pathArray[1]

    return (
        <Button
            text={history.location.state ? text : pathArray}
            icon='back'
            onClick={() => {
                history.goBack()
            }}
            className={s(styles.button, className)}
            textClassName={textClassName}
        />
    )
}
