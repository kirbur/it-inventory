import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import ReactTooltip from 'react-tooltip'
import {IoMdAdd} from 'react-icons/io'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

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

    //TODO: remove default options
    const [hardwareDropdown, setHardwareDropdown] = useState<any[]>()
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>()
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>()

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

                let uhw: any[] = []
                data[0].unassignedHardware.map((i: any) =>
                    uhw.push({
                        name: i.monitorName || i.compName || i.periphName,
                        id: i.type + '/' + i.monitorId || i.type + '/' + i.computerId || i.type + '/' + i.peripheralId,
                    })
                )
                setHardwareDropdown(uhw)

                let usw: any[] = []
                data[0].unassignedSoftware.map((i: any) =>
                    usw.push({
                        name: i.programName,
                        id: i.programId,
                    })
                )
                setSoftwareDropdown(usw)

                let ul: any[] = []
                data[0].unassignedLicenses.map((i: any) =>
                    ul.push({
                        name: i.programName,
                        id: i.programId,
                    })
                )
                setLicenseDropdown(ul)
            })
            .catch((err: any) => console.error(err))
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive ${userData.name}?`)) {
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

                            <Button
                                text='Archive'
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
                    <DetailPageTable headers={hardwareHeaders} rows={hardwareRows} setRows={setHardwareRows} />
                    {isAdmin && hardwareDropdown && (
                        <Button
                            className={s(styles.addContainer, styles.dropdown3)}
                            icon='add'
                            onClick={() => {}}
                            textInside={false}
                        >
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
                                        <ul className={s(dropdownStyles.dropdownList, styles.dropdownList)}>
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
                    {isAdmin && softwareDropdown && (
                        <Button
                            className={s(styles.addContainer, styles.dropdown2)}
                            icon='add'
                            onClick={() => {}}
                            textInside={false}
                        >
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
                    {isAdmin && licenseDropdown && (
                        <Button
                            className={s(styles.addContainer, styles.dropdown1)}
                            icon='add'
                            onClick={() => {}}
                            textInside={false}
                        >
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
                </div>
            </div>
        </div>
    )
}
