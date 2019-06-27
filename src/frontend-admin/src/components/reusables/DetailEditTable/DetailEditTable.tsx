import React, {useState} from 'react'

import {concatStyles as s} from '../../../utilities/mikesConcat'
import styles from './DetailPageTable.module.css'

import {cloneDeep} from 'lodash'

import {sortTable} from '../../../utilities/quickSort'

interface ITableProps {
    headers: string[]
    rows: any[][]
    setRows: any
    onRowClick?: (datum: any) => void
    style?: string
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
    //returns an array of <td> elements based on the array of strings of headers
    // const renderHardwareHeaders = () => {
    var renderedHeaders = []
    renderedHeaders.push(<td></td>)
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

    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []

        transformedRow[0] = (
            <td onClick={e => deleteSummin(row[0])}>
                <div className={styles.delete} />
                <div className={styles.whiteLine} />
            </td>
        )
        for (let i = 1; i < headers.length + 1; i++) {
            if (headers[i - 1] == 'Cost') {
                transformedRow[i] = <td className={styles.rowData}>${row[i]}</td>
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
                {renderedRows.map(row => (
                    <tr
                        className={s(style, styles.tr, isClickable && styles.clickable)}
                        onClick={
                            onRowClick
                                ? e => {
                                      onRowClick(row)
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
