import React, {useState} from 'react'

//components
import ReactTooltip from 'react-tooltip'

//styling
import {concatStyles as s} from '../../../utilities/mikesConcat'
import styles from './DetailPageTable.module.css'

//utilities
import {cloneDeep} from 'lodash'
import {sortTable} from '../../../utilities/quickSort'

interface ITableProps {
    headers: string[]
    rows: any[][]
    setRows: any
    onRowClick?: (datum: any) => void
    style?: string
    toolTipRows?: any[]
}

export const DetailPageTable = (props: ITableProps) => {
    const {style, headers, rows, setRows, onRowClick} = props
    const isClickable = Boolean(onRowClick)

    // const [rows, setRows] = useState(rows)

    //initialize all the header states and styling to be not sorted
    const headerStates = []
    const headerStateCounts = []

    for (let i = 0; i < headers.length; i++) {
        headerStates.push(styles.descending) //change this to notSorted if you want neutral state to be a line
        headerStateCounts.push(0)
    }

    var initHeaderStateCounts = cloneDeep(headerStateCounts)
    var tempHeaderStates = cloneDeep(headerStates)
    var tempHeaderStateCounts = cloneDeep(headerStateCounts)

    var initHardwareState = {headerStates: headerStates, headerStateCounts: headerStateCounts}
    const [sortState, setSortState] = useState(initHardwareState)

    function sortStates(index: number) {
        if (sortState.headerStateCounts[index] == 0) {
            tempHeaderStates[index] = styles.descending
            tempHeaderStateCounts[index] = 1
            setSortState({
                headerStates: tempHeaderStates,
                headerStateCounts: tempHeaderStateCounts,
            })
            tempHeaderStateCounts = [...initHeaderStateCounts]
        } else if (sortState.headerStateCounts[index] == 1) {
            tempHeaderStates[index] = styles.ascending
            tempHeaderStateCounts[index] = 0
            setSortState({
                headerStates: tempHeaderStates,
                headerStateCounts: tempHeaderStateCounts,
            })
            tempHeaderStateCounts = [...initHeaderStateCounts]
        }
    }

    var renderedHeaders = []
    for (let i = 0; i < headers.length; i++) {
        let header = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, i, sortState.headerStateCounts[i]))
                    sortStates(i)
                }}
                className={styles.header}
            >
                <div className={styles.headerContainer}>
                    {headers[i]}
                    <div className={sortState.headerStates[i]} />
                </div>
            </td>
        )
        renderedHeaders.push(header)
    }

    function deleteSummin(value: any) {
        //nothing for now
    }
    const toolTip = (row: any[], index: number) => {
        return (
            <td className={styles.rowData}>
                <a data-tip={row[row.length - 1]} className={row[row.length - 1] === '' ? '' : styles.rowTitle}>
                    {row[index]}
                </a>
                <ReactTooltip place='bottom' type='light' effect='float' className={styles.tooltip} />
            </td>
        )
    }

    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 1; i < headers.length + 1; i++) {
            if (headers[i - 1] == 'Cost') {
                transformedRow[i] = <td className={styles.rowData}>${row[i]}</td>
            } else if (headers[i - 1] == 'Hardware') {
                transformedRow[i] = toolTip(row, i)
            } else if (headers[i - 1] == 'Monthly Cost') {
                transformedRow[i] = <td className={styles.rowData}>${row[i]} /month</td>
            } else {
                transformedRow[i] = <td className={styles.rowData}>{row[i]}</td>
            }
        }
        renderedRows.push(transformedRow)
    })
    return (
        <table className={s(styles.table, isClickable && styles.clickable)}>
            <thead>
                <tr className={styles.header}>{renderedHeaders.map(header => header)}</tr>
            </thead>

            <tbody>
                {renderedRows.map((row, i) => (
                    <tr
                        className={s(style, styles.tr, isClickable && styles.clickable)}
                        onClick={
                            onRowClick
                                ? e => {
                                      console.log(rows[i][0])
                                  }
                                : undefined
                        }
                    >
                        {row}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
