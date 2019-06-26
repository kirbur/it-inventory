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

    function deleteSummin(value: any) {
        console.log(value)
        //remove the row from the array to trigger a re render
    }

    // --------------- rendering rows and headers for the hardware table ------------ //

    const [hardwareRows, setHardwareRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12', 0],
        ['Joe Montana', 'Sales', '2012/09/11', 1],
        ['Bob the Builder', 'Developer', '2012/09/13', 154],
        ['Anne Manion', 'PM', '2010/09/12', 16],
        ['Sue Z', 'Designer', '2014/09/12', 15],
    ])

    //this is the only thing to change
    const hardwareHeadersList = ['Hardware', 'Serial No.', 'Warranty', 'Year']

    //initialize all the header states and styling to be not sorted
    const hardwareHeaderStates = []
    const hardwareHeaderStateCounts = []

    for (let i = 0; i < hardwareHeadersList.length; i++) {
        hardwareHeaderStates.push(styles.notSorted)
        hardwareHeaderStateCounts.push(0)
    }

    var initHardwareHeaderStateCounts = cloneDeep(hardwareHeaderStateCounts)
    var tempHardwareHeaderStates = cloneDeep(hardwareHeaderStates)
    var tempHardwareHeaderStateCounts = cloneDeep(hardwareHeaderStateCounts)

    var initHardwareState = {hardwareHeaderStates, hardwareHeaderStateCounts}
    const [hardwareSortState, setHardwareSortState] = useState(initHardwareState)

    function sortHardwareStates(index: number) {
        if (hardwareSortState.hardwareHeaderStateCounts[index] == 0) {
            tempHardwareHeaderStates[index] = styles.descending
            tempHardwareHeaderStateCounts[index] = 1
            setHardwareSortState({
                hardwareHeaderStates: tempHardwareHeaderStates,
                hardwareHeaderStateCounts: tempHardwareHeaderStateCounts,
            })
            tempHardwareHeaderStateCounts = [...initHardwareHeaderStateCounts]
        } else if (hardwareSortState.hardwareHeaderStateCounts[index] == 1) {
            tempHardwareHeaderStates[index] = styles.ascending
            tempHardwareHeaderStateCounts[index] = 0
            setHardwareSortState({
                hardwareHeaderStates: tempHardwareHeaderStates,
                hardwareHeaderStateCounts: tempHardwareHeaderStateCounts,
            })
            tempHardwareHeaderStateCounts = [...initHardwareHeaderStateCounts]
        }
    }

    //returns an array of <td> elements based on the array of strings of headers
    const renderHardwareHeaders = () => {
        var hardwareHeaders = []
        hardwareHeaders.push(<td></td>)
        for (let i = 0; i < hardwareHeadersList.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setHardwareRows(sortTable(hardwareRows, i, hardwareSortState.hardwareHeaderStateCounts[i]))
                        sortHardwareStates(i)
                    }}
                    className={styles.header}
                >
                    <div className={styles.headerContainer}>
                        {hardwareHeadersList[i]}
                        <div className={hardwareSortState.hardwareHeaderStates[i]} />
                    </div>
                </td>
            )
            hardwareHeaders.push(header)
        }
        return hardwareHeaders
    }

    //returns matrix of <td> elements from the provided data
    var renderedHardwareRows: any[] = []
    hardwareRows.forEach(row => {
        const transformedHardwareRow: any[] = []
        for (let i = 0; i < row.length + 1; i++) {
            switch (i) {
                case 0:
                    transformedHardwareRow[0] = (
                        <td onClick={e => deleteSummin(row[0])}>
                            <div className={styles.delete} />
                            <div className={styles.whiteLine} />
                        </td>
                    )
                case 1:
                    transformedHardwareRow[1] = <td className={styles.rowData}>{row[0]} </td>
                case 2:
                    transformedHardwareRow[2] = <td className={styles.rowData}>{row[1]}</td>
                case 3:
                    transformedHardwareRow[3] = <td className={styles.rowData}>{row[2]}</td>
                case 4:
                    transformedHardwareRow[4] = <td className={styles.rowData}>{row[3]}</td>
                case 5:
                    transformedHardwareRow[5] = <td>{row[4]}</td>
            }
        }
        renderedHardwareRows.push(transformedHardwareRow)
    })
    // ---------------------------------------------------------------------- //

    // --------------- rendering rows and headers for the software table ------------ //

    const [softwareRows, setSoftwareRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12', 0],
        ['Joe Montana', 'Sales', '2012/09/11', 1],
        ['Bob the Builder', 'Developer', '2012/09/13', 154],
        ['Anne Manion', 'PM', '2010/09/12', 16],
        ['Sue Z', 'Designer', '2014/09/12', 15],
    ])

    //this is the only thing to change
    const softwareHeadersList = ['Software', 'Key/Username', 'Cost']

    //initialize all the header states and styling to be not sorted
    const softwareHeaderStates = []
    const softwareHeaderStateCounts = []

    for (let i = 0; i < softwareHeadersList.length; i++) {
        softwareHeaderStates.push(styles.notSorted)
        softwareHeaderStateCounts.push(0)
    }

    var initSoftwareHeaderStateCounts = cloneDeep(softwareHeaderStateCounts)
    var tempSoftwareHeaderStates = cloneDeep(softwareHeaderStates)
    var tempSoftwareHeaderStateCounts = cloneDeep(softwareHeaderStateCounts)

    var initSoftwareState = {
        softwareHeaderStates: softwareHeaderStates,
        softwareHeaderStateCounts: softwareHeaderStateCounts,
    }
    const [softwareSortState, setSoftwareSortState] = useState(initSoftwareState)

    function sortSoftwareStates(index: number) {
        if (softwareSortState.softwareHeaderStateCounts[index] == 0) {
            tempSoftwareHeaderStates[index] = styles.descending
            tempSoftwareHeaderStateCounts[index] = 1
            setSoftwareSortState({
                softwareHeaderStates: tempSoftwareHeaderStates,
                softwareHeaderStateCounts: tempSoftwareHeaderStateCounts,
            })
            tempSoftwareHeaderStateCounts = [...initSoftwareHeaderStateCounts]
        } else if (softwareSortState.softwareHeaderStateCounts[index] == 1) {
            tempSoftwareHeaderStates[index] = styles.ascending
            tempSoftwareHeaderStateCounts[index] = 0
            setSoftwareSortState({
                softwareHeaderStates: tempSoftwareHeaderStates,
                softwareHeaderStateCounts: tempSoftwareHeaderStateCounts,
            })
            tempSoftwareHeaderStateCounts = [...initSoftwareHeaderStateCounts]
        }
    }

    //returns an array of <td> elements based on the array of strings of headers
    const renderSoftwareHeaders = () => {
        var softwareHeaders = []
        softwareHeaders.push(<td></td>)
        for (let i = 0; i < softwareHeadersList.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setSoftwareRows(sortTable(softwareRows, i, softwareSortState.softwareHeaderStateCounts[i]))
                        sortSoftwareStates(i)
                    }}
                    className={styles.header}
                >
                    <div className={styles.headerContainer}>
                        {softwareHeadersList[i]}
                        <div className={softwareSortState.softwareHeaderStates[i]} />
                    </div>
                </td>
            )
            softwareHeaders.push(header)
        }
        return softwareHeaders
    }

    //returns matrix of <td> elements from the provided data
    var renderedSoftwareRows: any[] = []
    softwareRows.forEach(row => {
        const transformedSoftwareRow: any[] = []
        for (let i = 0; i < row.length + 1; i++) {
            switch (i) {
                case 0:
                    transformedSoftwareRow[0] = (
                        <td onClick={e => deleteSummin(row[0])}>
                            <div className={styles.delete} />
                            <div className={styles.whiteLine} />
                        </td>
                    )
                case 1:
                    transformedSoftwareRow[1] = <td className={styles.rowData}>{row[0]} </td>
                case 2:
                    transformedSoftwareRow[2] = <td className={styles.rowData}>{row[1]}</td>
                case 3:
                    transformedSoftwareRow[3] = <td className={styles.rowData}>${row[2]}</td>
            }
        }
        renderedSoftwareRows.push(transformedSoftwareRow)
    })
    // ---------------------------------------------------------------------- //

    // --------------- rendering rows and headers for the license table ------------ //

    const [licenseRows, setLicenseRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12', 0],
        ['Joe Montana', 'Sales', '2012/09/11', 1],
        ['Bob the Builder', 'Developer', '2012/09/13', 154],
        ['Anne Manion', 'PM', '2010/09/12', 16],
        ['Sue Z', 'Designer', '2014/09/12', 15],
    ])

    //this is the only thing to change
    const licenseHeadersList = ['License', 'CALs', 'Cost']

    //initialize all the header states and styling to be not sorted
    const licenseHeaderStates = []
    const licenseHeaderStateCounts = []

    for (let i = 0; i < licenseHeadersList.length; i++) {
        licenseHeaderStates.push(styles.notSorted)
        licenseHeaderStateCounts.push(0)
    }

    var initLicenseHeaderStateCounts = cloneDeep(licenseHeaderStateCounts)
    var tempLicenseHeaderStates = cloneDeep(licenseHeaderStates)
    var tempLicenseHeaderStateCounts = cloneDeep(licenseHeaderStateCounts)

    var initLicenseState = {
        licenseHeaderStates: licenseHeaderStates,
        licenseHeaderStateCounts: licenseHeaderStateCounts,
    }
    const [licenseSortState, setLicenseSortState] = useState(initLicenseState)

    function sortLicenseStates(index: number) {
        if (licenseSortState.licenseHeaderStateCounts[index] == 0) {
            tempLicenseHeaderStates[index] = styles.descending
            tempLicenseHeaderStateCounts[index] = 1
            setLicenseSortState({
                licenseHeaderStates: tempLicenseHeaderStates,
                licenseHeaderStateCounts: tempLicenseHeaderStateCounts,
            })
            tempLicenseHeaderStateCounts = [...initLicenseHeaderStateCounts]
        } else if (licenseSortState.licenseHeaderStateCounts[index] == 1) {
            tempLicenseHeaderStates[index] = styles.ascending
            tempLicenseHeaderStateCounts[index] = 0
            setLicenseSortState({
                licenseHeaderStates: tempLicenseHeaderStates,
                licenseHeaderStateCounts: tempLicenseHeaderStateCounts,
            })
            tempLicenseHeaderStateCounts = [...initLicenseHeaderStateCounts]
        }
    }

    //returns an array of <td> elements based on the array of strings of headers
    const renderLicenseHeaders = () => {
        var licenseHeaders = []
        licenseHeaders.push(<td></td>)
        for (let i = 0; i < licenseHeadersList.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setLicenseRows(sortTable(licenseRows, i, licenseSortState.licenseHeaderStateCounts[i]))
                        sortLicenseStates(i)
                    }}
                    className={styles.header}
                >
                    <div className={styles.headerContainer}>
                        {licenseHeadersList[i]}
                        <div className={licenseSortState.licenseHeaderStates[i]} />
                    </div>
                </td>
            )
            licenseHeaders.push(header)
        }
        return licenseHeaders
    }

    //returns matrix of <td> elements from the provided data
    var renderedLicenseRows: any[] = []
    licenseRows.forEach(row => {
        const transformedLicenseRow: any[] = []
        for (let i = 0; i < row.length + 1; i++) {
            switch (i) {
                case 0:
                    transformedLicenseRow[0] = (
                        <td onClick={e => deleteSummin(row[0])}>
                            <div className={styles.delete} />
                            <div className={styles.whiteLine} />
                        </td>
                    )
                case 1:
                    transformedLicenseRow[1] = <td className={styles.rowData}>{row[0]} </td>
                case 2:
                    transformedLicenseRow[2] = <td className={styles.rowData}>{row[1]}</td>
                case 3:
                    transformedLicenseRow[3] = <td className={styles.rowData}>${row[2]}</td>
            }
        }
        renderedLicenseRows.push(transformedLicenseRow)
    })
    // ---------------------------------------------------------------------- //

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
                    <DetailPageTable
                        headers={renderHardwareHeaders()}
                        rows={renderedHardwareRows}
                        style={styles.newRowThing}
                    />
                </div>
                <div className={styles.addContainer}>
                    <div className={styles.addIconBorder}>
                        <IoMdAdd className={styles.addIcon} />
                    </div>
                    <div className={styles.assignText}>Assign new hardware</div>
                </div>

                <div className={styles.paddingTop}>
                    <DetailPageTable
                        headers={renderSoftwareHeaders()}
                        rows={renderedSoftwareRows}
                        style={styles.newRowThing}
                    />
                </div>
                <div className={styles.addContainer}>
                    <div className={styles.addIconBorder}>
                        <IoMdAdd className={styles.addIcon} />
                    </div>
                    <div className={styles.assignText}>Assign new software</div>
                </div>

                <div className={styles.paddingTop}>
                    <DetailPageTable
                        headers={renderLicenseHeaders()}
                        rows={renderedLicenseRows}
                        style={styles.newRowThing}
                    />
                </div>
                <div className={styles.addContainer}>
                    <div className={styles.addIconBorder}>
                        <IoMdAdd className={styles.addIcon} />
                    </div>
                    <div className={styles.assignText}>Assign new licenses</div>
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
