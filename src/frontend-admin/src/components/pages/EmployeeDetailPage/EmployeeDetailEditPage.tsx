import React, {useState, useEffect} from 'react'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {IoIosPersonAdd, IoMdAdd} from 'react-icons/io'
import {FaUserShield, FaUser} from 'react-icons/fa'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailEditPage.module.css'
import {Button} from '../../reusables/Button/Button'

// Types
interface IEmployeeDetailEditPageProps {
    match: any
    history: any
}

// Primary Component
export const EmployeeDetailEditPage: React.SFC<IEmployeeDetailEditPageProps> = props => {
    const {history, match} = props

    // useEffect(() => {
    //     axios.post()
    // })

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

    const hardwareHeaders = ['Hardware', 'Serial No.', 'Warranty', 'Year']
    const [hardwareRows, setHardwareRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12', 0],
        ['Joe Montana', 'Sales', '2012/09/11', 1],
        ['Bob the Builder', 'Developer', '2012/09/13', 154],
        ['Anne Manion', 'PM', '2010/09/12', 16],
        ['Sue Z', 'Designer', '2014/09/12', 15],
    ])

    const softwareHeaders = ['Software', 'Key/Username', 'Cost']
    const [softwareRows, setSoftwareRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12'],
        ['Joe Montana', 'Sales', '2012/09/11'],
        ['Bob the Builder', 'Developer', '2012/09/13'],
        ['Anne Manion', 'PM', '2010/09/12'],
        ['Sue Z', 'Designer', '2014/09/12'],
    ])

    const licenseHeaders = ['License', 'CALs', 'Cost']
    const [licenseRows, setLicenseRows] = useState([
        ['Bill Belichik', 'Sales', '2012/09/12'],
        ['Joe Montana', 'Sales', '2012/09/11'],
        ['Bob the Builder', 'Developer', '2012/09/13'],
        ['Anne Manion', 'PM', '2010/09/12'],
        ['Sue Z', 'Designer', '2014/09/12'],
    ])

    return (
        <div className={styles.columns}>
            {/* column 1 */}

            <div className={styles.firstColumn}>
                <Button
                    text='All Employees'
                    icon='back'
                    onClick={() => {
                        history.push('/employees')
                    }}
                    className={styles.backButton}
                    textClassName={styles.backButtonText}
                />
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
                            <div className={styles.title}>Non Admin User</div>
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
                        headers={hardwareHeaders}
                        rows={hardwareRows}
                        setRows={setHardwareRows}
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
                        headers={softwareHeaders}
                        rows={softwareRows}
                        setRows={setSoftwareRows}
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
                        headers={licenseHeaders}
                        rows={licenseRows}
                        setRows={setLicenseRows}
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
