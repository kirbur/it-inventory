import React, {useState, useEffect, useContext} from 'react'
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

    const columns = ['name', 'role', 'dateHired', 'daysEmployed', 'cost']
    const headers = ['Employees', 'Role', 'Date Hired', 'Days Employed', 'Cost']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/employees')
            .then((data: any) => {
                const employees: any[] = []
                data.map((i: any) => {
                    employees.push({
                        name: i.employeeName,
                        role: i.role,
                        dateHired: formatDate(i.hireDate),
                        daysEmployed: calculateDaysEmployed(i.hireDate),
                        cost: formatCost(i.hardwareCostForEmp, i.programCostForEmp),

                        daysEmployedNumber: getDays(i.hireDate),
                        costNumber: i.hardwareCostForEmp + i.programCostForEmp,
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
        //TODO: fix this, jan is month 0?? look @ fish
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
    const calculateDaysEmployed = (hireDate: string) => {
        var oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
        const today = new Date()
        const hired = new Date(hireDate)
        const dif = Math.round(Math.abs(today.getTime() - hired.getTime()))

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
        return 'HW: $' + hwCpost + ' | SW: $' + progCost //TODO: SW or PROG? or something else??
    }

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (row: any) => {
        // console.log(row[0].props.children[1].props.children[0].props.children)
        history.push(`${match.url}/${row[0].props.children[1].props.children[0].props.children}`)
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

    //console.log(rows)

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
