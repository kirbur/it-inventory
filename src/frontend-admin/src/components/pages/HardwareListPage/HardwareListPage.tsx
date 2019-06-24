import React, {useState, useEffect, useContext} from 'react'
import {Switch, Route} from 'react-router-dom'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

import {sortTable} from '../../../utilities/quicksort'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'
import {LaptopsListPage} from './LaptopsListPage'
import {ServersListPage} from './ServersListPage'
import {MonitorsListPage} from './MonitorsListPage'
import {PeripheralListPage} from './PeripheralsListPage'

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

// Primary Component
export const HardwareListPage: React.SFC<IHardwareListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [serverList, setServerList] = useState<any[]>([])
    const [laptopList, setLaptopList] = useState<any[]>([])
    const [monitorList, setMonitorList] = useState<any[]>([])
    const [peripheralList, setPeripherlList] = useState<any[]>([])
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})
    const [selectedHW, setSelectedHW] = useState<{id: number; name: string; onClick: any}>({
        id: 0,
        name: 'servers',
        onClick: () => history.push('/hardware/servers'),
    })

    const dropdownContent = [
        {id: 0, name: 'servers', onClick: () => history.push('/hardware/servers')},
        {id: 1, name: 'laptops', onClick: () => history.push('/hardware/laptops')},
        {id: 2, name: 'monitors', onClick: () => history.push('/hardware/monitors')},
        {id: 3, name: 'peripherals', onClick: () => history.push('/hardware/peripherals')},
    ]
    const allColumns: any = {
        peripherals: ['name', 'purchaseDate', 'assigned'],
        servers: ['FQDN', 'numberOfCores', 'RAM', 'renewalDate', 'MFGTag'],
        monitors: ['make', 'screenSize', 'Resolution', 'inputs', 'assigned'],
        laptops: ['CPU', 'RAM', 'SSD', 'assigned', 'MFGTag'],
    }
    const allHeaders: any = {
        peripherals: ['Name', 'Purchase Date', 'Assigned To'],
        servers: ['FQDN', 'Number of Cores', 'RAM', 'Renewal Date', 'MFG Tag'],
        monitors: ['Make', 'Screen Size', 'Resolution', 'Inputs', 'Assigned To'],
        laptops: ['CPU', 'RAM', 'SSD', 'Assigned To', 'MFG Tag'],
    }
    var allOptions: any = {
        peripherals: [],
        servers: [],
        monitors: [],
        laptops: [],
    }
    allOptions.peripherals = allColumns.peripherals.map((c: any, i: any) => ({
        label: allHeaders.peripherals[i],
        value: c,
    }))
    allOptions.servers = allColumns.servers.map((c: any, i: any) => ({label: allHeaders.servers[i], value: c}))
    allOptions.monitors = allColumns.monitors.map((c: any, i: any) => ({label: allHeaders.monitors[i], value: c}))
    allOptions.laptops = allColumns.laptops.map((c: any, i: any) => ({label: allHeaders.laptops[i], value: c}))

    // default / current list info
    const [columns, setColumns] = useState(['FQDN', 'numberOfCores', 'RAM', 'renewalDate', 'MFGTag'])
    const [headers, setHeaders] = useState(['FQDN', 'Number of Cores', 'RAM', 'Renewal Date', 'MFG Tag'])
    const [options, setOptions] = useState(columns.map((c, i) => ({label: headers[i], value: c})))

    //fetch data
    useEffect(() => {
        axios
            .get('/list/servers')
            .then((data: any) => {
                var servers: any[] = []
                data.map((i: any) =>
                    servers.push({
                        id: i.serverId,
                        FQDN: i.fqdn,
                        numberOfCores: i.numberOfCores,
                        RAM: i.ram,
                        renewalDate: i.renewalDate,
                        MFGTag: i.mfg,
                    })
                )
                setServerList(servers)
                setListData(servers)
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/list/laptops')
            .then((data: any) => {
                var laptops: any[] = []
                data.map((i: any) =>
                    laptops.push({
                        id: i.computerId,
                        CPU: i.cpu,
                        RAM: i.ramgb,
                        SSD: i.ssdgb,
                        assigned: i.isAssigned ? i.employeeFirstName + i.employeeLastName : '',
                        MFGTag: i.mfg,
                    })
                )
                setLaptopList(laptops)
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/list/monitors')
            .then((data: any) => {
                var monitors: any[] = []
                data.map((i: any) =>
                    monitors.push({
                        id: i.monitorId,
                        make: i.make,
                        screenSize: i.screenSize,
                        resolution: i.resolution,
                        inputs: i.inputs,
                        assigned: i.isAssigned ? i.employeeFirstName + i.employeeLastName : '',
                    })
                )
                setMonitorList(monitors)
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/list/peripherals')
            .then((data: any) => {
                var peripherals: any[] = []
                data.map((i: any) =>
                    peripherals.push({
                        id: i.peripheralId,
                        name: i.peripheralName,
                        purchaseDate: i.purchaseDate,
                        assigned: i.isAssigned ? i.employeeFirstName + i.employeeLastName : '',
                    })
                )
                setPeripherlList(peripherals)
            })
            .catch((err: any) => console.error(err))
    }, [setServerList, setLaptopList, setMonitorList, setPeripherlList])

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        let filteredTableInput = listData.filter((row: any) => {
            return !row[selected.value]
                ? false
                : row[selected.value]
                      .toString()
                      .toLowerCase()
                      .search(search.toLowerCase()) !== -1
        })
        setFilteredData(filteredTableInput)
    }, [search, selected, listData])

    //update current list info when a new hardwar elist is selected
    useEffect(() => {
        switch (selectedHW.name) {
            case 'servers':
                setListData(serverList)
                setColumns(allColumns.servers)
                setHeaders(allHeaders.servers)
                setOptions(allOptions.servers)
                setSelected({label: 'FQDN', value: 'FQDN'})
                break
            case 'laptops':
                setListData(laptopList)
                setColumns(allColumns.laptops)
                setHeaders(allHeaders.laptops)
                setOptions(allOptions.laptops)
                setSelected({label: 'CPU', value: 'CPU'})
                break

            case 'monitors':
                setListData(monitorList)
                setColumns(allColumns.monitors)
                setHeaders(allHeaders.monitors)
                setOptions(allOptions.monitors)
                setSelected({label: 'make', value: 'make'})
                break
            case 'peripherals':
                setListData(peripheralList)
                setColumns(allColumns.peripherals)
                setHeaders(allHeaders.peripherals)
                setOptions(allOptions.peripherals)
                setSelected({label: 'name', value: 'name'})
                break
        }
    }, [selectedHW])

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (id: number) => {
        history.push(`${match.url}/${id}`)
    }

    function concatenateName(data: any) {
        return (
            <td className={styles.hardware}>
                <img className={styles.icon} src={icon} />
                <div className={styles.alignLeft}>
                    <text className={styles.name}>{data.name}</text> <br />
                    <text className={styles.role}>{data.role}</text>
                </div>
            </td>
        )
    }

    const concatenateDateHired = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>{data.dateHired}</td>
    }

    const concatenateDaysEmployed = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>{data.daysEmployed} days</td>
    }

    const concatenatedCost = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>${data.cost}</td>
    }

    //console.log(filteredData)
    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])

    //if it is 0 --> descending
    //if it is 1 --> ascending
    const [sortedState, setSortedState] = useState({
        nameSortDir: styles.notSorted,
        name: 0,
        dateHiredSortDir: styles.notSorted,
        dateHired: 0,
        daysEmployedSortDir: styles.notSorted,
        daysEmployed: 0,
        costSortDir: styles.notSorted,
        cost: 0,
    })
    const initSortedState = {
        nameSortDir: styles.notSorted,
        name: 0,
        dateHiredSortDir: styles.notSorted,
        dateHired: 0,
        daysEmployedSortDir: styles.notSorted,
        daysEmployed: 0,
        costSortDir: styles.notSorted,
        cost: 0,
    }
    function sortByName() {
        if (sortedState.name == 0) {
            setSortedState({...initSortedState, nameSortDir: styles.descending, name: 1})
        } else if (sortedState.name == 1) {
            setSortedState({...initSortedState, nameSortDir: styles.ascending, name: 0})
        }
    }

    function sortByDateHired() {
        if (sortedState.dateHired == 0) {
            setSortedState({...initSortedState, dateHiredSortDir: styles.descending, dateHired: 1})
        } else if (sortedState.dateHired == 1) {
            setSortedState({...initSortedState, dateHiredSortDir: styles.ascending, dateHired: 0})
        }
    }
    function sortByDaysEmployed() {
        if (sortedState.daysEmployed == 0) {
            setSortedState({...initSortedState, daysEmployedSortDir: styles.descending, daysEmployed: 1})
        } else if (sortedState.daysEmployed == 1) {
            setSortedState({...initSortedState, daysEmployedSortDir: styles.ascending, daysEmployed: 0})
        }
    }

    function sortByCost() {
        if (sortedState.cost == 0) {
            setSortedState({...initSortedState, costSortDir: styles.descending, cost: 1})
        } else if (sortedState.cost == 1) {
            setSortedState({...initSortedState, costSortDir: styles.ascending, cost: 0})
        }
    }
    const renderHeaders = () => {
        var nameHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 0, sortedState.name))
                    sortByName()
                }}
            >
                <div className={s(styles.header, styles.nameHeader)}>
                    Employee
                    <div className={sortedState.nameSortDir} />
                </div>
            </td>
        )
        var dateHiredHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 2, sortedState.dateHired))
                    sortByDateHired()
                }}
            >
                <div className={styles.header}>
                    Date Hired
                    <div className={sortedState.dateHiredSortDir} />
                </div>
            </td>
        )
        var daysEmployedHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 5, sortedState.daysEmployed))
                    sortByDaysEmployed()
                }}
            >
                <div className={styles.header}>
                    Days Employed
                    <div className={sortedState.daysEmployedSortDir} />
                </div>
            </td>
        )
        var costHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 6, sortedState.cost))
                    sortByCost()
                }}
            >
                <div className={styles.header}>
                    Cost
                    <div className={sortedState.costSortDir} />
                </div>
            </td>
        )
        return [nameHeader, dateHiredHeader, daysEmployedHeader, costHeader]
    }

    function concatenatedName(row: any[]) {
        return (
            <td className={styles.employees}>
                <img className={styles.icon} src={icon} />
                <div className={styles.alignLeft}>
                    <text className={styles.employeeName}>{row[0]}</text> <br />
                    <text className={styles.role}>{row[1]}</text>
                </div>
            </td>
        )
    }
    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = concatenatedName(row)
                case 1:
                    break
                case 2:
                    transformedRow[1] = <td className={styles.alignLeft}>{row[2]}</td>
                case 3:
                    transformedRow[2] = <td className={styles.alignLeft}>{row[3]}</td>
                case 4:
                    transformedRow[3] = <td className={styles.alignLeft}>${row[4]}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

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
            {/* <Group direction='row' justify='between'>
                <Button text='Add' icon='add' onClick={handleClick} />

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group> */}
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
                                            //i.onClick()
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
                {/* {selected ? selected.onClick && selected.onClick(selected.id) : null} */}
            </div>
            {displayList()}
            {/* <Table headers={renderHeaders()} rows={renderedRows} /> */}
        </div>
    )
}
