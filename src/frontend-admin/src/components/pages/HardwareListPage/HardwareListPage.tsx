import React, {useState, useEffect, useContext} from 'react'
import {Switch, Route} from 'react-router-dom'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './HardwareListPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

// Types
interface IHardwareListPageProps {
    history: any
    match: any
}

interface ITableDatum {
    id?: number
    name?: string
    FQDN?: string
    number_Of_Cores?: number
    RAM?: number
    renewal_Date?: string
    MFG_Tag?: string
    CPU?: string
    SSD?: string
    assigned?: string
    make?: string
    screen_Size?: string
    resolution?: number
    inputs?: string
    purchase_Date?: string
}

interface IServerDatum {
    id: number
    FQDN: string
    number_Of_Cores: number
    RAM: number
    renewal_Date: string
    MFG_Tag: string
}

interface ILaptopDatum {
    id: number
    CPU: string
    RAM: number
    SSD: string
    assigned: string
    MFG_Tag: string
}

interface IMonitorDatum {
    id: number
    make: string
    screen_Size: string
    resolution: number
    inputs: string
    assigned: string
}

interface IPeripheralDatum {
    id: number
    name: string
    purchase_Date: string
    assigned: string
}

//TODO: replace any w/ real type
const initListData: ITableDatum[] = [{name: '', id: 0}]
const initServerList: IServerDatum[] = []
const initLaptopList: ILaptopDatum[] = []
const initMonitorList: IMonitorDatum[] = []
const initPeripheralList: IPeripheralDatum[] = []
const initColumns: string[] = []
const initOptions: {value: string; label: string}[] = []
let initDropdownContent: {
    name: string
    selectedList: ITableDatum[] | IServerDatum[] | IMonitorDatum[] | ILaptopDatum[] | IPeripheralDatum[]
}[] = [
    {
        name: 'Select',
        selectedList: initListData,
    },
]

// Primary Component
export const HardwareListPage: React.SFC<IHardwareListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [serverList, setServerList] = useState(initServerList)
    const [laptopList, setLaptopList] = useState(initLaptopList)
    const [monitorList, setMonitorList] = useState(initMonitorList)
    const [peripheralList, setPeripherlList] = useState(initPeripheralList)
    const [listData, setListData] = useState(initListData)
    const [columns, setColumns] = useState(initColumns)
    const [options, setOptions] = useState(initOptions)
    const [filtered, setFiltered] = useState(listData) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})
    const [selectedHW, setSelectedHW] = useState(initDropdownContent[0])
    const [dropdownContent, setDropdownContent] = useState(initDropdownContent)

    //fetch data
    useEffect(() => {
        initServerList.length = 0
        axios
            .get('/list/servers')
            .then((data: any) =>
                data.map((i: any) =>
                    initServerList.push({
                        id: i.serverId,
                        FQDN: i.fqdn,
                        number_Of_Cores: i.numberOfCores,
                        RAM: i.ram,
                        renewal_Date: i.renewalDate,
                        MFG_Tag: i.mfg,
                    })
                )
            )
            .catch((err: any) => console.log(err))
        setServerList(initServerList)

        initLaptopList.length = 0
        axios
            .get('/list/laptops')
            .then((data: any) =>
                data.map((i: any) =>
                    initLaptopList.push({
                        id: i.computerId,
                        CPU: i.cpu,
                        RAM: i.ramgb,
                        SSD: i.ssdgb,
                        assigned: i.isAssigned ? i.employeeFirstName + i.employeeLastName : '',
                        MFG_Tag: i.mfg,
                    })
                )
            )
            .catch((err: any) => console.log(err))
        setLaptopList(initLaptopList)

        initMonitorList.length = 0
        axios
            .get('/list/monitors')
            .then((data: any) =>
                data.map((i: any) =>
                    initMonitorList.push({
                        id: i.monitorId,
                        make: i.make,
                        screen_Size: i.screenSize,
                        resolution: i.resolution,
                        inputs: i.inputs,
                        assigned: i.isAssigned ? i.employeeFirstName + i.employeeLastName : '',
                    })
                )
            )
            .catch((err: any) => console.log(err))
        setMonitorList(initMonitorList)

        initPeripheralList.length = 0
        axios
            .get('/list/peripherals')
            .then((data: any) =>
                data.map((i: any) =>
                    initPeripheralList.push({
                        id: i.peripheralId,
                        name: i.peripheralName,
                        purchase_Date: i.purchaseDate,
                        assigned: i.isAssigned ? i.employeeFirstName + i.employeeLastName : '',
                    })
                )
            )
            .catch((err: any) => console.log(err))
        setPeripherlList(initPeripheralList)
    }, [setServerList, setLaptopList, setMonitorList, setPeripherlList])

    //filter the list based on search
    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        let filteredTableInput
        listData[0].id !== undefined
            ? (filteredTableInput = listData.filter((row: any) => {
                  return row[selected.value] !== undefined
                      ? row[selected.value]
                            .toString()
                            .toLowerCase()
                            .search(search.toLowerCase()) !== -1
                      : false
              }))
            : (filteredTableInput = listData)
        setFiltered(filteredTableInput)
        selectedHW.selectedList[0] && setColumns(Object.keys(selectedHW.selectedList[0]))
    }, [search, selected, listData, selectedHW])

    // format columns for search filter
    useEffect(() => {
        initOptions.length = 0
        columns.map(i => {
            initOptions.push({
                value: i,
                label: i.replace(/_/g, ' '),
            })
        })
        setOptions(initOptions)
    }, [columns])

    //update dropdown content
    useEffect(() => {
        initDropdownContent.length = 0
        initDropdownContent.push({name: 'servers', selectedList: serverList})
        initDropdownContent.push({name: 'laptops', selectedList: laptopList})
        initDropdownContent.push({name: 'monitors', selectedList: monitorList})
        initDropdownContent.push({name: 'peripherals', selectedList: peripheralList})
    }, [serverList, laptopList, monitorList, peripheralList])

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (id: number) => {
        history.push(`${match.url}/${id}`)
    }

    return (
        <div className={styles.hardwareListMain}>
            <Switch>
                {/*TODO: replace divs w/ detail page */}
                <Route path='/hardware/new' render={props => <div>New Employee Detail Page</div>} />
                <Route path='/hardware/:name' render={props => <div>{props.match.params.name} Detail Page</div>} />
            </Switch>
            <Group direction='row' justify='between'>
                <Button text='Add' icon='add' onClick={handleClick} />

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>
            <div className={styles.dropdown}>
                <div className={dropdownStyles.dropdownContainer}>
                    <DropdownList
                        triggerElement={({isOpen, toggle}) => (
                            <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                <div className={dropdownStyles.dropdownTitle}>
                                    <div>{selectedHW.name}</div>
                                    <div className={dropdownStyles.dropdownArrow} />
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
                                            setListData(i.selectedList)
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
            </div>
            {/*<List />*/}

            {
                <div className={styles.list}>
                    list of {selectedHW.name} searched using {selected.label}
                </div>
            }
        </div>
    )
}
