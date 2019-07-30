import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {Route, Switch} from 'react-router-dom'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatDate} from '../../../utilities/FormatDate'
import {formatCost} from '../../../utilities/FormatCost'
import {History} from 'history'
import {checkImage} from '../../../utilities/CheckImage'
import {searchFilter} from '../../../utilities/SearchFilter'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import {Checkbox} from '../../reusables/Checkbox/Checkbox'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './ProgramsListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/program-placeholder.png'

// Types
interface IProgramsListPageProps {
    history: History
}

// Primary Component
export const ProgramsListPage: React.SFC<IProgramsListPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)

    // state
    const [displayImages, setDisplayImages] = useState<{name: string; img: string}[]>([])

    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState(listData)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Programs', value: 'name'})

    const [archivedData, setArchivedData] = useState<any[]>([])
    const [isArchive, setIsArchive] = useState(false)

    const columns = ['name', 'renewalDate', 'totalUsers', 'cost']
    const headerList = ['Programs', 'Renewal Date', 'Total Users ', 'Cost']
    const options = columns.map((c, i) => ({label: headerList[i], value: c}))

    const [checkboxes, setCheckboxes] = useState(false)
    const [pinned, setPinned] = useState<{name: string; pinned: boolean}[]>([])

    async function getData() {
        await axios
            .get('/list/programs/false')
            .then((data: any) => {
                var programs: any[] = []
                var imgs: {name: string; img: string}[] = []
                var pins: {name: string; pinned: boolean}[] = []
                data.map((i: any) => {
                    programs.push({
                        name: format(i.programName),
                        renewalDate: formatDate(i.renewalDate),
                        totalUsers: i.countProgInUse,
                        perYear: i.progCostPerYear,
                        perUse: i.progCostPerUse,
                        isPerYear: i.isCostPerYear,
                        icon: i.icon,
                        cost: formatCost(i.isCostPerYear, i.progCostPerYear, i.progCostPerUse), //used for searching, not displayed
                    })
                    checkImage(i.icon, axios, placeholder).then(image => {
                        imgs.push({name: i.programName, img: image})
                    })
                    pins.push({name: i.programName, pinned: i.isPinned})
                })
                setListData(programs)
                setDisplayImages(imgs)
                setPinned(pins)
            })
            .catch((err: any) => console.error(err))
        await axios
            .get('list/programs/true')
            .then((data: any) => {
                var programs: any[] = []
                var pins: {name: string; pinned: boolean}[] = []
                data.map((i: any) => {
                    programs.push({
                        name: format(i.programName),
                        renewalDate: formatDate(i.renewalDate),
                        totalUsers: 0,
                        perYear: 0,
                        perUse: 0,
                        isPerYear: i.isCostPerYear,
                        icon: placeholder,
                        cost: formatCost(i.isCostPerYear, i.progCostPerYear, i.progCostPerUse), //used for searching, not displayed
                    })
                    pins.push({name: i.programName, pinned: i.pinned ? true : false})
                })
                setArchivedData(programs)
            })
            .catch((err: any) => console.error(err))
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        setFilteredData(searchFilter(isArchive ? archivedData : listData, selected.value, search))
    }, [search, selected, listData, archivedData, isArchive])

    const handleClick = () => {
        history.push({pathname: `/programs/edit/overview/new/inventory`, state: {prev: history.location}})
    }

    const handleRowClick = (row: any) => {
        // go to prog overview
        history.push({
            pathname: `/programs/overview/${row[0]}/${isArchive ? 'archived' : 'inventory'}`,
            state: {prev: history.location},
        })
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

        //Check Box Row
        if (checkboxes) {
            let header = <td key={'checkbox'}></td>

            headers.push(header)
        }

        var firstHeader = (
            <td
                key={0}
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
                        key={headerList[i]}
                        onClick={e => {
                            setRows(sortTable(rows, 3, sortState.headerStateCounts[i]))
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
                        key={headerList[i]}
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
        return displayImages &&
            displayImages.filter(x => x.name === row[0]) &&
            displayImages.filter(x => x.name === row[0])[0] ? (
            <td key={row[0]} className={styles.programs} onClick={() => handleRowClick(row)}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={displayImages.filter(x => x.name === row[0])[0].img} alt={''} />
                </div>

                <div className={styles.alignLeft}>
                    <div className={styles.programName}>{row[0]}</div>
                </div>
            </td>
        ) : (
            <td key={row[0]} className={styles.programs} onClick={() => handleRowClick(row)}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={placeholder} alt={''} />
                </div>

                <div className={styles.alignLeft}>
                    <div className={styles.programName}>{row[0]}</div>
                </div>
            </td>
        )
    }

    var renderedRows: any[] = []

    const getChecked = (name: string) => {
        var p = pinned.filter(pin => pin.name === name)
        return p && p[0] ? p[0].pinned : false
    }

    const handleChecked = (name: string) => {
        var p = pinned.filter(pin => pin.name === name)
        var otherPins = pinned.filter(pin => pin.name !== name)
        setPinned([...otherPins, {name: name, pinned: p && p[0] ? !p[0].pinned : false}])
    }

    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            if (checkboxes && i === 0) {
                transformedRow.push(
                    <td key={i + row[4]} className={styles.checkboxRow}>
                        <Checkbox checked={getChecked(row[0])} onClick={() => handleChecked(row[0])} />
                    </td>
                )
            }
            switch (i) {
                case 0:
                    transformedRow.push(concatenatedDept(row))
                    break
                case 1:
                    transformedRow.push(
                        <td key={i + row[1]} className={styles.alignLeft} onClick={() => handleRowClick(row)}>
                            {row[1]}
                        </td>
                    )
                    break
                case 2:
                    transformedRow.push(
                        <td className={styles.alignLeft} onClick={() => handleRowClick(row)}>
                            {row[2] === 1 ? row[2] + ' user' : row[2] + ' users'}
                        </td>
                    )
                    break
                case 3:
                    transformedRow.push(
                        <td key={i + row[3]} className={styles.alignLeft} onClick={() => handleRowClick(row)}>
                            {formatCost(row[5], row[3], row[4])}
                        </td>
                    )
                    break
            }
        }

        renderedRows.push(transformedRow)
    })

    async function handlePinChanges() {
        var pins: string[] = []
        pinned.forEach(pin => {
            if (pin.pinned) {
                pins.push(pin.name)
            }
        })

        await axios.put('/update/programPins', pins).catch((err: any) => console.error(err))
        setCheckboxes(!checkboxes)
    }

    return (
        <div className={styles.programsListMain}>
            <Switch>
                <Route path='/programs/:name' render={props => <div>{props.match.params.name} Detail Page</div>} />
            </Switch>

            <Group direction='row' justify='between' className={styles.group}>
                <div className={styles.buttonContainer}>
                    {isAdmin && <Button text='Add' icon='add' onClick={handleClick} className={styles.addButton} />}
                    <Button
                        text={isArchive ? 'View Active' : 'View Archives'}
                        onClick={() => {
                            setIsArchive(!isArchive)
                            setCheckboxes(false)
                        }}
                        className={styles.archiveButton}
                    />

                    {!isArchive && checkboxes && isAdmin ? (
                        <Button text='Save Changes' onClick={handlePinChanges} className={styles.dashboardButton} />
                    ) : (
                        !isArchive &&
                        isAdmin && (
                            <Button
                                text='Pin To Dashboard'
                                onClick={() => setCheckboxes(!checkboxes)}
                                className={styles.dashboardButton}
                            />
                        )
                    )}
                </div>
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
