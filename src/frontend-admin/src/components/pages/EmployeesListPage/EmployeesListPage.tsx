import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {History} from 'history'
import {checkImage} from '../../../utilities/CheckImage'
import {searchFilter} from '../../../utilities/SearchFilter'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'

// Context
import {LoginContext, ThemeContext} from '../../App/App'

// Styles
import styles from './EmployeesListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/employee-placeholder.png'

// Types
interface IEmployeesListPageProps {
    history: History
}
interface IEmployeeData {
    name: string
    dateHired: string
    cost: string
    hwCost: number
    swCost: number
    role: string
    icon: string
    id: number
    hardware: string
    programs: string
    daysEmployed: number | string
}
interface IPulledData {
    firstName?: string
    lastName?: string
    employeeName: string
    archiveDate: string
    hireDate: string
    hardwareCostForEmp: number
    programCostForEmp: number
    role: string
    photo: string
    employeeId: number
    hardwareList: []
    progForEmp: []
}

// Primary Component
export const EmployeesListPage: React.SFC<IEmployeesListPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)
    const { isDarkMode } = useContext(ThemeContext)

    // state
    const [listData, setListData] = useState<IEmployeeData[]>([])
    const [filteredData, setFilteredData] = useState<IEmployeeData[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Employees', value: 'name'})

    const [archivedData, setArchivedData] = useState<IEmployeeData[]>([])
    const [isArchive, setIsArchive] = useState(false)

    const columns = ['name', 'role', 'dateHired', 'daysEmployed', 'cost', 'hardware', 'programs']
    var headers = ['Employees', 'Role', 'Date Hired', 'Days Employed', 'Cost', 'Hardware', 'Programs']
    var headerList: string[] = []
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    const [displayImages, setDisplayImages] = useState<{id: number; img: string}[]>([])

    async function getData() {
        await axios
            .get('/list/employees')
            .then((data: IPulledData[]) => {
                let employees: IEmployeeData[] = []
                var imgs: {id: number; img: string}[] = []
                data.map((i: IPulledData) => {
                    employees.push({
                        name: format(i.employeeName),
                        dateHired: i.hireDate,
                        cost: formatCost(i.hardwareCostForEmp, i.programCostForEmp),
                        hwCost: i.hardwareCostForEmp,
                        swCost: i.programCostForEmp,
                        role: format(i.role),
                        icon: format(i.photo),
                        id: i.employeeId,

                        //for searching
                        hardware: i.hardwareList ? i.hardwareList.join(', ') : '',
                        programs: i.progForEmp ? i.progForEmp.join(', ') : '',
                        daysEmployed: getDays(i.hireDate),
                    })
                    checkImage(i.photo, axios, placeholder).then(image => {
                        imgs.push({id: i.employeeId, img: image})
                    })
                })
                setListData(employees)

                setDisplayImages(imgs)
            })
            .catch((err: any) => console.error(err))

        await axios
            .get('/archivedList/employee')
            .then((data: IPulledData[]) => {
                let employees: any[] = []
                data.map((i: IPulledData) => {
                    employees.push({
                        name: format(i.firstName + ' ' + i.lastName),
                        dateHired: formatDate(i.hireDate),
                        daysEmployed: calculateDaysEmployed(getDays(i.hireDate, i.archiveDate)),
                        space: 0,
                        space4: 0,
                        role: format(i.role),
                        icon: format(i.photo),
                        id: i.employeeId,
                        space1: 0,

                        space2: 0,
                        dateArchived: formatDate(i.archiveDate),
                    })
                })
                setArchivedData(employees)
            })
            .catch((err: any) => console.error(err))

        if (isArchive) {
            headers = ['Employees', 'Role', 'Date Hired', 'Date Archived', 'Days Employed']
        }
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        setFilteredData(searchFilter(isArchive ? archivedData : listData, selected.value, search))
    }, [search, selected, listData, archivedData, isArchive])

    const formatCost = (hwCpost: number, progCost: number) => {
        return 'HW: $' + hwCpost + ' | SW: $' + progCost + ' /mo'
    }

    const handleClick = () => {
        history.push({pathname: `/employees/edit/new`, state: {prev: history.location}})
    }

    const handleRowClick = (row: any) => {
        history.push({pathname: `/employees/detail/${row[0].key}`, state: {prev: history.location}})
    }

    //changes it from array of objects to matrix

    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])

    headerList = isArchive
        ? (headerList = ['Employees', 'Date Hired', 'Date Archived', 'Days Employed'])
        : ['Employees', 'Date Hired', 'Days Employed', 'Cost']

    //-------------- this will all be the same -------------
    const headerStates = [] //styling for arrow sort state
    const headerStateCounts = [] //1 or 0 for ascending or descending sort state

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
            //already descending or neutral
            tempHeaderStates[index] = styles.descending
            tempHeaderStateCounts[index] = 1
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        } else if (sortState.headerStateCounts[index] === 1) {
            //already ascending
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
                key={headerList[0]}
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
                i === 2 ? (
                    <td
                        key={headerList[i]}
                        onClick={e => {
                            setRows(sortTable(rows, i + 8, sortState.headerStateCounts[i]))
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

    function concatenatedName(row: any[]) {
        return displayImages &&
            displayImages.filter(x => x.id === row[7]) &&
            displayImages.filter(x => x.id === row[7])[0] ? (
            <td key={row[7]} className={styles.employees}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={displayImages.filter(x => x.id === row[7])[0].img} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={s(styles.employeeName, isDarkMode ? styles.employeeNameDark : {})}>{row[0]}</text> <br />
                    <text className={styles.role}>{row[5]}</text>
                </div>
            </td>
        ) : (
            <td key={row[7]} className={styles.employees}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={placeholder} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <text className={styles.employeeName}>{row[0]}</text> <br />
                    <text className={styles.role}>{row[5]}</text>
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
                    break
                case 1:
                    transformedRow[1] = (
                        <td key={row[7] + row[1]} className={styles.alignLeft}>
                            {formatDate(row[1])}
                        </td>
                    )
                    break
                case 2:
                    transformedRow[2] = (
                        <td key={row[7] + row[10]} className={styles.alignLeft}>
                            {isArchive ? row[10] : calculateDaysEmployed(row[10])}
                        </td>
                    )
                    break
                case 3:
                    transformedRow[3] = (
                        <td key={row[7] + row[2]} className={styles.alignLeft}>
                            {row[2]}
                        </td>
                    )
                    break
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={s(styles.employeesListMain, isDarkMode ? styles.employeesListMainDark : {})}>
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

            <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
        </div>
    )
}
