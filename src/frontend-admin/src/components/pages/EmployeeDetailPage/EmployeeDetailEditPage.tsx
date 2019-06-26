import React, {useState} from 'react'

// Packages
import {cloneDeep} from 'lodash'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {IoIosPersonAdd, IoMdAdd} from 'react-icons/io'
import {FaUserShield, FaUser} from 'react-icons/fa'

// Utils
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailEditPage.module.css'

// Types
interface IEmployeeDetailEditPageProps {
    match: any
    history: any
}

// Helpers

// Primary Component
export const EmployeeDetailEditPage: React.SFC<IEmployeeDetailEditPageProps> = props => {
    const {history, match} = props

    //TODO: get the dept names for the employee dept radio buttons
    var depts = ['Developers', 'Project Managers', 'Designers', 'Sales Reps', 'IT', 'Human Resources']
    var deptsRowOne = []
    var deptsRowTwo = []
    //push them into alternating rows so that rows are equal
    for (let i = 0; i < depts.length; i++) {
        if (i % 2 == 0) {
            deptsRowOne.push(depts[i])
        } else {
            deptsRowTwo.push(depts[i])
        }
    }

    // --------------- rendering rows and headers for the tables ------------ //

    const [rows, setRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12', 0],
        ['Joe Montana', 'Sales', '2012/09/11', 1],
        ['Bob the Builder', 'Developer', '2012/09/13', 154],
        ['Anne Manion', 'PM', '2010/09/12', 16],
        ['Sue Z', 'Designer', '2014/09/12', 15],
    ])

    //this is the only thing to change
    const headerList = ['Employees', 'Date Hired', 'Days Employed', 'Cost']

    //initialize all the header states and styling to be not sorted
    const headerStates = []
    const headerStateCounts = []

    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.notSorted)
        headerStateCounts.push(0)
    }

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

    //returns an array of <td> elements based on the array of strings of headers
    const renderHeaders = () => {
        var headers = []
        headers.push(<td></td>)
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

    function deleteSummin(value: any) {
        console.log(value)
        //remove the row from the array to trigger a re render
    }

    //returns matrix of <td> elements from the provided data
    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length + 1; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = (
                        <td onClick={e => deleteSummin(row[0])}>
                            <div className={styles.delete} />
                            <div className={styles.whiteLine} />
                        </td>
                    )
                case 1:
                    transformedRow[1] = <td className={styles.rowData}>{row[0]} </td>
                case 2:
                    transformedRow[2] = <td className={styles.rowData}>{row[1]}</td>
                case 3:
                    transformedRow[3] = <td className={styles.rowData}>{row[2]}</td>
                case 4:
                    transformedRow[4] = <td className={styles.rowData}>{row[3]}</td>
                case 5:
                    transformedRow[5] = <td>{row[4]}</td>
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
            </div>
            {/* column 2 */}
            <div className={styles.secondColumn}>
                {/* name and date */}
                <div className={s(styles.title, styles.paddingBottom)}>Employee Information</div>

                {/* Admin/nonadmin radio cards */}
                <div className={styles.adminCardContainer}>
                    {/* admin card */}
                    <div className={styles.paddingRight}>
                        <div className={styles.adminCard}>
                            <div className={styles.card}>
                                <input type='radio' name='admin' className={styles.checkmark} />
                                <div className={styles.checkmark} />
                                <div className={styles.insideCheckmarkAdmin} />
                                <div className={styles.title}>Admin User</div>
                                <div className={styles.adminText}>
                                    This user will be able to edit any detail pages and be able to add new hardware,
                                    software, etc.
                                </div>
                            </div>
                            <FaUserShield className={styles.adminIconShield} />
                        </div>
                    </div>
                    {/* non admin card */}
                    <div className={styles.adminCard}>
                        <div className={styles.card}>
                            <input type='radio' name='admin' className={styles.checkmark} />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmarkAdmin} />
                            <div className={styles.title}>Admin User</div>
                            <div className={styles.adminText}>
                                This user will be able to view all content and review the overall company as it grows.
                            </div>
                        </div>
                        <FaUser className={styles.adminIcon} />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.paddingRight}>
                        <div className={styles.paddingBottom}>
                            <div className={styles.text}>First Name</div>
                            <input type='text' className={styles.input} />
                        </div>
                        <div>
                            <div className={styles.text}>Last Name</div>
                            <input type='text' className={styles.input} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.text}>Date Hired</div>
                        <input type='text' className={styles.input} />
                    </div>
                </div>

                <div className={styles.line} />

                {/* Employee Dept radio buttons */}
                <div className={s(styles.title, styles.paddingTop, styles.paddingBottom)}>Employee Department</div>
                {/* TODO: pull list of depts from backend 
                     - make for loop and push every other to different arrays and then
                       put each array in its own column
                */}
                <div className={styles.employeeDepartment}>
                    <div>
                        {deptsRowOne.map(dept => (
                            <div className={styles.container}>
                                <input type='radio' name='employeeDept' className={styles.checkmark} />
                                <div className={styles.checkmark} />
                                <div className={styles.insideCheckmark} />
                                <img src={icon} className={styles.deptIcon} />
                                <div className={styles.deptName}>{dept}</div>
                            </div>
                        ))}
                    </div>
                    <div>
                        {deptsRowTwo.map(dept => (
                            <div className={styles.container}>
                                <input type='radio' name='employeeDept' className={styles.checkmark} />
                                <div className={styles.checkmark} />
                                <div className={styles.insideCheckmark} />
                                <img src={icon} className={styles.deptIcon} />
                                <div className={styles.deptName}>{dept}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.line} />

                {/* Tables */}
                <div className={styles.paddingTop}>
                    <DetailPageTable headers={renderHeaders()} rows={renderedRows} style={styles.newRowThing} />
                </div>
                <div className={styles.addContainer}>
                    <div className={styles.addIconBorder}>
                        <IoMdAdd className={styles.addIcon} />
                    </div>
                    <div className={styles.assignText}>Assign new software</div>
                </div>

                <div className={styles.paddingTop}>
                    <DetailPageTable headers={renderHeaders()} rows={renderedRows} style={styles.newRowThing} />
                </div>
                <div className={styles.addContainer}>
                    <div className={styles.addIconBorder}>
                        <IoMdAdd className={styles.addIcon} />
                    </div>
                    <div className={styles.assignText}>Assign new licenses</div>
                </div>

                <div className={styles.paddingTop}>
                    <DetailPageTable headers={renderHeaders()} rows={renderedRows} style={styles.newRowThing} />
                </div>
                <div className={styles.addContainer}>
                    <div className={styles.addIconBorder}>
                        <IoMdAdd className={styles.addIcon} />
                    </div>
                    <div className={styles.assignText}>Assign new hardware</div>
                </div>

                <div className={styles.submitContainer}>
                    <div className={styles.submitButton}>
                        <div className={styles.submitText}>Submit </div>
                        <IoIosPersonAdd className={styles.personIcon} />
                    </div>
                </div>
            </div>
        </div>
    )
}
