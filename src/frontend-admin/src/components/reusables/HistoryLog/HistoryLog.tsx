import React from 'react'

import styles from './HistoryLog.module.css'

interface IHistoryLogArray {
    date: string
    event: string //Assigned | Unassigned | Bought | Broke | Repaired | Obsolete
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
        if (historyLog[i].event === 'Assigned') {
            rows.push(historyLog[i].date + ' | Assigned to ' + historyLog[i].user)
        } else if (historyLog[i].event === 'Unassigned') {
            rows.push(historyLog[i].date + ' | Unassigned from ' + historyLog[i].user)
        } else if (historyLog[i].event === 'Bought') {
            rows.push(historyLog[i].date + ' | Purchased and left unassigned')
        } else if (historyLog[i].event === 'Obsolete') {
            rows.push(historyLog[i].date + ' | Rendered obsolete')
        } else if (historyLog[i].event === 'Broken') {
            rows.push(historyLog[i].date + ' | Broken under the care of ' + historyLog[i].user)
        } else if (historyLog[i].event === 'Repaired') {
            rows.push(historyLog[i].date + ' | ' + historyLog[i].event)
        }
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
                    <tr className={styles.rowData}>{row}</tr>
                ))}
            </tbody>
        </table>
    )
}
