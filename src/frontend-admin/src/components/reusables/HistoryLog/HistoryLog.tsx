import React from 'react'

import styles from './HistoryLog.module.css'
import {formatDate} from '../../../utilities/FormatDate'

type eventType = 'Assigned' | 'Unassigned' | 'Bought' | 'Broken' | 'Repaired' | 'Archived' | 'Recovered'

interface IHistoryLogArray {
    eventDate: string
    eventType: eventType
    employeeName: string
    historyId?: number
    canEdit?: boolean
}

interface IHistoryLogProps {
    historyLog: IHistoryLogArray[]
    remove?: any
}

// Primary Component
export const HistoryLog = (props: IHistoryLogProps) => {
    const {historyLog, remove} = props

    //todo: post data automatically when assigning something to an employee

    //check to see if the history log length is defined
    //if undefined, will just return empty table body
    if (undefined !== historyLog && historyLog.length) {
        var rows: any[] = []
        for (let i = 0; i < historyLog.length; i++) {
            let tempElement = <div />

            if (historyLog[i].eventType === 'Assigned') {
                tempElement = <div className={styles.description}>{' Assigned to ' + historyLog[i].employeeName}</div>
            } else if (historyLog[i].eventType === 'Unassigned') {
                tempElement = (
                    <div className={styles.description}>{'Unassigned from ' + historyLog[i].employeeName}</div>
                )
            } else if (historyLog[i].eventType === 'Bought') {
                tempElement = <div className={styles.description}>{'Purchased'}</div>
            } else if (historyLog[i].eventType === 'Archived') {
                tempElement = <div className={styles.description}>{'Archived'}</div>
            } else if (historyLog[i].eventType === 'Broken') {
                tempElement = (
                    <div className={styles.description}>
                        {'Broken under the care of ' + historyLog[i].employeeName} <br />
                        <div className={styles.delete} onClick={e => remove(i)} />
                        <div className={styles.whiteLine} />
                    </div>
                )
            } else if (historyLog[i].eventType === 'Repaired') {
                tempElement = (
                    <div className={styles.description}>
                        {'Repaired'} <br />
                        <div className={styles.delete} onClick={e => remove(i)} />
                        <div className={styles.whiteLine} />
                    </div>
                )
            } else if (historyLog[i].eventType === 'Recovered') {
                tempElement = <div className={styles.description}>{'Recovered'}</div>
            }
            rows.push(
                <div className={styles.rowData}>
                    <div className={styles.date}>{formatDate(historyLog[i].eventDate) + ' | '} </div>
                    {tempElement}
                </div>
            )
        }

        return (
            <table className={styles.table}>
                <thead>
                    <tr className={styles.header}>
                        <td>History List</td>
                    </tr>
                </thead>

                <tbody>
                    {rows.map(row => (
                        <tr>{row}</tr>
                    ))}
                </tbody>
            </table>
        )
    } else {
        return (
            <table className={styles.table}>
                <thead>
                    <tr className={styles.header}>
                        <td>History List</td>
                    </tr>
                </thead>
            </table>
        )
    }
}
