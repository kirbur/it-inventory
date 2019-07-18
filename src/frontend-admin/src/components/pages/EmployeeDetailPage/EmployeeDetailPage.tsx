import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
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
    const [isDeleted, setIsDeleted] = useState(false)
    const [userData, setUserData] = useState<any>({})
    const [hardwareRows, setHardwareRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])

    const hardwareHeaders = ['Hardware', 'Serial Number', 'MFG Tag', 'Purchase Date']
    const softwareHeaders = ['Software', 'Key/Username', 'Monthly Cost']
    const licenseHeaders = ['Licenses', 'Key/Username', 'Monthly Cost', 'CALs']

    const formatToolTip = (obj: any) => obj.cpu + ' | ' + obj.ramgb + 'GB | ' + obj.ssdgb + 'GB'

    const handleHardwareClick = (id: number | string) => {
        history.push(`/hardware/${id}`)
    }

    const handleProgramClick = (id: number | string) => {
        history.push(`/programs/details/${id}`)
    }

    useEffect(() => {
        axios
            .get(`/detail/employee/${match.params.id}`)
            .then((data: any) => {
                let user: any = {
                    photo: data[0].picture,
                    name: data[0].firstName + ' ' + data[0].lastName,
                    department: data[0].department,
                    role: data[0].role,
                    hireDate: formatDate(data[0].hireDate),
                    hwCost: Math.round(data[0].totalHardwareCost * 100) / 100,
                    swCost: Math.round(data[0].totalProgramCostMonthly * 100) / 100,
                }

                setUserData(user)
                setIsDeleted(data[0].isDeleted)

                let hw: any[] = []
                data[0].hardware.map((i: any) =>
                    hw.push([
                        {
                            value: format(i.make + ' ' + i.model),
                            id: format(i.type.toLowerCase() + '/' + i.id),
                            tooltip: i.tooltip.cpu ? formatToolTip(i.tooltip) : '',
                            onClick: handleHardwareClick,
                            sortBy: i.make + ' ' + i.model,
                        },
                        {value: format(i.serialNumber), id: format(i.id), sortBy: i.serialNumber},
                        {value: format(i.mfg), id: format(i.id), sortBy: i.mfg},
                        {value: formatDate(i.purchaseDate), id: format(i.id), sortBy: i.purchaseDate},
                    ])
                )
                setHardwareRows(hw)

                let sw: any[] = []
                data[0].software.map((i: any) =>
                    sw.push([
                        {
                            value: format(i.name),
                            id: format(i.id),
                            onClick: handleProgramClick,
                            sortBy: i.name,
                        },
                        {value: format(i.licenseKey), id: format(i.id), sortBy: i.licenseKey},
                        {
                            value: '$' + Math.round(i.costPerMonth * 100) / 100,
                            id: format(i.id),
                            sortBy: i.costPerMonth,
                        },
                    ])
                )
                setSoftwareRows(sw)

                let l: any[] = []
                data[0].licenses.map((i: any) =>
                    l.push([
                        {
                            value: format(i.name),
                            id: format(i.id),
                            onClick: handleProgramClick,
                            sortBy: i.name,
                        },
                        {
                            value: format(i.licenseKey),
                            id: format(i.id),
                            sortBy: format(i.licenseKey),
                        },
                        {
                            value: '$' + Math.round(i.costPerMonth * 100) / 100,
                            sortBy: i.costPerMonth,
                        },
                        {value: format(i.cals), id: format(i.id), sortBy: i.cals},
                    ])
                )
                setLicenseRows(l)
            })
            .catch((err: any) => console.error(err))
    }, [])

    async function handleArchive() {
        if (window.confirm(`Are you sure you want to ${isDeleted ? 'recover' : 'archive'} ${userData.name}?`)) {
            await axios
                .put(`/${isDeleted ? 'recover' : 'archive'}/employee/${match.params.id}`, {})
                .catch((err: any) => console.error(err))
            history.push('/employees')
        }
    }

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
                            {!isDeleted && (
                                <Button
                                    text='Edit'
                                    icon='edit'
                                    onClick={() => {
                                        history.push('/editEmployee/' + match.params.id)
                                    }}
                                    className={styles.editbutton}
                                />
                            )}

                            <Button
                                text={isDeleted ? 'Recover' : 'Archive'}
                                icon='archive'
                                onClick={handleArchive}
                                className={styles.archivebutton}
                            />
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
                    <DetailPageTable
                        headers={hardwareHeaders}
                        rows={hardwareRows}
                        setRows={setHardwareRows}
                        className={styles.table}
                    />

                    <DetailPageTable
                        headers={softwareHeaders}
                        rows={softwareRows}
                        setRows={setSoftwareRows}
                        className={styles.table}
                    />

                    <DetailPageTable
                        headers={licenseHeaders}
                        rows={licenseRows}
                        setRows={setLicenseRows}
                        className={styles.table}
                    />
                </div>
            </div>
        </div>
    )
}
