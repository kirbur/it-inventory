import React, {useState} from 'react'

//components
import ReactTooltip from 'react-tooltip'
import {MdInfoOutline} from 'react-icons/md'

//styling
import {concatStyles as s} from '../../../utilities/mikesConcat'
import styles from './DetailPageTable.module.css'

//utilities
import {cloneDeep} from 'lodash'
import {sortTable} from '../../../utilities/quickSort'

interface ITableItem {
    value: string
    id?: string | number
    sortBy: string | number
    onClick?: any
    tooltip?: string
}

interface ITableProps {
    headers: string[]
    rows: ITableItem[][]
    setRows: any
    // onRowClick?: (datum: any) => void
    style?: string
    edit?: boolean
    remove?: any
    className?: string
}

export const DetailPageTable = (props: ITableProps) => {
    const {style, headers, rows, setRows, edit = false, remove, className = ''} = props

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
        if (sortState.headerStateCounts[index] === 0) {
            tempHeaderStates[index] = styles.descending
            tempHeaderStateCounts[index] = 1
            setSortState({
                headerStates: tempHeaderStates,
                headerStateCounts: tempHeaderStateCounts,
            })
            tempHeaderStateCounts = [...initHeaderStateCounts]
        } else if (sortState.headerStateCounts[index] === 1) {
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
    edit && renderedHeaders.push(<td className={styles.deleteRow}></td>)
    for (let i = 0; i < headers.length; i++) {
        let header = (
            <td
                onClick={e => {
                    setRows(sortTable(rows.slice(), i, sortState.headerStateCounts[i]))
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

    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []
        var start = 0
        if (edit) {
            start = 1
            transformedRow[0] = (
                <td onClick={e => remove(row)} className={styles.deleteRow}>
                    <div className={styles.delete} />
                    <div className={styles.whiteLine} />
                </td>
            )
        }
        for (let i = 0; i < headers.length; i++) {
            var click = row[i] && row[i].onClick ? styles.clickable : ''
            transformedRow[i + start] = row[i].tooltip ? (
                <td
                    className={s(styles.rowData, click)}
                    onClick={() => row[i].onClick && row[0].id && row[i].onClick(row[i].id)}
                >
                    <a data-tip={row[i].tooltip} className={row[i].tooltip === '' ? '' : styles.rowTitle}>
                        {row[i].value}
                        <MdInfoOutline size={15} />
                    </a>
                    <ReactTooltip place='bottom' type='light' effect='float' className={styles.tooltip} />
                </td>
            ) : (
                <td
                    className={s(styles.rowData, click)}
                    onClick={() => row[i].onClick && row[0].id && row[i].onClick(row[i].id)}
                >
                    {rows[0] && row[i].value}
                </td>
            )
        }
        renderedRows.push(transformedRow)
    })
    return (
        <table className={s(styles.table, /*isClickable &&*/ styles.clickable, className)}>
            <thead>
                <tr className={styles.header}>{renderedHeaders.map(header => header)}</tr>
            </thead>

            <tbody>
                {renderedRows.map((row, i) => (
                    <tr className={s(style, styles.tr, /* isClickable &&*/ styles.clickable)}>{row}</tr>
                ))}
            </tbody>
        </table>
    )
}
