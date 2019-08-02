import React, {useState, useEffect, useContext} from 'react'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {format} from '../../../utilities/formatEmptyStrings'
import {checkImage} from '../../../utilities/CheckImage'
import {searchFilter} from '../../../utilities/SearchFilter'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import {History} from 'history'

// Context
import {LoginContext, ThemeContext} from '../../App/App'

// Styles
import styles from './HardwareListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/monitor-placeholder.png'

// Types
interface IMonitorsListPageProps {
    history: History
}
interface IMonitorData {
    make: string
    id: number
    screenSize: number
    resolution: number
    assigned: string
    inputs: string
    icon: string
    model: string
}
interface IPulledData {
    make: string
    monitorId: number
    screenSize: number
    resolution: number
    employeeFirstName: string
    employeeLastName: string
    inputs: string
    icon: string
    model: string
}

// Primary Component
export const MonitorsListPage: React.SFC<IMonitorsListPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)
    const { isDarkMode } = useContext(ThemeContext)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [archivedData, setArchivedData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'make', value: 'make'})

    const columns = ['makeModel', 'screenSize', 'resolution', 'inputs', 'assigned', 'model']
    const searchByHeaders = ['Make', 'Screen Size', 'Resolution', 'Inputs', 'Assigned To', 'Model']
    const headerList = ['Make & Model', 'Screen Size', 'Resolution', 'Inputs', 'Assigned To']
    const options = columns.map((c, i) => ({label: searchByHeaders[i], value: c}))
    const [isArchive, setIsArchive] = useState(false)

    const [displayImages, setDisplayImages] = useState<{id: number; img: string}[]>([])

    async function getData() {
        var imagePromises: any[] = []
        await axios
            .get('/list/monitors')
            .then((data: IPulledData[]) => {
                const monitors: IMonitorData[] = []
                var imgs: {id: number; img: string}[] = []
                data.map((i: IPulledData) => {
                    monitors.push({
                        make: format(i.make),
                        id: i.monitorId,
                        screenSize: i.screenSize,
                        resolution: i.resolution,
                        inputs: format(i.inputs),
                        assigned: format(i.employeeFirstName) + ' ' + i.employeeLastName,
                        icon: i.icon,
                        model: format(i.model),
                    })

                    imagePromises.push(
                        checkImage(i.icon, axios, placeholder).then(image => {
                            return {id: i.monitorId, img: image}
                        })
                    )
                })
                setListData(monitors)
            })
            .catch((err: any) => console.error(err))

        await Promise.all(imagePromises)
            .then(response => setDisplayImages(response))
            .catch((err: any) => console.error(err))

        await axios
            .get('/archivedList/monitor')
            .then((data: IPulledData[]) => {
                const monitors: IMonitorData[] = []
                data.map((i: IPulledData) => {
                    monitors.push({
                        make: format(i.make),
                        id: i.monitorId,
                        screenSize: i.screenSize,
                        resolution: i.resolution,
                        inputs: format(i.inputs),
                        assigned: format(i.employeeFirstName) + ' ' + i.employeeLastName,
                        icon: i.icon,
                        model: format(i.model),
                    })
                })
                setArchivedData(monitors)
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
        history.push({pathname: '/hardware/edit/monitor/new', state: {prev: history.location}})
    }

    const handleRowClick = (row: any) => {
        history.push({pathname: `hardware/detail/monitor/${row[0].key}`, state: {prev: history.location}})
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

    function concatenatedName(row: any[]) {
        var image = placeholder
        for (let i = 0; i < displayImages.length; i++) {
            if (displayImages[i].id === row[1]) {
                image = displayImages[i].img
            }
        }
        return image ? (
            <td key={row[1]} className={styles.hardware}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={image} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={s(styles.hardwareName, isDarkMode ? styles.dark : {})}>{row[0]}</text> <br />
                    <text className={styles.alignLeft}>{row[7]}</text>
                </div>
            </td>
        ) : (
            <td key={row[1]} className={styles.hardware}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={placeholder} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={s(styles.hardwareName, isDarkMode ? styles.dark : {})}>{row[0]}</text> <br />
                    <text className={styles.alignLeft}>{row[7]}</text>
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
                case 2:
                    transformedRow[2] = <td className={styles.alignLeft}>{row[2]} in</td>
                case 3:
                    transformedRow[3] = <td className={styles.alignLeft}>{row[3]}k</td>
                case 4:
                    transformedRow[4] = <td className={styles.alignLeft}>{row[4]}</td>

                case 5:
                    transformedRow[5] = <td className={styles.alignLeft}>{row[5]}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.listMain}>
            <Group direction='row' justify='between' className={styles.group}>
                <div className={styles.buttonContainer}>
                    {isAdmin && <Button text='Add' icon='add' onClick={handleClick} />}
                    <Button
                        text={isArchive ? 'View Active' : 'View Archives'}
                        onClick={() => setIsArchive(!isArchive)}
                        className={styles.archiveButton}
                    />
                </div>

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>
            <div className={styles.table}>
                <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
            </div>
        </div>
    )
}
