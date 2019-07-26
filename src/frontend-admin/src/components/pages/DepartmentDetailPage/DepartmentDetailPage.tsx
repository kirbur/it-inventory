import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

//components
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {BackButton} from '../../reusables/BackButton/BackButton'

// Styles
import styles from './DepartmentDetailPage.module.css'
import placeholder from '../../../content/Images/Placeholders/department-placeholder.png'

// Context
import {LoginContext} from '../../App/App'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {checkImage} from '../../../utilities/CheckImage'

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
    const licenseHeaders = ['Licenses', 'CALs']

    const [deptData, setDeptData] = useState<any>({})
    const [employeeRows, setEmployeeRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])
    const [defaultHardware, setDefaultHardware] = useState<any[]>([])
    const [defaultSoftware, setDefaultSoftware] = useState<any[]>([])
    const [defaultLicenses, setDefaultLicenses] = useState<any[]>([])
    const [img, setImg] = useState()
    const [isDeleted, setIsDeleted] = useState(false)

    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)

    const handleEmployeeClick = (id: number | string) => {
        history.push({pathname: `/employees/detail/${id}`, state: {prev: history.location}})
    }
    const handleProgramClick = (id: number | string) => {
        history.push({pathname: `/programs/detail/${id}`, state: {prev: history.location}})
    }
    function renderProgramCost(isProgramCostPerYear: boolean, programCostPerYear: number) {
        if (isProgramCostPerYear == true) {
            return '$' + programCostPerYear.toString() + ' /year'
        } else {
            return '$' + programCostPerYear.toString() + ' /mo'
        }
    }

    const axios = new AxiosService(loginContextVariables)

    async function getData() {
        await axios
            .get(`/detail/department/${match.params.id}`)
            .then((data: any) => {
                let dept: any = {
                    // photo: data[0].picture,'
                    employeeCount: data[0].countEmpsInDep,
                    departmentName: data[0].departmentName,
                    hardwareCost: data[0].totalCostOfActHardwareInDep,
                    softwareCost: data[0].totalCostOfProgramsInDep,
                }
                setDeptData(dept)
                setIsDeleted(data[0].isDeleted)

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
                            value: 'HW: $' + i.hardwareCostForEmp + ' | SW: $' + i.programCostForEmp + ' /mo',
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
        if (employeeRows.length > 0) {
            window.alert('Cannot archive department with employees in it!')
        } else {
            if (
                window.confirm(
                    `Are you sure you want to ${isDeleted ? 'recover' : 'archive'} ${deptData.departmentName}?`
                )
            ) {
                await axios.put(`${isDeleted ? 'recover' : 'archive'}/department/${match.params.id}`, {})
                history.push({
                    pathname: `/departments${isDeleted ? `/edit/${match.params.id}` : ''}`,
                    state: {prev: history.location},
                })
            }
        }
    }

    return (
        <div className={styles.detailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <BackButton history={history} className={styles.backButton} />
                    <div className={styles.imgContainer}>
                        <div className={styles.imgPadding}>
                            <img className={styles.img} src={img} alt={''} />
                        </div>
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
                            {!isDeleted && (
                                <Button
                                    text='Edit'
                                    icon='edit'
                                    onClick={() => {
                                        history.push({
                                            pathname: '/departments/edit/' + match.params.id,
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
                        <div className={styles.deptName}>{deptData.departmentName}</div>
                        <div className={styles.deptText}>{deptData.employeeCount} employees</div>
                    </div>

                    <div className={styles.title}>Department Breakdown</div>

                    <DetailPageTable
                        headers={employeeHeaders}
                        rows={employeeRows}
                        setRows={setEmployeeRows}
                        className={styles.tableMargin}
                    />

                    <DetailPageTable
                        headers={softwareHeaders}
                        rows={softwareRows}
                        setRows={setSoftwareRows}
                        className={styles.tableMargin}
                    />

                    <DetailPageTable
                        headers={licenseHeaders}
                        rows={licenseRows}
                        setRows={setLicenseRows}
                        className={styles.tableMargin}
                    />

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
