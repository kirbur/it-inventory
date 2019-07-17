import React, {useState} from 'react'

//components
import ReactTooltip from 'react-tooltip'
import {MdInfoOutline} from 'react-icons/md'
import {Button} from '../Button/Button'

//styling
import {concatStyles as s} from '../../../utilities/mikesConcat'
import styles from './DetailPageTable.module.css'

//utilities
import {cloneDeep} from 'lodash'
import {sortTable} from '../../../utilities/quickSort'

export interface ITableItem {
    value: string | number
    id?: string | number
    sortBy: string | number
    onClick?: any
    tooltip?: string
}

interface ITableProps {
    headers: string[]
    rows: ITableItem[][]
    setRows: any
    className?: string
    style?: string
    edit?: boolean
    remove?: any
    sort?: boolean
    editRows?: any
    hover?: boolean
}

export const DetailPageTable = (props: ITableProps) => {
    const {
        style,
        headers,
        rows,
        setRows,
        edit = false,
        remove,
        sort = true,
        editRows,
        hover = true,
        className = '',
    } = props

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
    edit && renderedHeaders.push(<td className={styles.editRow}></td>)
    for (let i = 0; i < headers.length; i++) {
        let header = sort ? (
            <td
                key={headers[i]}
                onClick={e => {
                    setRows(sortTable(rows, i, sortState.headerStateCounts[i]))
                    sortStates(i)
                }}
                className={s(styles.header, styles.clickCursor)}
            >
                <div className={styles.headerContainer}>
                    {headers[i]}
                    <div className={sortState.headerStates[i]} />
                </div>
            </td>
        ) : (
            <td key={headers[i]} className={styles.header}>
                <div className={styles.headerContainer}>{headers[i]}</div>
            </td>
        )

        renderedHeaders.push(header)
    }

    editRows && renderedHeaders.push(<td className={styles.editRow}></td>)

    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []
        var start = 0
        if (edit) {
            start = 1
            transformedRow[0] = (
                <td onClick={e => remove(row)} className={styles.editRow}>
                    <div className={styles.delete} />
                    <div className={styles.whiteLine} />
                </td>
            )
        }
        for (let i = 0; i < headers.length; i++) {
            var click = row[i].onClick ? styles.clickable : ''
            transformedRow[i + start] = row[i].tooltip ? (
                <td
                    key={JSON.stringify(row) + headers[i]}
                    className={s(styles.rowData, row[0].onClick && styles.clickCursor, click)}
                    onClick={() => row[i].onClick && row[0].id && row[i].onClick(row[i].id)}
                >
                    <a data-tip={row[i].tooltip}>
                        {row[i].value}
                        <MdInfoOutline size={15} />
                    </a>
                    <ReactTooltip place='bottom' type='light' effect='float' className={styles.tooltip} />
                </td>
            ) : (
                <td
                    key={JSON.stringify(row) + headers[i]}
                    className={s(styles.rowData, row[i].onClick && styles.clickCursor, click)}
                    onClick={() => row[i].onClick && row[0].id && row[i].onClick(row[i].id)}
                >
                    {rows[0] && row[i].value}
                </td>
            )
        }

        if (editRows !== undefined) {
            transformedRow[headers.length + 1] = (
                <td className={styles.editRow}>
                    <Button text={'Edit'} className={styles.editButton} onClick={() => editRows(row)} />
                </td>
            )
        }
        renderedRows.push(transformedRow)
    })
    return (
        <table className={s(styles.table, className)}>
            <thead>
                <tr className={styles.header}>{renderedHeaders.map(header => header)}</tr>
            </thead>

            <tbody>
                {renderedRows.map((row, i) => (
                    <tr className={s(style, styles.tr, hover ? styles.hover : '')}>{row}</tr>
                ))}
            </tbody>
        </table>
    )
}
