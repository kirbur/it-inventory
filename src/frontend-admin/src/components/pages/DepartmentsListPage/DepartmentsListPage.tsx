import React, {useState, useEffect, useContext} from 'react'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'
import {checkImage} from '../../../utilities/CheckImage'
import {searchFilter} from '../../../utilities/SearchFilter'

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
import {LoginContext, ThemeContext} from '../../App/App'

// Types
interface IDepartmentsListPageProps {
    history: History
}
interface IDepartmentData {
    cost: number
    id: number
    name: string
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
    const {
        loginContextVariables,
        loginContextVariables: {isAdmin},
    } = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)
    const {isDarkMode} = useContext(ThemeContext)

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

    const [displayImages, setDisplayImages] = useState<{id: number; img: string}[]>([])

    async function getData() {
        var imagePromises: any[] = []
        await axios
            .get('/list/departments')
            .then((data: IPulledData[]) => {
                var depts: IDepartmentData[] = []
                data.forEach((i: IPulledData) => {
                    depts.push({
                        name: format(i.departmentName),
                        id: i.departmentId,
                        totalEmployees: i.numOfEmp,
                        cost: i.costOfPrograms,
                    })

                    imagePromises.push(
                        checkImage(i.icon, axios, placeholder).then(image => {
                            return {id: i.departmentId, img: image}
                        })
                    )
                })
                setListData(depts)
            })
            .catch((err: any) => console.error(err))

        await Promise.all(imagePromises)
            .then(response => setDisplayImages(response))
            .catch((err: any) => console.error(err))

        await axios
            .get(`/archivedList/department`)
            .then((data: IPulledData[]) => {
                var depts: IDepartmentData[] = []
                data.map((i: IPulledData) =>
                    depts.push({
                        name: format(i.departmentName),
                        id: i.departmentId,
                        totalEmployees: 0,
                        cost: 0,
                    })
                )
                setArchivedData(depts)
            })
            .catch((err: any) => console.error(err))
    }

    useEffect(() => {
        getData()
    }, [])

    const formatCost = (cost: number) => {
        return '$' + Math.round((cost / 12) * 100) / 100 + ' /mo | $' + cost + ' /yr'
    }

    useEffect(() => {
        setFilteredData(searchFilter(isArchive ? archivedData : listData, selected.value, search))
    }, [search, selected, listData, archivedData, isArchive])

    const handleClick = () => {
        history.push({pathname: `/departments/edit/new`, state: {prev: history.location}})
    }

    const handleRowClick = (row: any[]) => {
        history.push({pathname: `departments/detail/${row[0].key}`, state: {prev: history.location}})
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
        var image = placeholder
        for (let i = 0; i < displayImages.length; i++) {
            if (displayImages[i].id === row[1]) {
                image = displayImages[i].img
            }
        }
        return image ? (
            <td key={row[1]} className={styles.departments}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={image} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={s(styles.departmentName, isDarkMode ? styles.dark : {})}>{row[0]}</text>
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
                    break
                case 2:
                    transformedRow[2] = (
                        <td className={styles.alignLeft} key={i}>
                            {row[2] === 1 ? row[2] + ' employee' : row[2] + ' employees'}
                        </td>
                    )
                    break
                case 3:
                    transformedRow[3] = (
                        <td className={styles.alignLeft} key={i}>
                            {formatCost(row[3])}
                        </td>
                    )
                    break
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={s(styles.departmentsListMain, isDarkMode ? styles.listMainDark : {})}>
            <Group direction='row' justify='between' className={styles.group}>
                <div className={styles.buttonContainer}>
                    {isAdmin && <Button text='Add' icon='add' onClick={handleClick} className={styles.addButton} />}
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
