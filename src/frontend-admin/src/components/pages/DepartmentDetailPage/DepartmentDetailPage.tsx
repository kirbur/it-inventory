import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

//components
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

//components
import {HistoryLog} from '../../reusables/HistoryLog/HistoryLog'

// Styles
import styles from './DepartmentDetailPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

// Context
import {LoginContext} from '../../App/App'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
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

    //TODO: remove default options
    const [hardwareDropdown, setHardwareDropdown] = useState<any[]>([
        {name: 'option 1', id: 1},
        {name: 'option 2', id: 1},
        {name: 'option 3', id: 2},
    ])
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>([
        {name: 'option 1', id: 1},
        {name: 'option 2', id: 1},
        {name: 'option 3', id: 2},
    ])
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>([
        {name: 'option 1', id: 1},
        {name: 'option 2', id: 1},
        {name: 'option 3', id: 2},
    ])

    const [deptData, setDeptData] = useState<any>({})
    const [employeeRows, setEmployeeRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])
    const [defaultHardware, setDefaultHardware] = useState<any[]>([])
    const [defaultSoftware, setDefaultSoftware] = useState<any[]>([])
    const [defaultLicenses, setDefaultLicenses] = useState<any[]>([])

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)

    useEffect(() => {
        axios
            .get(`/detail/department/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
                let dept: any = {
                    // photo: data[0].picture,'
                    employeeCount: data[0].countEmpsInDep,
                    departmentName: data[0].departmentName,
                    hardwareCost: data[0].totalCostOfActHardwareInDep,
                    softwareCost: data[0].totalCostOfProgramsInDep,
                }
                setDeptData(dept)

                let e: any[] = []
                data[0].listOfEmployees.map((i: any) =>
                    e.push([format(i.id), format(i.employeeName), formatDate(i.hireDate), format(i.programCostForEmp)])
                )
                console.log(e)
                setEmployeeRows(e)

                // var toolTipArray = []
                // data[0].hardware.map((i: any) => toolTipArray.push(i.tooltip.cpu ? formatToolTip(i.tooltip) : ''))

                let sw: any[] = []
                data[0].listOfTablePrograms.map((
                    i: any //not programs - actually software
                ) =>
                    sw.push([
                        format(i.id),
                        format(i.programName),
                        format(i.programCount),
                        format(Math.round(i.programCostPerYear * 100) / 100),
                    ])
                )
                console.log(sw)
                setSoftwareRows(sw)

                let l: any[] = []
                data[0].licensesList.map((i: any) =>
                    l.push([format(i.id), format(i.progName), format(i.countOfThatLicense)])
                )
                console.log(l)
                setLicenseRows(l)

                let dhw: any[] = []
                data[0].jsonHardware.DefaultHardware.map((i: any) => dhw.push([format(i.id), i]))
                setDefaultHardware(dhw)

                let dsw: any[] = []
                data[0].jsonHardware.DefaultPrograms.map((i: any) => dsw.push([format(i.id), i]))
                setDefaultHardware(dsw)
            })
            .catch((err: any) => console.error(err))

        //TODO: get dropdown content for all 3 dropdowns
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive ${deptData.departmentName}?`)) {
            //TODO: a post request to archive user w/ id match.params.id
            history.push('/employees')
        }
    }

    const handleAddHardware = (id: number) => {
        //TODO: post request to assign hardware to user w/ id match.params.id
    }

    const handleAddSoftware = (id: number) => {
        //TODO: post request to assign software to user w/ id match.params.id
    }

    const handleAddLicense = (id: number) => {
        //TODO: post request to assign license to user w/ id match.params.id
    }

    const handleSubmit = () => {
        //TODO: post request
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
                        {/* <img className={styles.img} src={URL + userData.photo} alt={''} /> */}
                    </div>
                    <div className={styles.costText}>
                        <p>Software ---------------- ${deptData.softwareCost} /month</p>
                        <p>Hardware --------------- ${deptData.hardwareCost}</p>
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
                                    history.push('/editDepartment/' + match.params.id)
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
                    {isAdmin && (
                        <Button className={styles.addContainer} icon='add' onClick={() => {}} textInside={false}>
                            <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                <DropdownList
                                    triggerElement={({isOpen, toggle}) => (
                                        <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                            <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                Assign new hardware
                                            </div>
                                        </button>
                                    )}
                                    choicesList={() => (
                                        <ul className={dropdownStyles.dropdownList}>
                                            {hardwareDropdown.map(i => (
                                                <li
                                                    className={dropdownStyles.dropdownListItem}
                                                    key={i.name}
                                                    onClick={() => handleAddHardware(i.id)}
                                                >
                                                    <button className={dropdownStyles.dropdownListItemButton}>
                                                        <div className={dropdownStyles.dropdownItemLabel}>{i.name}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                />
                                <div />
                            </div>
                        </Button>
                    )}

                    <DetailPageTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />
                    {isAdmin && (
                        <Button className={styles.addContainer} icon='add' onClick={() => {}} textInside={false}>
                            <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                <DropdownList
                                    triggerElement={({isOpen, toggle}) => (
                                        <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                            <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                Assign new software
                                            </div>
                                        </button>
                                    )}
                                    choicesList={() => (
                                        <ul className={dropdownStyles.dropdownList}>
                                            {softwareDropdown.map(i => (
                                                <li
                                                    className={dropdownStyles.dropdownListItem}
                                                    key={i.name}
                                                    onClick={() => handleAddSoftware(i.id)}
                                                >
                                                    <button className={dropdownStyles.dropdownListItemButton}>
                                                        <div className={dropdownStyles.dropdownItemLabel}>{i.name}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                />
                                <div />
                            </div>
                        </Button>
                    )}

                    <DetailPageTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />
                    {isAdmin && (
                        <Button className={styles.addContainer} icon='add' onClick={() => {}} textInside={false}>
                            <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                <DropdownList
                                    triggerElement={({isOpen, toggle}) => (
                                        <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                            <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                Assign new license
                                            </div>
                                        </button>
                                    )}
                                    choicesList={() => (
                                        <ul className={dropdownStyles.dropdownList}>
                                            {licenseDropdown.map(i => (
                                                <li
                                                    className={dropdownStyles.dropdownListItem}
                                                    key={i.name}
                                                    onClick={() => handleAddLicense(i.id)}
                                                >
                                                    <button className={dropdownStyles.dropdownListItemButton}>
                                                        <div className={dropdownStyles.dropdownItemLabel}>{i.name}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                />
                                <div />
                            </div>
                        </Button>
                    )}

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

                            <Button
                                className={styles.addDefaultContainer}
                                icon='add'
                                onClick={() => {}}
                                textInside={false}
                            >
                                <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                    <DropdownList
                                        triggerElement={({isOpen, toggle}) => (
                                            <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                    Add default hardware
                                                </div>
                                            </button>
                                        )}
                                        choicesList={() => (
                                            <ul className={dropdownStyles.dropdownList}>
                                                {hardwareDropdown.map(i => (
                                                    <li
                                                        className={dropdownStyles.dropdownListItem}
                                                        key={i.name}
                                                        onClick={() => handleAddHardware(i.id)}
                                                    >
                                                        <button className={dropdownStyles.dropdownListItemButton}>
                                                            <div className={dropdownStyles.dropdownItemLabel}>
                                                                {i.name}
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    />
                                    <div />
                                </div>
                            </Button>
                        </div>
                        {/* default software */}
                        <div className={styles.table}>
                            <DetailPageTable
                                headers={[softwareHeaders[0]]}
                                rows={defaultSoftware}
                                setRows={setDefaultSoftware}
                            />
                            <Button
                                className={styles.addDefaultContainer}
                                icon='add'
                                onClick={() => {}}
                                textInside={false}
                            >
                                <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                    <DropdownList
                                        triggerElement={({isOpen, toggle}) => (
                                            <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                    Add default software
                                                </div>
                                            </button>
                                        )}
                                        choicesList={() => (
                                            <ul className={dropdownStyles.dropdownList}>
                                                {softwareDropdown.map(i => (
                                                    <li
                                                        className={dropdownStyles.dropdownListItem}
                                                        key={i.name}
                                                        onClick={() => handleAddSoftware(i.id)}
                                                    >
                                                        <button className={dropdownStyles.dropdownListItemButton}>
                                                            <div className={dropdownStyles.dropdownItemLabel}>
                                                                {i.name}
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    />
                                    <div />
                                </div>
                            </Button>
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

                            <Button
                                className={styles.addDefaultContainer}
                                icon='add'
                                onClick={() => {}}
                                textInside={false}
                            >
                                <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                    <DropdownList
                                        triggerElement={({isOpen, toggle}) => (
                                            <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                    Add default license
                                                </div>
                                            </button>
                                        )}
                                        choicesList={() => (
                                            <ul className={dropdownStyles.dropdownList}>
                                                {licenseDropdown.map(i => (
                                                    <li
                                                        className={dropdownStyles.dropdownListItem}
                                                        key={i.name}
                                                        onClick={() => handleAddLicense(i.id)}
                                                    >
                                                        <button className={dropdownStyles.dropdownListItemButton}>
                                                            <div className={dropdownStyles.dropdownItemLabel}>
                                                                {i.name}
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    />
                                    <div />
                                </div>
                            </Button>
                        </div>
                    </div>
                    <div className={styles.submitContainer}>
                        <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                    </div>
                </div>
            </div>
        </div>
    )
}
