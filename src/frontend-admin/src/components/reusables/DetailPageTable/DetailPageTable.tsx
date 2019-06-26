import React from 'react'

import {concatStyles as s} from '../../../utilities/mikesConcat'
import styles from './DetailPageTable.module.css'

interface ITableProps {
    headers: any[]
    rows: any[][]
    onRowClick?: (datum: any) => void
}

export const DetailPageTable = (props: ITableProps) => {
    const {headers, rows, onRowClick} = props
    const isClickable = Boolean(onRowClick)

    return (
        <table className={s(styles.table, isClickable && styles.clickable)}>
            <thead>
                <tr className={styles.header}>{headers.map(header => header)}</tr>
            </thead>

            <tbody>
                {rows.map(row => (
                    <tr
                        className={s(styles.tr, isClickable && styles.clickable)}
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
