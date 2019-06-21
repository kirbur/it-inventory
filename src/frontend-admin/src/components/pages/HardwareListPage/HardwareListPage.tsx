import React, {useState, useEffect, useContext} from 'react'
import {Switch, Route} from 'react-router-dom'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'

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
    const [selectedHW, setSelectedHW] = useState<{id: number; name: string}>({id: 0, name: 'servers'})

    const dropdownContent = [
        {id: 0, name: 'servers'},
        {id: 1, name: 'laptops'},
        {id: 2, name: 'monitors'},
        {id: 3, name: 'peripherals'},
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
            return row[selected.value]
                ? row[selected.value]
                      .toString()
                      .toLowerCase()
                      .search(search.toLowerCase()) !== -1
                : false
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
    const concatenatedName = (data: any) => {
        return (
            <td className={styles.hardware}>
                <img className={styles.icon} src={icon} alt='' />
                <text className={styles.name}>{data.name}</text>
            </td>
        )
    }
    const concatenatedFQDN = (data: any) => {
        return <td>{data.FQDN}</td>
    }
    const concatenatedNumber_Of_Cores = (data: any) => {
        return <td>{data.number_Of_Cores} cores</td>
    }
    const concatenatedRAM = (data: any) => {
        return <td>{data.RAM} GB</td>
    }
    const concatenatedRenewal_Date = (data: any) => {
        return <td>{data.renewal_Date}</td>
    }
    const concatenatedMFG_Tag = (data: any) => {
        return <td>{data.MFG_Tag}</td>
    }
    const concatenatedCPU = (data: any) => {
        return <td>{data.CPU}</td>
    }
    const concatenatedSSD = (data: any) => {
        return <td>{data.SSD} GB</td>
    }
    const concatenatedAssigned = (data: any) => {
        return <td>{data.assigned}</td>
    }
    const concatenatedMake = (data: any) => {
        return <td>{data.make}</td>
    }
    const concatenatedScreen_Size = (data: any) => {
        return <td>{data.screen_Size} in</td>
    }
    const concatenatedResolution = (data: any) => {
        return <td>{data.resolution}</td>
    }
    const concatenatedInputs = (data: any) => {
        return <td>{data.inputs}</td>
    }
    const concatenatedPurchase_Date = (data: any) => {
        return <td>{data.purchase_date}</td>
    }

    const concatFunctions: any = {
        peripherals: [concatenatedName, concatenatedPurchase_Date, concatenatedAssigned],
        servers: [
            concatenatedFQDN,
            concatenatedNumber_Of_Cores,
            concatenatedRAM,
            concatenatedRenewal_Date,
            concatenatedMFG_Tag,
        ],
        monitors: [
            concatenatedMake,
            concatenatedScreen_Size,
            concatenatedResolution,
            concatenatedInputs,
            concatenatedAssigned,
        ],
        laptops: [concatenatedCPU, concatenatedRAM, concatenatedSSD, concatenatedAssigned, concatenatedMFG_Tag],
    }

    const {} = props
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

    console.log(filteredData)
    const rows: any[] = []
    filteredData.forEach(rowObj => {
        rows.push(Object.values(rowObj).map((val: any) => <td>{val}</td>))
    })

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

            <Table
                headers={headers}
                propData={rows}
                dataKeys={columns}
                concatonations={concatFunctions}
                onRowClick={handleRowClick}
            />
        </div>
    )
}
