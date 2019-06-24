import React, {useState, useEffect} from 'react'
import {Route, Switch} from 'react-router-dom'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'

// Styles
import styles from './ProgramsListPage.module.css'

// Types
interface IProgramsListPageProps {
    history: any
}

//TODO: replace any w/ real type
const initListData: any[] = []

// Primary Component
export const ProgramsListPage: React.SFC<IProgramsListPageProps> = props => {
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
        history.push('/programs/new')
    }

    const handleRowClick = (name: string) => {
        history.push(`/programs/${name}`)
    }

    const [rows, setRows] = useState([
        ['Jira', '2020/08/24', 0, 350],
        ['Atlassian', '2020/08/24', 1, 200],
        ['Minecraft', '2020/08/24', 154, 575],
        ['WoW', '2020/08/24', 16, 154],
        ['League', '2020/08/24', 15, 764],
        ['Office 365', '2020/08/24', 0, 350],
        ['Jira', '2020/08/24', 0, 350],
        ['Atlassian', '2020/08/24', 1, 200],
        ['Minecraft', '2020/08/24', 154, 575],
        ['WoW', '2020/08/24', 16, 154],
        ['League', '2020/08/24', 15, 764],
        ['Office 365', '2020/08/24', 0, 350],
    ])

    //if it is 0 --> descending
    //if it is 1 --> ascending
    const [sortedState, setSortedState] = useState({
        nameSortDir: styles.notSorted,
        name: 0,
        renewalDateSortDir: styles.notSorted,
        renewalDate: 0,
        totalUsersSortDir: styles.notSorted,
        totalUsers: 0,
        costSortDir: styles.notSorted,
        cost: 0,
    })

    const initSortedState = {
        nameSortDir: styles.notSorted,
        name: 0,
        renewalDateSortDir: styles.notSorted,
        renewalDate: 0,
        totalUsersSortDir: styles.notSorted,
        totalUsers: 0,
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

    function sortByRenewalDate() {
        if (sortedState.renewalDate == 0) {
            setSortedState({...initSortedState, renewalDateSortDir: styles.descending, renewalDate: 1})
        } else if (sortedState.renewalDate == 1) {
            setSortedState({...initSortedState, renewalDateSortDir: styles.ascending, renewalDate: 0})
        }
    }

    function sortByTotalUsers() {
        if (sortedState.totalUsers == 0) {
            setSortedState({...initSortedState, totalUsersSortDir: styles.descending, totalUsers: 1})
        } else if (sortedState.totalUsers == 1) {
            setSortedState({...initSortedState, totalUsersSortDir: styles.ascending, totalUsers: 0})
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
                    Programs
                    <div className={sortedState.nameSortDir} />
                </div>
            </td>
        )
        var renewalDateHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 1, sortedState.renewalDate))
                    sortByRenewalDate()
                }}
            >
                <div className={styles.header}>
                    Renewal Date
                    <div className={sortedState.renewalDateSortDir} />
                </div>
            </td>
        )
        var totalUsersHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 1, sortedState.totalUsers))
                    sortByTotalUsers()
                }}
            >
                <div className={styles.header}>
                    Total Users
                    <div className={sortedState.totalUsersSortDir} />
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
        return [nameHeader, renewalDateHeader, totalUsersHeader, costHeader]
    }

    function concatenatedDept(row: any[]) {
        return (
            <td className={styles.programs}>
                <img className={styles.icon} src={icon} />
                <div className={styles.alignLeft}>
                    <text className={styles.programName}>{row[0]}</text>
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
                    transformedRow[1] = <td className={styles.alignLeft}>{row[1]}</td>
                case 2:
                    transformedRow[1] = <td className={styles.alignLeft}>{row[2]} employees</td>
                case 3:
                    transformedRow[2] = <td className={styles.alignLeft}>${row[3]}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.programsListMain}>
            <Switch>
                <Route path='/programs/:name' render={props => <div>{props.match.params.name} Detail Page</div>} />
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
