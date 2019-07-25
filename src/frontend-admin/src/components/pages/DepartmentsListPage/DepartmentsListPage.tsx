import React, {useState, useEffect, useContext} from 'react'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'
import {checkImage} from '../../../utilities/CheckImage'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import {History} from 'history'

// Styles
import styles from './DepartmentsListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/department-placeholder.png'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IDepartmentsListPageProps {
    history: History
}
interface IDepartmentData {
    cost: number
    id: number
    name: string
    icon: string
    totalEmployees: number
}
interface IPulledData {
    costOfPrograms: number
    departmentId: number
    departmentName: string
    icon: string
    numOfEmp: number
}

// Primary Component
export const DepartmentsListPage: React.SFC<IDepartmentsListPageProps> = props => {
    const {history} = props
    const {loginContextVariables} = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)

    // state
    const [listData, setListData] = useState<IDepartmentData[]>([])
    const [filteredData, setFilteredData] = useState<IDepartmentData[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Departments', value: 'name'})

    const [archivedData, setArchivedData] = useState<IDepartmentData[]>([])
    const [isArchive, setIsArchive] = useState(false)

    const columns = ['name', 'totalEmployees', 'cost']
    const headerList = ['Departments', 'Total Employees', 'Programs Cost']
    const options = columns.map((c, i) => ({label: headerList[i], value: c}))

    const [useImages, setUseImages] = useState(false)
    const [images, setImages] = useState<{id: number; img: string}[]>([])
    const [displayImages] = useState<{id: number; img: string}[]>([])

    useEffect(() => {
        axios
            .get('/list/departments')
            .then((data: IPulledData[]) => {
                var depts: IDepartmentData[] = []
                var imgs: {id: number; img: string}[] = []
                data.map((i: IPulledData) => {
                    depts.push({
                        name: format(i.departmentName),
                        id: i.departmentId,
                        totalEmployees: i.numOfEmp,
                        cost: i.costOfPrograms,
                        icon: URL + format(i.icon),
                    })
                    imgs.push({id: i.departmentId, img: i.icon})
                })
                setListData(depts)

                setImages(imgs)
                setUseImages(true)
            })
            .catch((err: any) => console.error(err))

        axios
            .get(`/archivedList/department`)
            .then((data: IPulledData[]) => {
                var depts: IDepartmentData[] = []
                data.map((i: IPulledData) =>
                    depts.push({
                        name: format(i.departmentName),
                        id: i.departmentId,
                        totalEmployees: 0,
                        cost: 0,
                        icon: placeholder,
                    })
                )
                setArchivedData(depts)
            })
            .catch((err: any) => console.error(err))
    }, [])

    const formatCost = (cost: number) => {
        return '$' + Math.round((cost / 12) * 100) / 100 + ' /mo | $' + cost + ' /yr'
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
        history.push(`/departments/edit/new`)
    }

    const handleRowClick = (row: any[]) => {
        history.push(`departments/detail/${row[0].key}`)
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
                key={0}
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
                    key={i}
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
            displayImages.filter(x => x.id === row[1]) &&
            displayImages.filter(x => x.id === row[1])[0] ? (
            <td key={row[1]} className={styles.departments}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={displayImages.filter(x => x.id === row[1])[0].img} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={styles.departmentName}>{row[0]}</text>
                </div>
            </td>
        ) : (
            <td key={row[1]} className={styles.departments}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={placeholder} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <div className={styles.departmentName}>{row[0]}</div>
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
                        <td className={styles.alignLeft} key={i}>
                            {row[2] === 1 ? row[2] + ' employee' : row[2] + ' employees'}
                        </td>
                    )
                case 3:
                    transformedRow[3] = (
                        <td className={styles.alignLeft} key={i}>
                            {formatCost(row[3])}
                        </td>
                    )
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.departmentsListMain}>
            <Group direction='row' justify='between' className={styles.group}>
                <div className={styles.buttonContainer}>
                    <Button text='Add' icon='add' onClick={handleClick} />
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

            <div className={styles.page}>
                <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
            </div>
        </div>
    )
}
