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

// Types
interface IDepartmentsListPageProps {
    history: any
    match: any
}

//TODO: remove this
interface ITableDatum {
    departments: string
    totalEmployees: number
    programCost: number
}

//TODO: replace any w/ real type
const initListData: ITableDatum[] = [{departments: '', totalEmployees: 0, programCost: 0}]
const initColumns: string[] = []
const initOptions: {value: string; label: string}[] = []

// Primary Component
export const DepartmentsListPage: React.SFC<IDepartmentsListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState(initListData)
    const [columns, setColumns] = useState(initColumns)
    const [options, setOptions] = useState(initOptions)
    const [filtered, setFiltered] = useState(listData) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'name', value: 'name'})

    useEffect(() => {
        let list: ITableDatum[] = []
        axios
            .get('/list/departments')
            .then((data: any) =>
                data.map((i: any) =>
                    list.push({
                        departments: i.departmentName,
                        totalEmployees: i.numberOfEmp,
                        programCost: i.costOfPrograms,
                    })
                )
            )
            .catch((err: any) => console.log(err))
        setListData(list)
    }, [setListData])

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        let filteredTableInput = listData
        filteredTableInput = listData.filter((row: any) => {
            return row[selected.value]
                ? row[selected.value]
                      .toString()
                      .toLowerCase()
                      .search(search.toLowerCase()) !== -1
                : false
        })
        setFiltered(filteredTableInput)
        listData[0] && setColumns(Object.keys(listData[0]))
    }, [search, selected, listData])

    useEffect(() => {
        initOptions.length = 0
        columns.map(i => {
            initOptions.push({value: i, label: i.replace(/([a-zA-Z])(?=[A-Z])/g, '$1 ').toLowerCase()})
        })
        setOptions(initOptions)
        console.log(columns)
    }, [columns])

    const handleClick = () => {
        history.push(`${match.url}/new`)
    }

    const handleRowClick = (id: number) => {
        history.push(`${match.url}/${id}`)
    }
    const {} = props
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
            {/*<List />*/}

            <Table
                headers={['Departments', 'Total Employees', 'Cost']}
                propData={[
                    {name: 'Developers', totalEmployees: 0, cost: 350},
                    {name: 'Designers', totalEmployees: 1, cost: 200},
                    {name: 'Project Managers', totalEmployees: 154, cost: 575},
                    {name: 'Sales', role: 'PM', totalEmployees: 16, cost: 154},
                    {name: 'Information Technology', totalEmployees: 15, cost: 764},
                ]}
                dataKeys={['name', 'totalEmployees', 'cost']}
                concatonations={[concatenateName, concatenateTotalEmployees, concatenatedCost]}
            />
        </div>
    )
}
