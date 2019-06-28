import React from 'react'

// icons
import {FaArchive, FaEdit} from 'react-icons/fa'
import {GoPlus} from 'react-icons/go'
import {IoIosPersonAdd} from 'react-icons/io'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './Button.module.css'

// Types
type ButtonIcon = 'add' | 'archive' | 'edit' | 'back' | 'submit'
interface IButtonProps {
    onClick?: any
    className?: string
    text?: string
    textClassName?: string
    icon?: ButtonIcon
    children?: any
    textInside?: boolean
}

// Helpers

// Primary Component
export const Button: React.SFC<IButtonProps> = props => {
    const {onClick = () => {}, className = '', text = '', textClassName = '', children, icon, textInside = true} = props

    return icon === 'back' ? (
        <div onClick={onClick} className={s(styles.backButton, className)}>
            <div className={styles.backArrow} />
            <div className={s(styles.backButtonText, textClassName)}>{text}</div>
            {children}
        </div>
    ) : textInside ? (
        <div onClick={onClick} className={s(styles.buttonMain, className)}>
            <div className={s(styles.buttonText, textClassName)}>{text}</div>
            {/* {icon === 'add' && <div className={styles.addIcon} />} */}
            {icon === 'add' && <GoPlus className={styles.icon} size={20} />}
            {icon === 'archive' && <FaArchive className={styles.icon} size={20} />}
            {icon === 'edit' && <FaEdit className={styles.icon} size={20} />}
            {icon === 'submit' && <IoIosPersonAdd className={styles.icon} size={20} />}

            {children}
        </div>
    ) : (
        <div onClick={onClick} className={s(styles.iconButtonContainer, className)}>
            <div className={styles.iconbuttonMain}>
                {/* {icon === 'add' && <div className={styles.addIcon} />} */}
                {icon === 'add' && <GoPlus className={styles.icon} size={20} />}
                {icon === 'archive' && <FaArchive className={styles.icon} size={20} />}
                {icon === 'edit' && <FaEdit className={styles.icon} size={20} />}
            </div>
            <div className={s(styles.buttonText, textClassName)}>{text}</div>
            {children}
        </div>
    )
}
