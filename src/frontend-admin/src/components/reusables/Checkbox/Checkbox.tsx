import React, {useContext} from 'react'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './Checkbox.module.css'
import { ThemeContext } from '../../App';

// Types
interface ICheckboxProps {
    checked: boolean
    title?: string
    className?: string
    boxClassName?: string
    onClick: () => void
}

// Primary Component
export const Checkbox: React.SFC<ICheckboxProps> = props => {
    const {checked, title = '', onClick, className = '', boxClassName = ''} = props
    const { isDarkMode } = useContext(ThemeContext)

    return (
        <div className={s(styles.checkboxContainer, className)}>
            <div className={styles.checkboxTitle}>{title}</div>
            <div className={styles.checkbox} onClick={onClick}>
                <div className={s(styles.check, checked ? s(styles.checked, isDarkMode ? styles.checkedDark : {}) : '', boxClassName)}>
                    {checked && <div className={s(styles.checkmark, isDarkMode ? styles.checkmarkDark : {})} />}
                </div>
            </div>
        </div>
    )
}
