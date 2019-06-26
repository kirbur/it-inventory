import React, {useState, useEffect, useContext} from 'react'
import {Route, Switch, BrowserRouter as Router} from 'react-router-dom'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'

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
        history.push(`/employees/edit/new`)
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

    //this is the only thing to change
    const headerList = ['Employees', 'Date Hired', 'Days Employed', 'Cost']

    //-------------- this will all be the same -------------
    const headerStates = []
    const headerStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.notSorted)
        headerStateCounts.push(0)
    }
    var initHeaderStates = cloneDeep(headerStates)
    var initHeaderStateCounts = cloneDeep(headerStateCounts)
    var tempHeaderStates = cloneDeep(headerStates)
    var tempHeaderStateCounts = cloneDeep(headerStateCounts)

    var initState = {headerStates, headerStateCounts}
    const [sortState, setSortState] = useState(initState)

    function sortStates(index: number) {
        if (sortState.headerStateCounts[index] == 0) {
            tempHeaderStates[index] = styles.descending
            tempHeaderStateCounts[index] = 1
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        } else if (sortState.headerStateCounts[index] == 1) {
            tempHeaderStates[index] = styles.ascending
            tempHeaderStateCounts[index] = 0
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        }
    }

    const renderHeaders = () => {
        var headers = []

        var firstHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 0, sortState.headerStateCounts[0]))
                    sortStates(0)
                }}
            >
                <div className={s(styles.header, styles.nameHeader)}>
                    {headerList[0]}
                    <div className={sortState.headerStates[0]} />
                </div>
            </td>
        )
        headers.push(firstHeader)

        for (let i = 1; i < headerList.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setRows(sortTable(rows, i, sortState.headerStateCounts[i]))
                        sortStates(i)
                    }}
                >
                    <div className={styles.header}>
                        {headerList[i]}
                        <div className={sortState.headerStates[i]} />
                    </div>
                </td>
            )
            headers.push(header)
        }

        return headers
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
