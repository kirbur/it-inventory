import React from 'react'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './Checkbox.module.css'

// Types
interface ICheckboxProps {
    checked: boolean
    title?: string
    className?: string
    onClick: () => void
}

// Primary Component
export const Checkbox: React.SFC<ICheckboxProps> = props => {
    const {checked, title = '', onClick, className = ''} = props

    return (
        <div className={s(styles.checkboxContainer, className)}>
            <div className={styles.checkboxTitle}>{title}</div>
            <div className={styles.checkbox} onClick={onClick}>
                <div className={s(styles.check, checked ? styles.checked : '')}>
                    {checked && <div className={styles.checkmark} />}
                </div>
            </div>
        </div>
    )
}
