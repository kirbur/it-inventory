import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import ReactTooltip from 'react-tooltip'
import {IoMdAdd} from 'react-icons/io'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IEmployeeDetailPageProps {
    match: any
    history: any
}

// Helpers

// Primary Component
export const EmployeeDetailPage: React.SFC<IEmployeeDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

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
                    photo: data[0].picture,
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

                // var toolTipArray = []
                // data[0].hardware.map((i: any) => toolTipArray.push(i.tooltip.cpu ? formatToolTip(i.tooltip) : ''))

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
    }, [])

    console.log(URL + userData.photo)

    return (
        <div className={styles.empDetailMain}>
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
                        <img className={styles.img} src={URL + userData.photo} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        <p>Software ---------------- ${userData.swCost} /month</p>
                        <p>Hardware --------------- ${userData.hwCost}</p>
                    </div>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            <Button
                                text='Edit'
                                icon='edit'
                                onClick={() => {
                                    history.push('/editEmployee/' + match.params.id)
                                }}
                                className={styles.editbutton}
                            />

                            <Button text='Archive' icon='archive' onClick={() => {}} className={styles.archivebutton} />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={styles.employeeName}>{userData.name}</div>
                        <div className={styles.employeeText}>
                            {userData.department} | {userData.role}
                        </div>
                        <div className={styles.employeeText}>
                            Hired: {userData.hireDate} | {calculateDaysEmployed(getDays(userData.hireDate))}
                        </div>
                    </div>
                    <DetailPageTable headers={hardwareHeaders} rows={hardwareRows} setRows={setHardwareRows} />
                    {isAdmin && (
                        <Button
                            text='Assign new hardware'
                            icon='add'
                            onClick={() => {}}
                            className={styles.addContainer}
                            textInside={false}
                            textClassName={styles.assignText}
                        />
                    )}

                    <DetailPageTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />
                    {isAdmin && (
                        <Button
                            text='Assign new software'
                            icon='add'
                            onClick={() => {}}
                            className={styles.addContainer}
                            textInside={false}
                            textClassName={styles.assignText}
                        />
                    )}

                    <DetailPageTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />
                    {isAdmin && (
                        <Button
                            text='Assign new license'
                            icon='add'
                            onClick={() => {}}
                            className={styles.addContainer}
                            textInside={false}
                            textClassName={styles.assignText}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
