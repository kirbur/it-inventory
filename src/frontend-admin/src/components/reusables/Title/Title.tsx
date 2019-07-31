import React, {useContext} from 'react'
import styles from './Title.module.css'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {ThemeContext} from '../../App/App'

interface ITitleProps {
    title: any //any so that dropdown can be used
    className?: string
    onClick?: any
}

export const Title: React.FC<ITitleProps> = props => {
    const {title, className, onClick = () => {}} = props
    const {
        isDarkMode
    } = useContext(ThemeContext)

    return (
        <div className={styles.titleContainer}>
            <div className={s(styles.bottomCorner, isDarkMode ? styles.bottomCornerDark : {})} />
            <div className={s(styles.title, className)} onClick={onClick}>
                {title}
            </div>
            <div className={s(styles.topCorner, isDarkMode ? styles.topCornerDark : {})} />
        </div>
    )
}
