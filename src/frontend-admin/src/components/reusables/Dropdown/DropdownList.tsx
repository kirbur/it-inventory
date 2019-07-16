import React, {useState} from 'react'
import styles from './DropdownList.module.css'
import {concatStyles as s} from '../../../utilities/mikesConcat'

//Props to pass to the Dropdown Prop renderTRigger
interface IRendererProps {
    isOpen: boolean
    close: () => void
    open: () => void
    toggle: () => void
}

interface IDropdownListProps {
    triggerElement: (props: IRendererProps) => React.ReactNode
    choicesList: (props: IRendererProps) => React.ReactNode

    listWidthClass?: string
}

export const DropdownList: React.FC<IDropdownListProps> = props => {
    const {triggerElement, choicesList, listWidthClass = ''} = props
    const [isOpen, setIsOpen] = useState(false)

    const rendererProps: IRendererProps = {
        isOpen: isOpen,
        close: () => setIsOpen(false),
        open: () => setIsOpen(true),
        toggle: () => setIsOpen(!isOpen),
    }

    return (
        <div className={styles.dropdownListContainer}>
            <div className={styles.trigger}>{triggerElement(rendererProps)}</div>
            {isOpen && ( //if dropdown isOpen then render the choices list
                <div className={s(styles.dropdownContent, listWidthClass)} onClick={() => setIsOpen(false)}>
                    <div className={styles.dropdownSquare} />
                    {choicesList(rendererProps)}
                </div>
            )}
        </div>
    )
}
