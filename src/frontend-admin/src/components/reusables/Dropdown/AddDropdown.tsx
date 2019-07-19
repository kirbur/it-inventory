import React from 'react'

// Packages

// Components
import {Button} from '../Button/Button'
import {DropdownList} from './DropdownList'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './AddDropdown.module.css'
import dropdownStyles from './Dropdown.module.css'

// Types
interface IAddDropdownProps {
    content: {name: string; id: string | number}[]
    //selected: {name: string; id: string}
    title: string
    onSelect: any
    className?: string
}

// Helpers

// Primary Component
export const AddDropdown: React.SFC<IAddDropdownProps> = props => {
    const {content, onSelect, title, className = ''} = props

    return (
        <Button className={s(styles.addDropdownMain, className)} icon='add' onClick={() => {}} textInside={false}>
            <div className={dropdownStyles.dropdownContainer}>
                <DropdownList
                    triggerElement={({toggle}) => (
                        <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                            <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>{title}</div>
                        </button>
                    )}
                    choicesList={() => (
                        <ul className={s(dropdownStyles.dropdownList, styles.dropdownList)}>
                            {content.map(i => (
                                <li className={dropdownStyles.dropdownListItem} key={i.id} onClick={() => onSelect(i)}>
                                    <button className={dropdownStyles.dropdownListItemButton}>
                                        <div className={dropdownStyles.dropdownItemLabel}>{i.name}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                />
                <div />
            </div>
        </Button>
    )
}
