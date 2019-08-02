import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {History} from 'history'
import {match} from 'react-router-dom'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {BackButton} from '../../reusables/BackButton/BackButton'
import {DetailImage} from '../../reusables/DetailImage/DetailImage'
import {DetailCostText} from '../../reusables/DetailCostText/DetailCostText'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {checkImage} from '../../../utilities/CheckImage'

// Styles
import styles from './EmployeeDetailPage.module.css'
import placeholder from '../../../content/Images/Placeholders/employee-placeholder.png'

// Context
import {LoginContext, ThemeContext} from '../../App/App'

// Types
interface IEmployeeDetailPageProps {
    match: match<{id: string}>
    history: History
}

interface IUser {
    name: string
    department: string
    deptId: number
    role: string
    hireDate: string
    hwCost: number
    swCost: number
    archiveDate: string
    description: string
    email: string
}

// Primary Component
export const EmployeeDetailPage: React.SFC<IEmployeeDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const { isDarkMode } = useContext(ThemeContext)

    const axios = new AxiosService(loginContextVariables)
    const [isDeleted, setIsDeleted] = useState(false)
    const [img, setImg] = useState('')
    const [userData, setUserData] = useState<IUser>({
        name: '',
        department: '',
        deptId: -1,
        role: '',
        hireDate: '',
        hwCost: 0,
        swCost: 0,
        archiveDate: '',
        description: '',
        email: '',
    })
    const [hardwareRows, setHardwareRows] = useState<ITableItem[][]>([])
    const [softwareRows, setSoftwareRows] = useState<ITableItem[][]>([])
    const [licenseRows, setLicenseRows] = useState<ITableItem[][]>([])

    const hardwareHeaders = ['Hardware', 'Serial Number', 'MFG Tag', 'Purchase Date']
    const softwareHeaders = ['Software', 'Key/Username', 'Monthly Cost']
    const licenseHeaders = ['Licenses', 'Key/Username', 'Monthly Cost', 'CALs']

    const formatToolTip = (obj: any) => obj.cpu + ' | ' + obj.ramgb + 'GB | ' + obj.ssdgb + 'GB'

    const handleHardwareClick = (id: number | string) => {
        history.push({pathname: `/hardware/detail/${id}`, state: {prev: history.location}})
    }

    const handleProgramClick = (id: number | string) => {
        history.push({pathname: `/programs/detail/${id}`, state: {prev: history.location}})
    }

    async function getData() {
        await axios
            .get(`/detail/employee/${match.params.id}`)
            .then((data: any) => {
                let user: IUser = {
                    name: data[0].firstName + ' ' + data[0].lastName,
                    department: data[0].department,
                    deptId: data[0].departmentID,
                    role: data[0].role,
                    hireDate: formatDate(data[0].hireDate),
                    hwCost: Math.round(data[0].totalHardwareCost * 100) / 100,
                    swCost: Math.round(data[0].totalProgramCostMonthly * 100) / 100,
                    archiveDate: formatDate(data[0].archiveDate), //TODO: make sure these were added
                    description: data[0].textField,
                    email: format(data[0].email),
                }

                setUserData(user)
                setIsDeleted(data[0].isDeleted)

                let hw: ITableItem[][] = []
                data[0].hardware.map((i: any) =>
                    hw.push([
                        {
                            value: format(i.make + ' ' + i.model),
                            id: format(
                                (i.type.toLowerCase() === 'computer' ? 'laptop' : i.type.toLowerCase()) + '/' + i.id
                            ),
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

                let sw: ITableItem[][] = []
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

                let l: ITableItem[][] = []
                data[0].licenses.map((i: any) =>
                    l.push([
                        {
                            value: format(i.name),
                            id: format(i.id),
                            onClick: handleProgramClick,
                            sortBy: i.name,
                        },
                        {
                            value: format(i.licensesKey),
                            id: format(i.id),
                            sortBy: format(i.licensesKey),
                        },
                        {
                            value: '$' + Math.round(i.costPerMonth * 100) / 100,
                            sortBy: i.costPerMonth,
                        },
                        {value: format(i.licensesCount), id: format(i.id), sortBy: i.licensesCount},
                    ])
                )
                setLicenseRows(l)

                checkImage(data[0].picture, axios, placeholder)
                    .then(image => setImg(image))
                    .catch(err => console.error(err))
            })
            .catch((err: any) => console.error(err))
    }

    useEffect(() => {
        getData()
    }, [])

    async function handleArchive() {
        if (window.confirm(`Are you sure you want to ${isDeleted ? 'recover' : 'archive'} ${userData.name}?`)) {
            await axios
                .put(`/${isDeleted ? 'recover' : 'archive'}/employee/${match.params.id}`, {})
                .catch((err: any) => console.error(err))
            history.push({
                pathname: `/employees${isDeleted ? '/edit/' + match.params.id : ''}`,
                state: {prev: history.location},
            })
        }
    }

    return (
        <div className={s(styles.empDetailMain, isDarkMode ? styles.backgroundDark : {})}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <BackButton history={history} className={styles.backButton} />
                    <DetailImage src={img} />
                    <DetailCostText
                        costTexts={[
                            {title: `Software`, cost: `$${userData.swCost} /month` },
                            {title: `Hardware`, cost: `$${userData.hwCost}` },
                        ]}
                    />
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
                                        history.push({
                                            pathname: '/employees/edit/' + match.params.id,
                                            state: {prev: history.location},
                                        })
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
                        <div className={s(styles.employeeName, isDarkMode ? styles.employeeNameDark : {})}>{userData.name}</div>
                        <div className={styles.employeeText}>{userData.email}</div>
                        <div className={styles.employeeText}>
                            <div
                                className={s(styles.deptText, isDarkMode ? styles.deptTextDark : {})}
                                onClick={() => {
                                    history.push({
                                        pathname: '/departments/detail/' + userData.deptId,
                                        state: {prev: history.location},
                                    })
                                }}
                            >
                                {userData.department}
                            </div>{' '}
                            | {userData.role}
                        </div>

                        <div className={styles.employeeText}>
                            Start Date: {userData.hireDate} |{' '}
                            {userData.archiveDate !== '-'
                                ? `End Date: ${userData.archiveDate}`
                                : calculateDaysEmployed(getDays(userData.hireDate))}
                        </div>

                        {userData.archiveDate !== '-' && (
                            <div className={styles.employeeText}>
                                {calculateDaysEmployed(getDays(userData.hireDate))}
                            </div>
                        )}
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

                    <div className={styles.descriptionContainer}>
                        <div className={styles.descriptionTitle}>Description</div>
                        <div className={styles.descriptionBody}>{userData.description}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
