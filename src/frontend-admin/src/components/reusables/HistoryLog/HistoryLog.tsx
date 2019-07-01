import React from 'react'

import styles from './HistoryLog.module.css'

type eventType = 'Assigned' | 'Unassigned' | 'Bought' | 'Broken' | 'Repaired' | 'Obsolete'

interface IHistoryLogArray {
    date: string
    event: eventType
    user: string
}

interface IHistoryLogProps {
    historyLog: IHistoryLogArray[]
}

// Primary Component
export const HistoryLog = (props: IHistoryLogProps) => {
    const {historyLog} = props

    //todo: post data automatically when assigning something to an employee

    var rows: any[] = []

    for (let i = 0; i < historyLog.length; i++) {
        let tempElement = <div />

        if (historyLog[i].event === 'Assigned') {
            tempElement = <div className={styles.description}>{' Assigned to ' + historyLog[i].user}</div>
        } else if (historyLog[i].event === 'Unassigned') {
            tempElement = <div className={styles.description}>{'Unassigned from ' + historyLog[i].user}</div>
        } else if (historyLog[i].event === 'Bought') {
            tempElement = <div className={styles.description}>{'Purchased'}</div>
        } else if (historyLog[i].event === 'Obsolete') {
            tempElement = <div className={styles.description}>{'Rendered obsolete'}</div>
        } else if (historyLog[i].event === 'Broken') {
            tempElement = <div className={styles.description}>{'Broken under the care of ' + historyLog[i].user}</div>
        } else if (historyLog[i].event === 'Repaired') {
            tempElement = <div className={styles.description}>{'Repaired'}</div>
        }
        rows.push(
            <div className={styles.rowData}>
                <div className={styles.date}>{historyLog[i].date + ' | '} </div>
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
}
