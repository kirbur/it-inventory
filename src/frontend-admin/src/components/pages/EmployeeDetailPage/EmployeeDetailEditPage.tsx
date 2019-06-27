import React, {useState, useEffect, useContext} from 'react'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailEditTable} from '../../reusables/DetailEditTable/DetailEditTable'
import {IoIosPersonAdd, IoMdAdd} from 'react-icons/io'
import {FaUserShield, FaUser} from 'react-icons/fa'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailEditPage.module.css'
import {Button} from '../../reusables/Button/Button'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {LoginContext} from '../../App/App'
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'

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
    const [deptList, setDeptList] = useState<any>([])
    var deptsRowOne: any[] = []
    var deptsRowTwo: any[] = []
    //push them into alternating rows so that rows are equal
    for (let i = 0; i < deptList.length; i++) {
        if (i % 2 == 0) {
            deptsRowOne.push(deptList[i].DepartmentName)
        } else {
            deptsRowTwo.push(deptList[i].DepartmentName)
        }
    }

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)
    const [userData, setUserData] = useState<any>({})
    const [hardwareRows, setHardwareRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])

    const hardwareHeaders = ['Hardware', 'Serial Number', 'MFG Tag', 'Purchase Date']
    const softwareHeaders = ['Software', 'Key/Username', 'Monthly Cost']
    const licenseHeaders = ['Licenses', 'CALs']

    const formatToolTip = (obj: any) => obj.cpu + ' | ' + obj.ramgb + 'GB | ' + obj.ssdgb + 'GB'

    useEffect(() => {
        axios
            .get(`/detail/employee/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
                let user: any = {
                    isAdmin: data[0].isAdmin,
                    photo: data[0].picture,
                    firstName: data[0].firstName,
                    lastName: data[0].lastName,
                    name: data[0].firstName + ' ' + data[0].lastName,
                    department: data[0].department,
                    role: data[0].role,
                    hireDate: formatDate(data[0].hireDate),
                    hwCost: Math.round(data[0].totalHardwareCost * 100) / 100,
                    swCost: Math.round(data[0].totalProgramCostPerMonth * 100) / 100,
                }
                setUserData(user)

                let hw: any[] = []
                data[0].hardware.map((i: any) =>
                    hw.push([
                        format(i.id),
                        format(i.make + ' ' + i.model),
                        format(i.serialNumber),
                        format(i.mfg),
                        formatDate(i.purchaseDate),
                        i.tooltip.cpu ? formatToolTip(i.tooltip) : '',
                    ])
                )
                setHardwareRows(hw)
                let sw: any[] = []
                data[0].software.map((i: any) =>
                    sw.push([
                        format(i.id),
                        format(i.name),
                        format(i.licenseKey),
                        format(Math.round(i.costPerMonth * 100) / 100),
                        format(i.flatCost),
                    ])
                )
                setSoftwareRows(sw)

                let l: any[] = []
                data[0].licenses.map((i: any) =>
                    l.push([
                        format(i.id),
                        format(i.name),
                        format(i.cals),
                        format(i.licenseKey),
                        format(Math.round(i.costPerMonth * 100) / 100),
                        format(i.flatCost),
                    ])
                )
                setLicenseRows(l)
            })
            .catch((err: any) => console.error(err))

        axios
            .get('/dashboard/departmentTable?$select=departmentName,departmentID')
            .then((data: any) => setDeptList(data))
            .catch((err: any) => console.log(err))
    }, [])

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

                {/* TODO:
                pull in bool from backend to set default on admin radio cards
                */}

                <div className={styles.adminCardContainer}>
                    {/* admin card */}
                    <div className={styles.paddingRight}>
                        <div className={styles.adminCard}>
                            <div className={styles.card}>
                                <input
                                    type='radio'
                                    name='admin'
                                    className={styles.checkmark}
                                    checked={userData.isAdmin}
                                />
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
                            <input type='radio' name='admin' className={styles.checkmark} checked={userData.isAdmin} />
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
                            <input type='text' className={styles.input} placeholder={userData.firstName} />
                        </div>
                        <div>
                            <div className={styles.text}>Last Name</div>
                            <input type='text' className={styles.input} placeholder={userData.lastName} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.text}>Date Hired</div>
                        <input type='text' className={styles.input} placeholder={userData.hireDate} />
                    </div>
                </div>

                <div className={styles.line} />

                {/* Employee Dept radio buttons */}
                <div className={s(styles.title, styles.paddingTop, styles.paddingBottom)}>Employee Department</div>
                <div className={styles.employeeDepartment}>
                    <div>
                        {deptsRowOne.map(dept => (
                            <div className={styles.container}>
                                <input
                                    type='radio'
                                    name='employeeDept'
                                    className={styles.checkmark}
                                    checked={dept === userData.department}
                                />
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
                                <input
                                    type='radio'
                                    name='employeeDept'
                                    className={styles.checkmark}
                                    checked={dept === userData.department}
                                />
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
                    <DetailEditTable
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
                    <DetailEditTable
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
                    <DetailEditTable
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
