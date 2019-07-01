import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

//components
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Styles
import styles from './DepartmentDetailPage.module.css'

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

    const employeeHeaders = ['Employees', 'Date Hired', 'Cost']
    const softwareHeaders = ['Software', '#', 'Cost']
    const licenseHeaders = ['License', 'CALs']

    const [deptData, setDeptData] = useState<any>({})
    const [employeeRows, setEmployeeRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    useEffect(() => {
        axios
            .get(`/detail/department/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
                let dept: any = {
                    // photo: data[0].picture,
                    // name: data[0].firstName + ' ' + data[0].lastName,
                    departmentName: data[0].departmentName,
                    //     role: data[0].role,
                    //     hireDate: formatDate(data[0].hireDate),
                    //     hwCost: Math.round(data[0].totalHardwareCost * 100) / 100,
                    //     swCost: Math.round(data[0].totalProgramCostPerMonth * 100) / 100,
                }
                setDeptData(dept)

                let e: any[] = []
                // data[0].employees.map((i: any) =>
                //     e.push([
                //         format(i.name),
                //         format(i.hireDate),

                //     ])
                // )
                setEmployeeRows(e)

                // var toolTipArray = []
                // data[0].hardware.map((i: any) => toolTipArray.push(i.tooltip.cpu ? formatToolTip(i.tooltip) : ''))

                let sw: any[] = []
                // data[0].software.map((i: any) =>
                // sw.push([
                //     format(i.id),
                //     format(i.name),
                //     format(i.licenseKey),
                //     format(Math.round(i.costPerMonth * 100) / 100),
                //     format(i.flatCost),
                // ])
                // )
                setSoftwareRows(sw)

                let l: any[] = []
                // data[0].licenses.map((i: any) =>
                // l.push([
                //     format(i.id),
                //     format(i.name),
                //     format(i.cals),
                //     format(i.licenseKey),
                //     format(Math.round(i.costPerMonth * 100) / 100),
                //     format(i.flatCost),
                // ])
                // )
                setLicenseRows(l)
            })
            .catch((err: any) => console.error(err))

        //TODO: get dropdown content for all 3 dropdowns
    }, [])

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
                        {/* <p>Software ---------------- ${userData.swCost} /month</p> */}
                        {/* <p>Hardware --------------- ${userData.hwCost}</p> */}
                    </div>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {/* {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            <Button
                                text='Edit'
                                icon='edit'
                                onClick={() => {
                                    history.push('/editEmployee/' + match.params.id)
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
                    )} */}
                    <div className={styles.titleText}>
                        <div className={styles.deptName}>{deptData.departmentName}</div>
                        <div className={styles.deptText}># Employees</div>
                    </div>
                    <DetailPageTable headers={employeeHeaders} rows={employeeRows} setRows={setEmployeeRows} />
                    {/* {isAdmin && (
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
                    )} */}

                    <DetailPageTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />
                    {/* {isAdmin && (
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
                    )} */}

                    <DetailPageTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />
                    {/* {isAdmin && (
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
                    )} */}
                </div>
            </div>
        </div>
    )
}
