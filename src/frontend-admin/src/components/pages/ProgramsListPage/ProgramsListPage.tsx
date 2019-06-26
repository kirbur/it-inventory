import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {Route, Switch} from 'react-router-dom'
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
import styles from './ProgramsListPage.module.css'

// Types
interface IProgramsListPageProps {
    history: any
    match: any
}

// Primary Component
export const ProgramsListPage: React.SFC<IProgramsListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState(listData)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Programs', value: 'name'})

    const columns = ['name', 'renewalDate', 'totalUsers', 'cost']
    const headerList = ['Programs', 'Renewal Date', 'Total Users ', 'Cost']
    const options = columns.map((c, i) => ({label: headerList[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/programs')
            .then((data: any) => {
                var programs: any[] = []
                data.map((i: any) =>
                    programs.push({
                        name: format(i.programName),
                        renewalDate: format(i.renewalDate),
                        totalUsers: format(i.countProgInUse),
                        perYear: i.progCostPerYear,
                        perUse: i.progCostPerUse,
                        isPerYear: i.isCostPerYear,
                        icon: format(i.icon),
                        cost: formatCost(i.isCostPerYear, i.progCostPerYear, i.progCostPerUse), //used for searching, not displayed
                    })
                )
                setListData(programs)
            })
            .catch((err: any) => console.error(err))
    }, [setListData])

    const formatCost = (isPerYear: boolean, perYear: number, perUse: number) => {
        return isPerYear ? '$' + perYear + ' /yr' : perYear === 0 ? '$' + perUse + ' paid' : '$' + perYear + ' /mo'
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
        history.push('/programs/new')
    }

    const handleRowClick = (row: any) => {
        // go to prog overview
        history.push(`/programs/${row[0].props.children[1].props.children.props.children}`)
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
            let header =
                i === 3 ? (
                    <td
                        onClick={e => {
                            setRows(sortTable(rows, 4, sortState.headerStateCounts[i]))
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

    function concatenatedDept(row: any[]) {
        return (
            <td className={styles.programs}>
                <img className={styles.icon} src={URL + row[6]} alt="Program Picture" />
                <div className={styles.alignLeft}>
                    <div className={styles.programName}>{row[0]}</div>
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
                    transformedRow[2] = (
                        <td className={styles.alignLeft}>{row[2] === 1 ? row[2] + ' user' : row[2] + ' users'}</td>
                    )
                case 3:
                    transformedRow[3] = <td className={styles.alignLeft}>{formatCost(row[5], row[3], row[4])}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.programsListMain}>
            <Switch>
                <Route path='/programs/:name' render={props => <div>{props.match.params.name} Detail Page</div>} />
            </Switch>
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
