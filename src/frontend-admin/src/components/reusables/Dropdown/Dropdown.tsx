import React, { useContext } from 'react'
import styles from './Dropdown.module.css'
import {DropdownList} from './DropdownList'
import {Title} from '../../reusables/Title/Title'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import { ThemeContext } from '../../App';

export interface IDropdownItem {
    id: number
    name: string
    component?: any
    onClick?: Function
}

interface IDropdownProps {
    content: IDropdownItem[]
    selected: IDropdownItem
    setSelected: any
    titleClassName?: string
}

export const Dropdown: React.FC<IDropdownProps> = props => {
    const {content, titleClassName, selected, setSelected} = props
    const { isDarkMode } = useContext(ThemeContext)
    //const [selected, setSelected] = useState(content[0])
    if (content[0] === undefined) {
        content.push({
            id: -1,
            name: '',
        })
    }
    return (
        <div className={styles.dropdownMain}>
            <Title
                title={
                    <div className={styles.dropdownContainer}>
                        {content && selected && selected.name && (
                            <DropdownList
                                triggerElement={({isOpen, toggle}) => (
                                    <button onClick={toggle} className={styles.dropdownButton}>
                                        <div className={styles.dropdownTitle}>
                                            <div className={titleClassName}>{selected.name}</div>
                                            <div className={s(styles.dropdownArrow, isDarkMode ? styles.dropdownArrowDark : {})} />
                                        </div>
                                    </button>
                                )}
                                choicesList={() => (
                                    <ul className={styles.dropdownList}>
                                        {content.map(i => (
                                            <li
                                                className={styles.dropdownListItem}
                                                key={i.name}
                                                onClick={() => {
                                                    setSelected(i)
                                                    selected.onClick && selected.onClick()
                                                }}
                                            >
                                                <button className={styles.dropdownListItemButton}>
                                                    <div className={styles.dropdownItemLabel}>{i.name}</div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            />
                        )}
                        <div />
                    </div>
                }
            />
            <div>
                {selected
                    ? selected.component
                        ? selected.component
                        : selected.onClick && selected.onClick(selected.id)
                    : null}
            </div>
        </div>
    )
}
