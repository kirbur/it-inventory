import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
//import {Table, ITableDatum} from '../../reusables/Table/Table'

// Context
import {LoginContext} from '../../App/App'

import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'

// Styles
import styles from './DepartmentsListPage.module.css'
import {MdFormatColorReset} from 'react-icons/md'

// Types
interface IDepartmentsListPageProps {
    history: any
    match: any
}

// Primary Component
export const DepartmentsListPage: React.SFC<IDepartmentsListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})

    const columns = ['name', 'totalEmployees', 'cost']
    const headers = ['Departments', 'Total Employees', 'Programs Cost']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/departments')
            .then((data: any) => {
                var depts: any[] = []

                console.log(data)
                data.map((i: any) =>
                    depts.push({
                        id: i.departmentId,
                        name: i.departmentName,
                        totalEmployees: i.numOfEmp === 1 ? i.numOfEmp + ' employee' : i.numOfEmp + ' employees',
                        //TODO: verify that this recieves a cost per year
                        cost: formatCost(i.costOfPrograms),
                    })
                )
                setListData(depts)
            })
            .catch((err: any) => console.error(err))
    }, [setListData])

    const formatCost = (cost: number) => {
        return '$' + Math.round((cost / 12) * 100) / 100 + '/mo|$' + cost + '/yr'
    }

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        let filteredTableInput = listData.filter((row: any) => {
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
        history.push(`${match.url}/new`)
    }

    //TODO: verify that table will pass back the id
    const handleRowClick = (id: number) => {
        history.push(`${match.url}/${id}`)
    }

    function concatenateName(data: any) {
        return (
            <td className={styles.departments}>
                <img className={styles.icon} src={icon} />
                <text className={styles.name}>{data.name}</text>
            </td>
        )
    }

    const concatenateTotalEmployees = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>{data.totalEmployees} employees</td>
    }

    const concatenatedCost = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>${data.cost}</td>
    }

    console.log(filteredData)
    const rows: any[] = []
    filteredData.forEach(rowObj => {
        rows.push(Object.values(rowObj).map((val: any) => <td>{val}</td>))
    })
    return (
        <div className={styles.departmentsListMain}>
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
                concatonations={[concatenateName, concatenateTotalEmployees, concatenatedCost]}
                onRowClick={handleRowClick}
            />
        </div>
    )
}
