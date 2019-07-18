import React, {useState, useEffect, useContext} from 'react'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Components
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import {LaptopsListPage} from './LaptopsListPage'
import {ServersListPage} from './ServersListPage'
import {MonitorsListPage} from './MonitorsListPage'
import {PeripheralListPage} from './PeripheralsListPage'
import {Button} from '../../reusables/Button/Button'
import {History} from 'history'

// Styles
import styles from './HardwareListPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

// Types

interface IHardwareListPageProps {
    history: History
}

// Primary Component
export const HardwareListPage: React.SFC<IHardwareListPageProps> = props => {
    const {history} = props

    // state
    const currentList = localStorage.getItem('selectedHW')
    const [selectedHW, setSelectedHW] = useState<{id: number; name: string}>(
        currentList
            ? JSON.parse(currentList)
            : {
                  id: 0,
                  name: 'servers',
              }
    )

    const dropdownContent = [
        {id: 0, name: 'servers'},
        {id: 1, name: 'laptops'},
        {id: 2, name: 'monitors'},
        {id: 3, name: 'peripherals'},
    ]

    const displayList = () => {
        switch (selectedHW.name) {
            case 'servers':
                return <ServersListPage history={history} />
            case 'laptops':
                return <LaptopsListPage history={history} />

            case 'monitors':
                return <MonitorsListPage history={history} />
            case 'peripherals':
                return <PeripheralListPage history={history} />
        }
    }
    return (
        <div className={styles.hardwareListMain}>
            <div className={styles.dropdown}>
                <Button className={styles.dropdownButton}>
                    <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                        <DropdownList
                            triggerElement={({isOpen, toggle}) => (
                                <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                    <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitleContainer)}>
                                        <div className={styles.dropdownTitle}>{selectedHW.name}</div>
                                        <div className={s(dropdownStyles.dropdownArrow, styles.dropdownArrow)} />
                                    </div>
                                </button>
                            )}
                            choicesList={() => (
                                <ul className={dropdownStyles.dropdownList}>
                                    {dropdownContent.map(i => (
                                        <li
                                            className={dropdownStyles.dropdownListItem}
                                            key={i.name}
                                            onClick={() => {
                                                setSelectedHW(i)
                                                localStorage.setItem('selectedHW', JSON.stringify(i))
                                            }}
                                        >
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
            </div>
            {displayList()}
        </div>
    )
}
