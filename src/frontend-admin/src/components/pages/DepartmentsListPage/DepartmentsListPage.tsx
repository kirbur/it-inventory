import React, {useState, useEffect, useContext} from 'react'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'

// Styles
import styles from './DepartmentsListPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IDepartmentsListPageProps {
    history: any
    match: any
}

// Primary Component
export const DepartmentsListPage: React.SFC<IDepartmentsListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Departments', value: 'name'})

    const columns = ['name', 'totalEmployees', 'cost']
    const headerList = ['Departments', 'Total Employees', 'Programs Cost']
    const options = columns.map((c, i) => ({label: headerList[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/departments')
            .then((data: any) => {
                var depts: any[] = []
                data.map((i: any) =>
                    depts.push({
                        name: format(i.departmentName),
                        id: format(i.departmentId),
                        totalEmployees: format(i.numOfEmp),
                        //TODO: verify that this recieves a cost per year
                        cost: format(i.costOfPrograms),
                        icon: i.icon,
                    })
                )
                setListData(depts)
            })
            .catch((err: any) => console.error(err))
    }, [])

    const formatCost = (cost: number) => {
        return '$' + Math.round((cost / 12) * 100) / 100 + ' /mo | $' + cost + ' /yr'
    }

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

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (row: any) => {
        history.push(`${match.url}/${row[0].key}`)
    }

    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])

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
                        setRows(sortTable(rows, i + 1, sortState.headerStateCounts[i]))
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

    function concatenatedDept(row: any[]) {
        return (
            <td key={row[1]} className={styles.departments}>
                <img className={styles.icon} src={URL + row[4]} alt={''} />
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
                case 2:
                    transformedRow[2] = (
                        <td className={styles.alignLeft}>
                            {row[2] === 1 ? row[2] + ' employee' : row[2] + ' employees'}
                        </td>
                    )
                case 3:
                    transformedRow[3] = <td className={styles.alignLeft}>{formatCost(row[3])}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.departmentsListMain}>
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

            <div className={styles.page}>
                <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
            </div>
        </div>
    )
}
