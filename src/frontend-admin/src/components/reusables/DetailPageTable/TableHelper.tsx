import React, {useState} from 'react'

// Packages
import {cloneDeep} from 'lodash'

// Components
import {DetailPageTable} from './DetailPageTable'

// Utils
import {sortTable} from '../../../utilities/quickSort'

// Styles
import styles from './DetailPageTable.module.css'

// Types
interface ITableHelperProps {
    headerList: any[]
    data: any[]
    renderedRows: any[]
}

// Primary Component
export const TableHelper: React.SFC<ITableHelperProps> = props => {
    const {headerList, data} = props

    const [rows, setRows] = useState<any[]>([...data])

    const headerStates = []
    const headerStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.notSorted)
        headerStateCounts.push(0)
    }
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

        for (let i = 0; i < headerList.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setRows(sortTable(rows, i, sortState.headerStateCounts[i]))
                        sortStates(i)
                    }}
                    className={styles.header}
                >
                    <div className={styles.headerContainer}>
                        {headerList[i]}
                        <div className={sortState.headerStates[i]} />
                    </div>
                </td>
            )
            headers.push(header)
        }

        return headers
    }

    var renderedRows: any[] = []

    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            transformedRow[i] = <td className={styles.rowData}>{row[i]} </td>
        }
        renderedRows.push(transformedRow)
    })

    return <DetailPageTable headers={renderHeaders()} rows={renderedRows} />
}
