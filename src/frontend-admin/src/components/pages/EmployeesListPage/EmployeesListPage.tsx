import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './EmployeesListPage.module.css'

// Types
interface IEmployeesListPageProps {
    history: any
    match: any
}

// Primary Component
export const EmployeesListPage: React.SFC<IEmployeesListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})

    const columns = ['name', 'role', 'dateHired', 'daysEmployed', 'cost']
    const headers = ['Employees', 'Role', 'Date Hired', 'Days Employed', 'Cost']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/employees')
            .then((data: any) => {
                const employees: any[] = []
                data.map((i: any) =>
                    employees.push({
                        name: i.employeeName,
                        role: i.role,
                        dateHired: formatDate(i.hireDate),
                        daysEmployed: calculateDaysEmployed(i.hireDate),
                        cost: formatCost(i.hardwareCostForEmp, i.programCostForEmp),
                    })
                )
                setListData(employees)
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        var filteredTableInput = listData.filter((row: any) => {
            return (
                row[selected.value]
                    .toString()
                    .toLowerCase()
                    .search(search.toLowerCase()) !== -1
            )
        })
        setFilteredData(filteredTableInput)
    }, [search, selected, listData])

    const formatDate = (hireDate: string) => {
        const hired = new Date(hireDate)
        const date = hired.getFullYear() + '/' + hired.getMonth() + '/' + hired.getDate()
        return date
    }

    //does not account for leap years or variable # of days in a month
    const calculateDaysEmployed = (hireDate: string) => {
        var oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
        const today = new Date()
        const hired = new Date(hireDate)
        const dif = Math.round(Math.abs(today.getTime() - hired.getTime()))

        var days = Math.floor(dif / oneDay)
        var months = Math.floor(days / 31)
        var years = Math.floor(months / 12)

        months = Math.floor(months % 12)
        days = Math.floor(days % 31)

        var ret: string = ''
        ret += years !== 0 ? (years === 1 ? years + ' year, ' : years + ' years, ') : ''
        ret += months !== 0 ? (months === 1 ? months + ' month, ' : months + ' months, ') : ''
        ret += days === 1 ? days + ' day' : days + ' days'
        return ret
    }

    const formatCost = (hwCpost: number, progCost: number) => {
        return 'HW:$' + hwCpost + '|SW:$' + progCost //TODO: SW or PROG? or something else??
    }

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (id: number) => {
        history.push(`${match.url}/${id}`)
    }

    function concatenateName(data: any) {
        return (
            <td className={styles.employees}>
                <img className={styles.icon} src={icon} />
                <div className={styles.alignLeft}>
                    <text className={styles.employeeName}>{data.name}</text> <br />
                    <text className={styles.role}>{data.role}</text>
                </div>
            </td>
        )
    }

    const concatenateDateHired = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>{data.dateHired}</td>
    }

    const concatenateDaysEmployed = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>{data.daysEmployed} days</td>
    }

    const concatenatedHWCost = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>${data.hardwareCost}</td>
    }
    const concatenatedProgCost = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>${data.programsCost}</td>
    }

    console.log(filteredData)
    const rows: any[] = []
    filteredData.forEach(rowObj => {
        rows.push(Object.values(rowObj).map((val: any) => <td>{val}</td>))
    })

    return (
        <div className={styles.employeesListMain}>
            <Group direction='row' justify='between'>
                <Button text='Add' icon='add' onClick={handleClick} />

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>

            <Table
                headers={headers}
                propData={rows}
                dataKeys={columns}
                concatonations={[
                    concatenateName,
                    concatenateDateHired,
                    concatenateDaysEmployed,
                    concatenatedHWCost,
                    concatenatedProgCost,
                ]}
            />
        </div>
    )
}
