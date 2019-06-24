import React, {useState, useEffect, useContext} from 'react'
import {Switch, Route} from 'react-router-dom'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

import {sortTable} from '../../../utilities/quicksort'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import icon from '../../../content/Images/CQL-favicon.png'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './HardwareListPage.module.css'

// Types
interface IServersListPageProps {
    history: any
}

// Helpers

// Primary Component
export const ServersListPage: React.SFC<IServersListPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'FQDN', value: 'FQDN'})

    const columns = ['FQDN', 'numberOfCores', 'RAM', 'renewalDate', 'MFGTag']
    const headers = ['FQDN', 'Number of Cores', 'RAM', 'Renewal Date', 'MFG Tag']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    useEffect(() => {
        axios
            .get('/list/servers')
            .then((data: any) => {
                const servers: any[] = []
                data.map((i: any) => {
                    servers.push({
                        id: i.serverId,
                        FQDN: i.fqdn,
                        numberOfCores: i.numberOfCores,
                        RAM: i.ram,
                        renewalDate: i.renewalDate,
                        MFGTag: i.mfg,
                    })
                })
                setListData(servers)
            })
            .catch((err: any) => console.error(err))
    }, [])

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
        history.push(`hardware/item/new`)
    }

    const handleRowClick = (id: number) => {
        history.push(`hardware/item/${id}`)
    }

    return (
        <div className={styles.listMain}>
            <Group direction='row' justify='between' className={styles.group}>
                <Button text='Add' icon='add' onClick={handleClick} />

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>

            {/* <Table headers={renderHeaders()} rows={renderedRows} /> */}
        </div>
    )
}
