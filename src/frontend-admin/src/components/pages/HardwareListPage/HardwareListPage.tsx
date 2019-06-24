import React, {useState, useEffect} from 'react'
import {Switch, Route} from 'react-router-dom'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'

// Styles
import styles from './HardwareListPage.module.css'

// Types
interface IHardwareListPageProps {
    history: any
}

//TODO: replace any w/ real type
const initListData: any[] = []

// Primary Component
export const HardwareListPage: React.SFC<IHardwareListPageProps> = props => {
    const {history} = props
    const [listData, setListData] = useState(initListData)
    const [filtered, setFiltered] = useState(listData) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})

    useEffect(() => {
        //TODO: replace w/ real type
        let data: any[] = []
        //TODO: fetch data
        setListData(data)
    }, [setListData])

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        let filteredTableInput = listData
        filteredTableInput = listData.filter((row: any) => {
            return (
                row[selected.value]
                    .toString()
                    .toLowerCase()
                    .search(search.toLowerCase()) !== -1
            )
        })
        setFiltered(filteredTableInput)
    }, [search, selected, listData])

    const handleClick = () => {
        history.push('/hardware/new')
    }

    const handleRowClick = (name: string) => {
        history.push(`/hardware/${name}`)
    }

    const [rows, setRows] = useState([
        ['Jira', 0, 350],
        ['Atlassian', 1, 200],
        ['Minecraft', 154, 575],
        ['WoW', 16, 154],
        ['League', 15, 764],
        ['Office 365', 0, 350],
        ['Joe Montana', 1, 200],
        ['Bob the Builder', 154, 575],
        ['Anne Manion', 16, 154],
        ['Sue Z', 15, 764],
        ['Bill Belichik', 0, 350],
        ['Joe Montana', 1, 200],
    ])

    //if it is 0 --> descending
    //if it is 1 --> ascending
    const [sortedState, setSortedState] = useState({
        deptSortDir: styles.notSorted,
        dept: 0,
        totalEmployeesSortDir: styles.notSorted,
        totalEmployees: 0,
        costSortDir: styles.notSorted,
        cost: 0,
    })

    const initSortedState = {
        deptSortDir: styles.notSorted,
        dept: 0,
        totalEmployeesSortDir: styles.notSorted,
        totalEmployees: 0,
        costSortDir: styles.notSorted,
        cost: 0,
    }

    function sortByDept() {
        if (sortedState.dept == 0) {
            setSortedState({...initSortedState, deptSortDir: styles.descending, dept: 1})
        } else if (sortedState.dept == 1) {
            setSortedState({...initSortedState, deptSortDir: styles.ascending, dept: 0})
        }
    }

    function sortByTotalEmployees() {
        if (sortedState.totalEmployees == 0) {
            setSortedState({...initSortedState, totalEmployeesSortDir: styles.descending, totalEmployees: 1})
        } else if (sortedState.totalEmployees == 1) {
            setSortedState({...initSortedState, totalEmployeesSortDir: styles.ascending, totalEmployees: 0})
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
        var deptHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 0, sortedState.dept))
                    sortByDept()
                }}
            >
                <div className={s(styles.header, styles.deptHeader)}>
                    Departments
                    <div className={sortedState.deptSortDir} />
                </div>
            </td>
        )
        var totalEmployeesHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 1, sortedState.totalEmployees))
                    sortByTotalEmployees()
                }}
            >
                <div className={styles.header}>
                    Total Employees
                    <div className={sortedState.totalEmployeesSortDir} />
                </div>
            </td>
        )
        var costHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 2, sortedState.cost))
                    sortByCost()
                }}
            >
                <div className={styles.header}>
                    Cost
                    <div className={sortedState.costSortDir} />
                </div>
            </td>
        )
        return [deptHeader, totalEmployeesHeader, costHeader]
    }

    function concatenatedDept(row: any[]) {
        return (
            <td className={styles.departments}>
                <img className={styles.icon} src={icon} />
                <div className={styles.alignLeft}>
                    <text className={styles.departmentName}>{row[0]}</text>
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
                    transformedRow[0] = concatenatedDept(row)
                case 1:
                    break
                case 2:
                    transformedRow[1] = <td className={styles.alignLeft}>{row[1]} employees</td>
                case 3:
                    transformedRow[2] = <td className={styles.alignLeft}>${row[2]}</td>
            }
        }

        renderedRows.push(transformedRow)
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
                    options={[
                        //TODO: replace w/ real options
                        {label: 'name', value: 'name'},
                        {label: 'cost', value: 'cost'},
                    ]}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>

            {/*<List />*/}

            <div className={styles.page}>
                <Table headers={renderHeaders()} rows={renderedRows} />
            </div>
        </div>
    )
}
