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
        loginContextVariables: {accessToken, refreshToken, isAdmin},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [useImages, setUseImages] = useState(false)
    const [images, setImages] = useState<{name: string; img: string}[]>([])

    const [displayImages] = useState<{name: string; img: string}[]>([])
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

    useEffect(() => {
        axios
            .get('/list/programs/false')
            .then((data: any) => {
                var programs: any[] = []
                var imgs: any[] = []
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
                    imgs.push({name: i.programName, img: i.icon})
                    //TODO: have someone add this to the endpoint
                    pins.push({name: i.programName, pinned: i.pinned ? true : false})
                })
                setListData(programs)
                setImages(imgs)
                setUseImages(true)
                setPinned(pins)
            })
            .catch((err: any) => console.error(err))
        axios
            .get('list/programs/true')
            .then((data: any) => {
                console.log(data)
                var programs: any[] = []
                var imgs: any[] = []
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
                    imgs.push({name: i.programName, img: i.icon})
                    //TODO: have someone add this to the endpoint
                    pins.push({name: i.programName, pinned: i.pinned ? true : false})
                })
                setArchivedData(programs)
                setImages(imgs)
                setUseImages(true)
            })
            .catch((err: any) => console.error(err))
    }, [])

    //Set display Images
    useEffect(() => {
        images.map((img: any) =>
            checkImages(img).then(data => {
                var list = images.filter(i => i.name !== img.name)
                setImages([...list, data])
                displayImages.push(data)
            })
        )
    }, [useImages])

    //check image
    async function checkImages(img: any) {
        var arr: any[] = []
        await axios
            .get(img.img)
            .then((data: any) => {
                arr.push({name: img.name, img: data === '' ? placeholder : URL + img.img})
            })
            .catch((err: any) => console.error(err))

        return arr[0]
    }

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        if (isArchive) {
            var filteredTableInput = archivedData.filter((row: any) => {
                return !row[selected.value]
                    ? false
                    : row[selected.value]
                          .toString()
                          .toLowerCase()
                          .search(search.toLowerCase()) !== -1
            })
            setFilteredData(filteredTableInput)
        } else {
            var filteredTableInput = listData.filter((row: any) => {
                return !row[selected.value]
                    ? false
                    : row[selected.value]
                          .toString()
                          .toLowerCase()
                          .search(search.toLowerCase()) !== -1
            })
            setFilteredData(filteredTableInput)
        }
    }, [search, selected, listData, isArchive])

    const handleClick = () => {
        history.push('/programs/edit/overview/new')
    }

    const handleRowClick = (row: any) => {
        // go to prog overview
        history.push(`/programs/overview/${row[0]}`)
    }

    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])
    console.log(rows)

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
        //TODO: put to set pinned programs
        //async axios.put().catch((err: any) => console.error(err))
        setCheckboxes(!checkboxes)
    }

    return (
        <div className={styles.programsListMain}>
            <Switch>
                <Route path='/programs/:name' render={props => <div>{props.match.params.name} Detail Page</div>} />
            </Switch>
            {isAdmin ? (
                <Group direction='row' justify='between' className={styles.group}>
                    <div className={styles.buttonContainer}>
                        <Button text='Add' icon='add' onClick={handleClick} />
                        <Button
                            text={isArchive ? 'View Active' : 'View Archives'}
                            onClick={() => setIsArchive(!isArchive)}
                            className={styles.archiveButton}
                        />

                        {checkboxes && !isArchive ? (
                            <Button text='Save Changes' onClick={handlePinChanges} className={styles.dashboardButton} />
                        ) : (
                            <Button
                                text='Pin To Dashboard'
                                onClick={() => setCheckboxes(!checkboxes)}
                                className={styles.dashboardButton}
                            />
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
            ) : (
                <div className={styles.searchContainer}>
                    <FilteredSearch
                        search={search}
                        setSearch={setSearch}
                        options={options}
                        selected={selected}
                        setSelected={setSelected}
                    />
                </div>
            )}

            <div className={styles.page}>
                <Table headers={renderHeaders()} rows={renderedRows} />
            </div>
        </div>
    )
}
