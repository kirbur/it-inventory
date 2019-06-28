import React from 'react'

//components
import {HistoryLog} from '../../reusables/HistoryLog/HistoryLog'

// Styles
import styles from './DepartmentDetailPage.module.css'
//import styles from './DepartmentDetailPage.module.css';

// Types
interface IDepartmentDetailPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const DepartmentDetailPage: React.SFC<IDepartmentDetailPageProps> = props => {
    const {history, match} = props

    return (
        <div className={styles.div}>
            <HistoryLog
                historyLog={[
                    {date: '2019', event: 'Assigned', user: 'Kyle'},
                    {date: '2019', event: 'Broken', user: 'Kyle'},
                    {date: '2019', event: 'Repaired', user: 'Kyle'},
                    {date: '2019', event: 'Broken', user: 'Kyle'},
                    {date: '2019', event: 'Repaired', user: 'Kyle'},
                    {date: '2019', event: 'Broken', user: 'Kyle'},
                    {date: '2019', event: 'Repaired', user: 'Kyle'},
                    {date: '2019', event: 'Broken', user: 'Kyle'},
                    {date: '2019', event: 'Repaired', user: 'Kyle'},
                    {date: '2019', event: 'Unassigned', user: 'Kyle'},
                ]}
            />
        </div>
    )
}
