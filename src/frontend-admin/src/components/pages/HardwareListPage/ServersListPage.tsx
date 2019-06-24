import React, {useState, useEffect, useContext} from 'react'
import {Switch, Route} from 'react-router-dom'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

import {sortTable} from '../../../utilities/quicksort'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './HardwareListPage.module.css'

// Types
interface IServersListPageProps {
    history: any
}

// Helpers

// Primary Component
export const ServersListPage: React.SFC<IServersListPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'FQDN', value: 'FQDN'})

    const columns = ['FQDN', 'numberOfCores', 'RAM', 'renewalDate', 'MFGTag']
    const headers = ['FQDN', 'Number of Cores', 'RAM', 'Renewal Date', 'MFG Tag']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/servers')
            .then((data: any) => {
                const servers: any[] = []
                data.map((i: any) => {
                    servers.push({
                        id: i.serverId,
                        FQDN: i.fqdn,
                        numberOfCores: i.numberOfCores,
                        RAM: i.ram,
                        renewalDate: formatDate(i.renewalDate),
                        MFGTag: i.mfg ? i.mfg : '-',
                    })
                })
                setListData(servers)
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        var filteredTableInput = listData.filter((row: any) => {
            return !row[selected.value]
                ? false
                : row[selected.value]
                      .toString()
                      .toLowerCase()
                      .search(search.toLowerCase()) !== -1
        })
        setFilteredData(filteredTableInput)
    }, [search, selected, listData])

    const formatDate = (hireDate: string) => {
        //TODO: fix this, jan is month 0?? look @ fish
        const hired = new Date(hireDate)
        const date = hired.getFullYear() + '/' + (hired.getMonth() + 1) + '/' + hired.getDate()
        return date
    }

    const handleClick = () => {
        history.push(`hardware/item/new`)
    }

    const handleRowClick = (row: any) => {
        history.push(`hardware/item/${row[0].props.children}`) //TODO: fix this, are names unique??
    }

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
        fqdnSortDir: styles.notSorted,
        fqdn: 0,
        numCoresSortDir: styles.notSorted,
        numCores: 0,
        ramSortDir: styles.notSorted,
        ram: 0,
        renewalDateSortDir: styles.notSorted,
        renewalDate: 0,
        mfgTagSortDir: styles.notSorted,
        mfgTag: 0,
    })
    const initSortedState = {
        fqdnSortDir: styles.notSorted,
        fqdn: 0,
        numCoresSortDir: styles.notSorted,
        numCores: 0,
        ramSortDir: styles.notSorted,
        ram: 0,
        renewalDateSortDir: styles.notSorted,
        renewalDate: 0,
        mfgTagSortDir: styles.notSorted,
        mfgTag: 0,
    }
    function sortByFQDN() {
        if (sortedState.fqdn == 0) {
            setSortedState({...initSortedState, fqdnSortDir: styles.descending, fqdn: 1})
        } else if (sortedState.fqdn == 1) {
            setSortedState({...initSortedState, fqdnSortDir: styles.ascending, fqdn: 0})
        }
    }

    function sortByNumCores() {
        if (sortedState.numCores == 0) {
            setSortedState({...initSortedState, numCoresSortDir: styles.descending, numCores: 1})
        } else if (sortedState.numCores == 1) {
            setSortedState({...initSortedState, numCoresSortDir: styles.ascending, numCores: 0})
        }
    }
    function sortByRam() {
        if (sortedState.ram == 0) {
            setSortedState({...initSortedState, ramSortDir: styles.descending, ram: 1})
        } else if (sortedState.ram == 1) {
            setSortedState({...initSortedState, ramSortDir: styles.ascending, ram: 0})
        }
    }

    function sortByRenewalDate() {
        if (sortedState.renewalDate == 0) {
            setSortedState({...initSortedState, renewalDateSortDir: styles.descending, renewalDate: 1})
        } else if (sortedState.renewalDate == 1) {
            setSortedState({...initSortedState, renewalDateSortDir: styles.ascending, renewalDate: 0})
        }
    }

    function sortByMFGTag() {
        if (sortedState.mfgTag == 0) {
            setSortedState({...initSortedState, mfgTagSortDir: styles.descending, mfgTag: 1})
        } else if (sortedState.mfgTag == 1) {
            setSortedState({...initSortedState, mfgTagSortDir: styles.ascending, mfgTag: 0})
        }
    }

    const renderHeaders = () => {
        var FQDNHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 0, sortedState.fqdn))
                    sortByFQDN()
                }}
            >
                <div className={styles.header}>
                    FQDN
                    <div className={sortedState.fqdnSortDir} />
                </div>
            </td>
        )
        var numCoresHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 2, sortedState.numCores))
                    sortByNumCores()
                }}
            >
                <div className={styles.header}>
                    Number of Cores
                    <div className={sortedState.numCoresSortDir} />
                </div>
            </td>
        )
        var ramHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 5, sortedState.ram))
                    sortByRam()
                }}
            >
                <div className={styles.header}>
                    RAM
                    <div className={sortedState.ramSortDir} />
                </div>
            </td>
        )
        var renewalDateHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 6, sortedState.renewalDate))
                    sortByRenewalDate()
                }}
            >
                <div className={styles.header}>
                    Renewal Date
                    <div className={sortedState.renewalDateSortDir} />
                </div>
            </td>
        )
        var mfgTageHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 6, sortedState.mfgTag))
                    sortByMFGTag()
                }}
            >
                <div className={styles.header}>
                    MFGTag
                    <div className={sortedState.mfgTagSortDir} />
                </div>
            </td>
        )
        return [FQDNHeader, numCoresHeader, ramHeader, renewalDateHeader, mfgTageHeader]
    }

    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = <td className={styles.alignLeft}>{row[1]}</td>
                case 1:
                    transformedRow[1] = <td className={styles.alignLeft}>{row[2]}</td>
                case 2:
                    transformedRow[2] = <td className={styles.alignLeft}>{row[3]}</td>
                case 3:
                    transformedRow[3] = <td className={styles.alignLeft}>{row[4]}</td>
                case 4:
                    transformedRow[4] = <td className={styles.alignLeft}>{row[5]}</td>
            }
        }

        renderedRows.push(transformedRow)
    })
    return (
        <div className={styles.listMain}>
            <Group direction='row' justify='between' className={styles.group}>
                <Button text='Add' icon='add' onClick={handleClick} />

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>

            <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
        </div>
    )
}
