import React, {useState} from 'react'

// Packages
import {cloneDeep} from 'lodash'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'

// Utils
import {sortTable} from '../../../utilities/quickSort'

// Styles
import styles from './EmployeeDetailPage.module.css'

// Types
interface IEmployeeDetailPageProps {
    match: any
    history: any
}

// Helpers

// Primary Component
export const EmployeeDetailPage: React.SFC<IEmployeeDetailPageProps> = props => {
    const {history, match} = props

    const [rows, setRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12', 0, 350],
        ['Joe Montana', 'Sales', '2012/09/11', 1, 200],
        ['Bob the Builder', 'Developer', '2012/09/13', 154, 575],
        ['Anne Manion', 'PM', '2010/09/12', 16, 154],
        ['Sue Z', 'Designer', '2014/09/12', 15, 764],
    ])

    //this is the only thing to change
    const headerList = ['Employees', 'Date Hired', 'Days Employed', 'Cost']

    //-------------- this will all be the same -------------
    const headerStates = []
    const headerStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.notSorted)
        headerStateCounts.push(0)
    }
    var initHeaderStates = cloneDeep(headerStates)
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
            switch (i) {
                case 0:
                    transformedRow[0] = <td className={styles.rowData}>{row[0]} </td>
                case 1:
                    transformedRow[1] = <td className={styles.rowData}>{row[1]}</td>
                case 2:
                    transformedRow[2] = <td className={styles.rowData}>{row[2]}</td>
                case 3:
                    transformedRow[3] = <td className={styles.rowData}>{row[3]}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.columns}>
            {/* column 1 */}
            <div className={styles.firstColumn}>
                <div className={styles.imgPadding}>
                    <img className={styles.img} src={icon} />
                </div>
                <div className={styles.costText}>
                    <p>Software ---------------- $200 /month</p>
                    <p>Hardware --------------- $300</p>
                </div>
            </div>
            {/* column 2 */}
            <div className={styles.secondColumn}>
                <div className={styles.titleText}>
                    <div className={styles.employeeName}>Employee's Name</div>
                    <div className={styles.employeeText}>their position</div>
                    <div className={styles.employeeText}>some dates</div>
                </div>
                <DetailPageTable headers={renderHeaders()} rows={renderedRows} /> <br />
                <DetailPageTable headers={renderHeaders()} rows={renderedRows} />
                <br />
                <DetailPageTable headers={renderHeaders()} rows={renderedRows} />
                <br />
            </div>
        </div>
    )
}
