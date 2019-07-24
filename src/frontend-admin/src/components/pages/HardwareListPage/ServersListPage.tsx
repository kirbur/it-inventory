import React, {useState, useEffect, useContext} from 'react'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatDate} from '../../../utilities/FormatDate'
import {checkImage} from '../../../utilities/CheckImage'
import {searchFilter} from '../../../utilities/SearchFilter'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import {History} from 'history'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './HardwareListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/server-placeholder.png'

// Types
interface IServersListPageProps {
    history: History
}
interface IServerData {
    make: string
    id: number
    numberOfCores: number
    RAM: number
    renewalDate: string
    MFGTag: string
    icon: string
    model: string
}
interface IPulledData {
    make: string
    serverId: number
    numberOfCores: number
    ram: number
    renewalDate: string
    mfg: string
    icon: string
    model: string
}

// Primary Component
export const ServersListPage: React.SFC<IServersListPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [archivedData, setArchivedData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'make', value: 'make'})

    const columns = ['make', 'numberOfCores', 'RAM', 'renewalDate', 'MFGTag', 'model']
    const searchByHeaders = ['Make', 'Number of Cores', 'RAM', 'Renewal Date', 'MFG Tag', 'Model']
    const headerList = ['Make & Model', 'Number of Cores', 'RAM', 'Renewal Date', 'MFG Tag']
    const options = columns.map((c, i) => ({label: searchByHeaders[i], value: c}))
    const [isArchive, setIsArchive] = useState(false)

    const [useImages, setUseImages] = useState(false)
    const [images, setImages] = useState<{id: number; img: string}[]>([])
    const [displayImages] = useState<{id: number; img: string}[]>([])

    useEffect(() => {
        axios
            .get('/list/servers')
            .then((data: IPulledData[]) => {
                const servers: IServerData[] = []
                var imgs: {id: number; img: string}[] = []
                data.map((i: IPulledData) => {
                    servers.push({
                        make: format(i.make),
                        id: i.serverId,
                        numberOfCores: i.numberOfCores,
                        RAM: i.ram,
                        renewalDate: formatDate(i.renewalDate),
                        MFGTag: format(i.mfg),
                        icon: i.icon,
                        model: format(i.model),
                    })
                    imgs.push({id: i.serverId, img: i.icon})
                })

                setListData(servers)

                setImages(imgs)
                setUseImages(true)
            })
            .catch((err: any) => console.error(err))
        axios
            .get('/archivedList/server')
            .then((data: IPulledData[]) => {
                const servers: IServerData[] = []
                data.map((i: IPulledData) => {
                    servers.push({
                        make: format(i.make),
                        id: i.serverId,
                        numberOfCores: i.numberOfCores,
                        RAM: i.ram,
                        renewalDate: formatDate(i.renewalDate),
                        MFGTag: format(i.mfg),
                        icon: i.icon,
                        model: format(i.model),
                    })
                })
                setArchivedData(servers)
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(() => {
        setFilteredData(searchFilter(isArchive ? archivedData : listData, selected.value, search))
    }, [search, selected, listData, archivedData, isArchive])

    //Set display Images
    useEffect(() => {
        images.map((img: {id: number; img: string}) =>
            checkImage(img.img, axios, placeholder).then(data => {
                var list = images.filter(i => i.id !== img.id)
                setImages([...list, {id: img.id, img: data}])
                displayImages.push({id: img.id, img: data})
            })
        )
    }, [useImages])

    const handleClick = () => {
        history.push({pathname: `hardware/edit/server/new`, state: {prev: history.location}})
    }

    const handleRowClick = (row: any) => {
        history.push({pathname: `hardware/detail/server/${row[0].key}`, state: {prev: history.location}})
    }

    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])

    const headerStates = []
    const headerStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.descending)
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
        return displayImages &&
            displayImages.filter(x => x.id === row[1]) &&
            displayImages.filter(x => x.id === row[1])[0] ? (
            <td key={row[1]} className={styles.hardware}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={displayImages.filter(x => x.id === row[1])[0].img} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={styles.hardwareName}>{row[0]}</text> <br />
                    <text className={styles.alignLeft}>{row[7]}</text>
                </div>
            </td>
        ) : (
            <td key={row[1]} className={styles.hardware}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={placeholder} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={styles.hardwareName}>{row[0]}</text> <br />
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
                    transformedRow[1] = <td className={styles.alignLeft}>{row[2]}</td>
                case 3:
                    transformedRow[2] = <td className={styles.alignLeft}>{row[3]}</td>
                case 4:
                    transformedRow[3] = <td className={styles.alignLeft}>{row[4]}</td>
                case 5:
                    transformedRow[4] = <td className={styles.alignLeft}>{row[5]}</td>
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
