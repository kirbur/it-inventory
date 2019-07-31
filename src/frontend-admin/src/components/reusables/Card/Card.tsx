import React, {useContext} from 'react'
import styles from './Card.module.css'
import {Title} from '../Title/Title'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {ThemeContext} from '../../App/App'

interface ICardProps {
    title?: any
    children: any //any so that dropdown can be used
    className?: string
    titleClassName?: string
    titleOnClick?: any
}

export const Card: React.FC<ICardProps> = props => {
    const {title, children, className, titleClassName, titleOnClick} = props
    const {
        isDarkMode
    } = useContext(ThemeContext)

    return (
        <div className={s(styles.cardMain, isDarkMode ? styles.cardDark : {})}>
            {title && <Title title={title} className={s(titleClassName, isDarkMode ? styles.cardTitleDark : {})} onClick={titleOnClick} />}
            <div className={s(styles.cardChildren, className)}>{children}</div>
        </div>
    )
}
