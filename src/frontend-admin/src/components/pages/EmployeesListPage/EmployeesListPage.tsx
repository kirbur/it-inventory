import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'

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

// Primary Component
export const EmployeesListPage: React.SFC<IEmployeesListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})

    const columns = ['name', 'role', 'id', 'dateHired', 'daysEmployed', 'cost', 'hardware', 'programs']
    const headers = ['Employees', 'Role', 'ID', 'Date Hired', 'Days Employed', 'Cost', 'Hardware', 'Programs']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/employees')
            .then((data: any) => {
                const employees: any[] = []
                console.log(data)
                data.map((i: any) => {
                    employees.push({
                        name: format(i.employeeName),
                        dateHired: formatDate(i.hireDate),
                        daysEmployedNumber: getDays(i.hireDate),
                        cost: formatCost(i.hardwareCostForEmp, i.programCostForEmp),
                        hwCost: i.hardwareCostForEmp,
                        swCost: i.programCostForEmp,
                        role: format(i.role),
                        icon: format(i.photo),
                        id: i.employeeId,

                        //for searching
                        hardware: i.hardwareList.join(', '),
                        programs: i.progForEmp.join(', '),
                        daysEmployed: calculateDaysEmployed(getDays(i.hireDate)),
                    })
                })
                setListData(employees)
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
        const hired = new Date(hireDate)
        const date = hired.getFullYear() + '/' + (hired.getMonth() + 1) + '/' + hired.getDate()
        return date
    }

    const getDays = (hireDate: string) => {
        const today = new Date()
        const hired = new Date(hireDate)
        return Math.round(Math.abs(today.getTime() - hired.getTime()))
    }

    //does not account for leap years or variable # of days in a month
    const calculateDaysEmployed = (dif: number) => {
        var oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds

        var days = Math.floor(dif / oneDay)
        var months = Math.floor(days / 31)
        var years = Math.floor(months / 12)

        months = Math.floor(months % 12)
        days = Math.floor(days % 31)

        var ret: string = ''
        ret += years !== 0 ? (years === 1 ? years + ' year, ' : years + ' years, ') : ''
        ret += months !== 0 ? (months === 1 ? months + ' month, ' : months + ' months, ') : ''
        ret += days === 1 ? days + ' day' : days + ' days'
        return ret
    }

    const formatCost = (hwCpost: number, progCost: number) => {
        return 'HW: $' + hwCpost + ' | SW: $' + progCost + ' /mo' //TODO: SW or PROG? or something else??
    }

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (row: any) => {
        // history.push(`${match.url}/${row[0].props.children[1].props.children[0].props.children}`)
        history.push(`${match.url}/${row[1].props.children}`)
    }

    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])

    //this is the only thing to change
    const headerList = ['Employees', 'ID', 'Date Hired', 'Days Employed', 'Cost']

    //-------------- this will all be the same -------------
    const headerStates = []
    const headerStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.descending)
        headerStateCounts.push(0)
    }
    //var initHeaderStates = cloneDeep(headerStates)
    var initHeaderStateCounts = cloneDeep(headerStateCounts)
    var tempHeaderStates = cloneDeep(headerStates)
    var tempHeaderStateCounts = cloneDeep(headerStateCounts)

    var initState = {headerStates, headerStateCounts}
    const [sortState, setSortState] = useState(initState)

    function sortStates(index: number) {
        if (sortState.headerStateCounts[index] === 0) {
            tempHeaderStates[index] = styles.descending
            tempHeaderStateCounts[index] = 1
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        } else if (sortState.headerStateCounts[index] === 1) {
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
            let header =
                i === 3 ? (
                    <td
                        onClick={e => {
                            setRows(sortTable(rows, i + 1, sortState.headerStateCounts[i]))
                            sortStates(i)
                        }}
                    >
                        <div className={styles.header}>
                            {headerList[i]}
                            <div className={sortState.headerStates[i]} />
                        </div>
                    </td>
                ) : (
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
                <img className={styles.icon} src={URL + row[7]} alt={''} />
                <div className={styles.alignLeft}>
                    <text className={styles.employeeName}>{row[0]}</text> <br />
                    <text className={styles.role}>{row[6]}</text>
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
                    transformedRow[1] = <td className={styles.alignLeft}>{row[8]}</td>
                case 2:
                    transformedRow[2] = <td className={styles.alignLeft}>{row[1]}</td>
                case 3:
                    transformedRow[3] = <td className={styles.alignLeft}>{calculateDaysEmployed(row[2])}</td>
                case 4:
                    transformedRow[4] = <td className={styles.alignLeft}>{formatCost(row[4], row[5])}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.employeesListMain}>
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
