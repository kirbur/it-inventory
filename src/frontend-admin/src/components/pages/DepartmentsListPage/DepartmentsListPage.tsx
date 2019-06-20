import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
//import {Table, ITableDatum} from '../../reusables/Table/Table'

// Context
import {LoginContext} from '../../App/App'

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
        </div>
    )
}
