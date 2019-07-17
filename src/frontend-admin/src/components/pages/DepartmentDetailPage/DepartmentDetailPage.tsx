import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

//components
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'

// Styles
import styles from './DepartmentDetailPage.module.css'

// Context
import {LoginContext} from '../../App/App'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Types
interface IDepartmentDetailPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const DepartmentDetailPage: React.SFC<IDepartmentDetailPageProps> = props => {
    const {history, match} = props

    const hardwareHeaders = ['Hardware']
    const employeeHeaders = ['Employees', 'Date Hired', 'Cost']
    const softwareHeaders = ['Software', '#', 'Cost']
    const licenseHeaders = ['License', 'CALs']

    const [deptData, setDeptData] = useState<any>({})
    const [employeeRows, setEmployeeRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])
    const [defaultHardware, setDefaultHardware] = useState<any[]>([])
    const [defaultSoftware, setDefaultSoftware] = useState<any[]>([])
    const [defaultLicenses, setDefaultLicenses] = useState<any[]>([])
    const [img, setImg] = useState()

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const handleEmployeeClick = (id: number | string) => {
        history.push(`/employees/detail/${id}`)
    }
    const handleProgramClick = (id: number | string) => {
        history.push(`/programs/detail/${id}`)
    }
    function renderProgramCost(isProgramCostPerYear: boolean, programCostPerYear: number) {
        if (isProgramCostPerYear == true) {
            return '$' + programCostPerYear.toString() + ' /year'
        } else {
            return '$' + programCostPerYear.toString() + ' /mo'
        }
    }

    const axios = new AxiosService(accessToken, refreshToken)

    useEffect(() => {
        axios
            .get(`/detail/department/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
                setImg(data[0].picture)
                let dept: any = {
                    // photo: data[0].picture,'
                    employeeCount: data[0].countEmpsInDep,
                    departmentName: data[0].departmentName,
                    hardwareCost: data[0].totalCostOfActHardwareInDep,
                    softwareCost: data[0].totalCostOfProgramsInDep,
                }
                setDeptData(dept)

                let e: any[][] = []
                data[0].listOfEmployees.map((i: any) =>
                    e.push([
                        {
                            value: format(i.employeeName),
                            sortBy: i.employeeName,
                            id: format(i.employeeId),
                            onClick: handleEmployeeClick,
                        },
                        {
                            value: formatDate(i.hireDate),
                            sortBy: i.hireDate,
                        },
                        {
                            //all programCostForEmp is per month
                            value:
                                'HW: $' +
                                format(i.hardwareCostForEmp) +
                                ' | SW: $' +
                                format(i.programCostForEmp) +
                                ' /mo',
                            sortBy: i.hardwareCostForEmp,
                        },
                    ])
                )
                setEmployeeRows(e)

                let sw: any[] = []
                data[0].listOfTablePrograms.map((
                    i: any //not programs - actually software
                ) =>
                    sw.push([
                        {
                            value: format(i.programName),
                            sortBy: i.programName,
                            id: format(i.programName),
                            onClick: handleProgramClick,
                        },
                        {
                            value: format(i.programCount),
                            sortBy: i.programCount,
                        },
                        {
                            value: renderProgramCost(i.programIsCostPerYear, i.programCostPerYear),
                            sortBy: i.programCostPerYear,
                        },
                    ])
                )
                setSoftwareRows(sw)

                let l: any[] = []
                data[0].licensesList.map((i: any) =>
                    l.push([
                        {
                            value: format(i.progName),
                            sortBy: i.progName,
                            id: format(i.progName),
                            onClick: handleProgramClick,
                        },
                        {
                            value: format(i.countOfThatLicense),
                            sortBy: i.countOfThatLicense,
                        },
                    ])
                )
                setLicenseRows(l)

                let dhw: any[] = []
                data[0].defaultHardware.map((i: any) => dhw.push([{value: format(i), sortBy: i}]))
                setDefaultHardware(dhw)

                let dsw: any[] = []
                data[0].defaultSoftware.map((i: any) => dsw.push([{value: format(i), sortBy: i}]))
                setDefaultSoftware(dsw)

                let dl: any[] = []
                data[0].defaultLicenses.map((i: any) => dl.push([{value: format(i), sortBy: i}]))
                setDefaultLicenses(dl)
            })
            .catch((err: any) => console.error(err))

        //TODO: get dropdown content for all 3 dropdowns
    }, [])

    async function handleArchive() {
        if (employeeRows.length > 0) {
            window.alert('Cannot archive department with employees in it!')
        } else {
            if (window.confirm(`Are you sure you want to archive ${deptData.departmentName}?`)) {
                await axios.put(`archive/department/${match.params.id}`, {})
                history.push('/departments')
            }
        }
    }

    return (
        <div className={styles.detailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text='All Departments'
                        icon='back'
                        onClick={() => {
                            history.push('/departments')
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={URL + img} alt={''} />
                    </div>
                    <Group>
                        <p>Software</p>
                        <div className={styles.costLine} />
                        <p>${deptData.softwareCost} /month </p>
                    </Group>
                    <Group>
                        <p>Hardware</p>
                        <div className={styles.costLine} />
                        <p>${deptData.hardwareCost} </p>
                    </Group>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            <Button
                                text='Edit'
                                icon='edit'
                                onClick={() => {
                                    history.push('/departments/edit/' + match.params.id)
                                    //TODO: wire to edit page in IIWA-155
                                }}
                                className={styles.editbutton}
                            />

                            <Button
                                text='Archive'
                                icon='archive'
                                onClick={handleArchive}
                                className={styles.archivebutton}
                            />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={styles.deptName}>{deptData.departmentName}</div>
                        <div className={styles.deptText}>{deptData.employeeCount} employees</div>
                    </div>

                    <div className={styles.title}>Department Breakdown</div>

                    <DetailPageTable headers={employeeHeaders} rows={employeeRows} setRows={setEmployeeRows} />

                    <DetailPageTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />

                    <DetailPageTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />

                    <div className={styles.line} />
                    <div className={styles.title}>Department Defaults</div>

                    {/* default hardware */}
                    <div className={styles.tableRow}>
                        <div className={s(styles.table, styles.paddingRight)}>
                            <DetailPageTable
                                headers={[hardwareHeaders[0]]}
                                rows={defaultHardware}
                                setRows={setDefaultHardware}
                            />
                        </div>
                        {/* default software */}
                        <div className={styles.table}>
                            <DetailPageTable
                                headers={[softwareHeaders[0]]}
                                rows={defaultSoftware}
                                setRows={setDefaultSoftware}
                            />
                        </div>
                    </div>
                    {/* default licenses */}
                    <div className={styles.tableRow}>
                        <div className={s(styles.table, styles.paddingRight)}>
                            <DetailPageTable
                                headers={[licenseHeaders[0]]}
                                rows={defaultLicenses}
                                setRows={setDefaultLicenses}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
