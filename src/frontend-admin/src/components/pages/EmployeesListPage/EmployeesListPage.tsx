import React, {useState, useEffect, useContext} from 'react'
import {Route, Switch, BrowserRouter as Router} from 'react-router-dom'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {sortTable} from '../../../utilities/quickSort'
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
import styles from './EmployeesListPage.module.css'

// Types
interface IEmployeesListPageProps {
    history: any
    match: any
}

interface ITableDatum {
    name: string
    role: string
    dateHired: string
    daysEmployed: number
    hardwareCost: number
    programsCost: number
}

const initListData: ITableDatum[] = [
    // {name: '', role: '', dateHired: '', daysEmployed: 0, hardwareCost: 0, programCost: 0},
]
const initColumns: string[] = []
const initOptions: {value: string; label: string}[] = []

// Primary Component
export const EmployeesListPage: React.SFC<IEmployeesListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState(initListData)
    const [columns, setColumns] = useState(initColumns)
    const [options, setOptions] = useState(initOptions)
    const [filtered, setFiltered] = useState(listData) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})

    useEffect(() => {
        initListData.length = 0
        axios
            .get('/list/employees')
            .then((data: any) =>
                data.map((i: any) =>
                    initListData.push({
                        name: i.employeeName,
                        role: i.role,
                        dateHired: i.hireDate,
                        daysEmployed: 0,
                        hardwareCost: i.hardwareCostForEmp,
                        programsCost: i.programCostForEmp,
                    })
                )
            )
            .catch((err: any) => console.log(err))

        setListData(initListData)
    }, [setListData])

    useEffect(() => {
        console.log(listData)
        // Search through listData based on current value
        // of search bar and save results in filtered
        let filteredTableInput = listData
        filteredTableInput = listData.filter((row: any) => {
            console.log(row)
            return (
                row[selected.value]
                    .toString()
                    .toLowerCase()
                    .search(search.toLowerCase()) !== -1
            )
        })
        console.log(listData)
        setFiltered(filteredTableInput)
        listData[0] && setColumns(Object.keys(listData[0]))
        // setColumns(['name', 'role', 'dateHired', 'daysEmployed', 'hardwareCost', 'programsCost'])
    }, [search, selected, listData])

    useEffect(() => {
        initOptions.length = 0
        columns.map(i => {
            initOptions.push({value: i, label: i.replace(/([a-zA-Z])(?=[A-Z])/g, '$1 ').toLowerCase()})
        })
        setOptions(initOptions)
    }, [columns])

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (id: number) => {
        history.push(`${match.url}/${id}`)
    }

    const [rows, setRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12', 0, 350],
        ['Joe Montana', 'Sales', '2012/09/11', 1, 200],
        ['Bob the Builder', 'Developer', '2012/09/13', 154, 575],
        ['Anne Manion', 'PM', '2010/09/12', 16, 154],
        ['Sue Z', 'Designer', '2014/09/12', 15, 764],
        ['Bill Belichik', 'Sales', '2012/09/12', 0, 350],
        ['Joe Montana', 'Sales', '2012/09/11', 1, 200],
        ['Bob the Builder', 'Developer', '2012/09/13', 154, 575],
        ['Anne Manion', 'PM', '2010/09/12', 16, 154],
        ['Sue Z', 'Designer', '2014/09/12', 15, 764],
        ['Bill Belichik', 'Sales', '2012/09/12', 0, 350],
        ['Joe Montana', 'Sales', '2012/09/11', 1, 200],
        ['Bob the Builder', 'Developer', '2012/09/13', 154, 575],
        ['Anne Manion', 'PM', '2010/09/12', 16, 154],
        ['Sue Z', 'Designer', '2014/09/12', 15, 764],
        ['Bill Belichik', 'Sales', '2012/09/12', 0, 350],
        ['Joe Montana', 'Sales', '2012/09/11', 1, 200],
        ['Bob the Builder', 'Developer', '2012/09/13', 154, 575],
        ['Anne Manion', 'PM', '2010/09/12', 16, 154],
        ['Sue Z', 'Designer', '2014/09/12', 15, 764],
    ])

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
                    setRows(sortTable(rows, 3, sortedState.daysEmployed))
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
                    setRows(sortTable(rows, 4, sortedState.cost))
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

    return (
        <div className={styles.employeesListMain}>
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

            <div className={styles.page}>
                <Table headers={renderHeaders()} rows={renderedRows} />
            </div>
        </div>
    )
}
