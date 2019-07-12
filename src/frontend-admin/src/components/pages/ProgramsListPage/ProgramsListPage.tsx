import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {Route, Switch} from 'react-router-dom'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatDate} from '../../../utilities/FormatDate'
import {formatCost} from '../../../utilities/FormatCost'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './ProgramsListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/program-placeholder.png'

// Types
interface IProgramsListPageProps {
    history: any
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

    const [displayImages, setDisplayImages] = useState<{name: string; img: string}[]>([])
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
                var imgs: any[] = []
                data.map((i: any) => {
                    programs.push({
                        name: format(i.programName),
                        renewalDate: formatDate(i.renewalDate),
                        totalUsers: format(i.countProgInUse),
                        perYear: i.progCostPerYear,
                        perUse: i.progCostPerUse,
                        isPerYear: i.isCostPerYear,
                        icon: i.icon,
                        cost: formatCost(i.isCostPerYear, i.progCostPerYear, i.progCostPerUse), //used for searching, not displayed
                    })
                    imgs.push({name: i.programName, img: i.icon})
                })
                setListData(programs)
                setImages(imgs)
                setUseImages(true)
            })
            .catch((err: any) => console.error(err))
    }, [setListData])

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
        history.push('/editProgramOverview/new')
    }

    const handleRowClick = (row: any) => {
        // go to prog overview
        history.push(`/programs/overview/${row[0].key}`)
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
            <td key={row[0]} className={styles.programs}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={displayImages.filter(x => x.name === row[0])[0].img} alt={''} />
                </div>

                <div className={styles.alignLeft}>
                    <div className={styles.programName}>{row[0]}</div>
                </div>
            </td>
        ) : (
            <td key={row[0]} className={styles.programs}>
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

    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = concatenatedDept(row)
                    break
                case 1:
                    transformedRow[1] = (
                        <td key={i + row[1]} className={styles.alignLeft}>
                            {row[1]}
                        </td>
                    )
                    break
                case 2:
                    transformedRow[2] = (
                        <td key={i + row[2]} className={styles.alignLeft}>
                            {row[2] === 1 ? row[2] + ' user' : row[2] + ' users'}
                        </td>
                    )
                    break
                case 3:
                    transformedRow[3] = (
                        <td key={i + row[3]} className={styles.alignLeft}>
                            {formatCost(row[5], row[3], row[4])}
                        </td>
                    )
                    break
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.programsListMain}>
            <Switch>
                <Route path='/programs/:name' render={props => <div>{props.match.params.name} Detail Page</div>} />
            </Switch>
            {isAdmin ? (
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
                <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
            </div>
        </div>
    )
}
