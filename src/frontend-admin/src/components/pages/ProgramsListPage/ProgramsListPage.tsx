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
import styles from './ProgramsListPage.module.css'

// Types
interface IProgramsListPageProps {
    history: any
    match: any
}

// Primary Component
export const ProgramsListPage: React.SFC<IProgramsListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState(listData)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Programs', value: 'name'})

    const columns = ['name', 'renewalDate', 'totalUsers', 'cost']
    const headers = ['Programs', 'Renewal Date', 'Total Users ', 'Cost']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/programs')
            .then((data: any) => {
                var programs: any[] = []
                data.map((i: any) =>
                    programs.push({
                        name: i.programName,
                        renewalDate: i.renewalDate,
                        totalUsers: i.countProgInUse, //TODO: ask where this is
                        //TODO: figure out which cost is necessary
                        cost: i.progCostPerYear,
                        perYear: i.progCostPerYear,
                        perUse: i.progCostPerUse,
                        isPerYear: i.isCostPerYear,
                    })
                )
                setListData(programs)
            })
            .catch((err: any) => console.error(err))
    }, [setListData])

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
        history.push('/programs/new')
    }

    const handleRowClick = (name: string) => {
        history.push(`/programs/${name}`)
    }
    function concatenateName(data: any) {
        return (
            <td className={styles.programs}>
                <img className={styles.icon} src={icon} />
                <text className={styles.name}>{data.name}</text>
            </td>
        )
    }

    const concatenateRenewalDate = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>{data.renewalDate}</td>
    }

    const concatenateTotalUsers = (data: any) => {
        return <td className={styles.alignLeftAndPadding}>{data.totalUsers} users</td>
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
        <div className={styles.programsListMain}>
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

            {/* <Table
                headers={headers}
                propData={filteredData}
                dataKeys={columns}
                concatonations={[concatenateName, concatenateRenewalDate, concatenateTotalUsers, concatenatedCost]}
                onRowClick={handleRowClick}
            /> */}
        </div>
    )
}
