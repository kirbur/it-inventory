import React, {useState, useEffect, useContext} from 'react'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {IoIosPersonAdd, IoMdAdd} from 'react-icons/io'
import {GoCloudUpload} from 'react-icons/go'
import {FaUserShield, FaUser, FaUserGraduate} from 'react-icons/fa'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailEditPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'
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
            deptsRowOne.push(deptList[i] /*.DepartmentName*/)
        } else {
            deptsRowTwo.push(deptList[i] /*.DepartmentName*/)
        }
    }

    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)
    const [userData, setUserData] = useState<any>({})
    const [hardwareRows, setHardwareRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])

    const hardwareHeaders = ['Hardware', 'Serial Number', 'MFG Tag', 'Purchase Date']
    const softwareHeaders = ['Software', 'Key/Username', 'Monthly Cost']
    const licenseHeaders = ['Licenses', 'CALs']

    //input feild states:
    const [dateInput, setDateInput] = useState<Date>(new Date())
    const [deptInput, setDeptInput] = useState<{DepartmentName: string; DepartmentId: number}>()
    const [adminInput, setAdminInput] = useState<boolean>()
    const [imgInput, setImgInput] = useState<File>()
    const [roleInput, setRoleInput] = useState<string>()

    const [hardwareDropdown, setHardwareDropdown] = useState<any[]>()
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>()
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>()

    const [employeeDropdown, setEmployeeDropdown] = useState<any[]>([{name: 'First Last', id: 1}])
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>()

    const formatToolTip = (obj: any) => obj.cpu + ' | ' + obj.ramgb + 'GB | ' + obj.ssdgb + 'GB'

    useEffect(() => {
        if (match.params.id === 'new') {
            //TODO: populate all 4 dropdowns
            //employee dropdown with employees
            //and available hw/progs
        } else {
            axios //TODO: get from edit endpoint
                .get(`/detail/employee/${match.params.id}`)
                .then((data: any) => {
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
                    setAdminInput(data[0].isAdmin)
                    setDateInput(new Date(formatDate(data[0].hireDate)))
                    setRoleInput(data[0].role)
                    setSelectedEmployee({name: data[0].firstName + ' ' + data[0].lastName, id: match.params.id})

                    let hw: any[] = []
                    data[0].hardware.map((i: any) =>
                        hw.push([
                            {
                                value: format(i.make + ' ' + i.model),
                                id: format(i.type + '/' + i.id),
                                tooltip: i.tooltip.cpu ? formatToolTip(i.tooltip) : '',
                                onClick: () => {},
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
                                sortBy: i.name,
                                onClick: () => {},
                            },
                            {value: format(i.licenseKey), id: format(i.id), sortBy: i.licenseKey},
                            {
                                value: '$' + format(Math.round(i.costPerMonth * 100) / 100),
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
                                sortBy: i.name,
                                onClick: () => {},
                            },
                            {value: format(i.cals), id: format(i.id), sortBy: i.cals},
                            {
                                value: format(Math.round(i.costPerMonth * 100) / 100),
                                id: format(i.id),
                                sortBy: i.costPerMonth,
                            },
                        ])
                    )
                    setLicenseRows(l)

                    let uhw: any[] = []
                    data[0].unassignedHardware.map((i: any) =>
                        uhw.push({
                            name: i.monitorName || i.compName || i.periphName,
                            id:
                                i.type + '/' + i.monitorId ||
                                i.type + '/' + i.computerId ||
                                i.type + '/' + i.peripheralId,
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
        }
    }, [])

    useEffect(() => {
        axios
            .get('/dashboard/departmentTable?$select=departmentName,departmentID')
            .then((data: any) => {
                setDeptList(data)
                var d = data.filter((i: any) => i.DepartmentName === userData.department)
                d[0]
                    ? setDeptInput({DepartmentName: userData.department, DepartmentId: d[0].DepartmentId})
                    : setDeptInput({DepartmentName: data[0].departmentName, DepartmentId: data[0].DepartmentId})
            })
            .catch((err: any) => console.error(err))
    }, [userData])

    useEffect(() => {
        if (match.params.id === 'new') {
            //TODO: get table data for department defaults
            // & figure out how to handle unavailable defaults
        }
    }, [deptInput])

    const handleAddHardware = (id: number) => {
        //TODO: post request to assign hardware to user w/ id match.params.id
    }

    const handleAddSoftware = (id: number) => {
        //TODO: post request to assign software to user w/ id match.params.id
    }

    const handleAddLicense = (id: number) => {
        //TODO: post request to assign license to user w/ id match.params.id
    }

    const handleRemove = (row: any) => {
        //TODO: might have to make sepaerate functions for each type
    }

    const handleSubmit = () => {
        //TODO: post request
    }

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
                    {/* <img className={styles.img} src={icon} /> */}
                    <GoCloudUpload size={300} className={styles.cloudIcon} onClick={() => {}} />
                    <input
                        className={styles.imgInput}
                        type='file'
                        accept='image/*'
                        onClick={event => {
                            //console.log(event)
                        }}
                        onChange={e => {
                            var files = e.target.files
                            files && files[0] && setImgInput(files[0])
                        }}
                    />
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
                                    checked={adminInput}
                                    onChange={() => setAdminInput(true)}
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
                            <input
                                type='radio'
                                name='admin'
                                className={styles.checkmark}
                                checked={!adminInput}
                                onChange={() => setAdminInput(false)}
                            />
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
                            <div className={styles.text}>Employee Name</div>
                            {match.params.id === 'new' ? (
                                <Button className={s(styles.input, styles.employeeDropdownButton)}>
                                    <div
                                        className={s(
                                            dropdownStyles.dropdownContainer,
                                            styles.employeeDropdownContainer
                                        )}
                                    >
                                        <DropdownList
                                            triggerElement={({isOpen, toggle}) => (
                                                <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                    <div
                                                        className={s(
                                                            dropdownStyles.dropdownTitle,
                                                            styles.employeeDropdownTitle
                                                        )}
                                                    >
                                                        <div>Select an employee</div>
                                                        <div
                                                            className={s(
                                                                dropdownStyles.dropdownArrow,
                                                                styles.employeeDropdownArrow
                                                            )}
                                                        />
                                                    </div>
                                                </button>
                                            )}
                                            choicesList={() => (
                                                <ul className={dropdownStyles.dropdownList}>
                                                    {employeeDropdown.map(i => (
                                                        <li
                                                            className={dropdownStyles.dropdownListItem}
                                                            key={i.name}
                                                            onClick={() => {
                                                                setSelectedEmployee(i)
                                                            }}
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
                            ) : (
                                selectedEmployee && (
                                    <input
                                        type='text'
                                        className={styles.input}
                                        value={selectedEmployee.name}
                                        onChange={e => setSelectedEmployee({name: e.target.value, id: match.params.id})}
                                    />
                                )
                            )}

                            <div className={styles.text}>Role</div>
                            <input
                                type='text'
                                className={styles.input}
                                value={roleInput}
                                onChange={e => setRoleInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <div className={styles.text}>Date Hired</div>
                        {/* <input type='text' className={styles.input} placeholder={userData.hireDate} /> */}
                        <DatePicker
                            dateFormat='MM/dd/yyyy'
                            placeholderText={userData.hireDate}
                            selected={dateInput}
                            onChange={e => e && setDateInput(e)}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.line} />

                {/* Employee Dept radio buttons */}
                <div className={s(styles.title, styles.paddingTop, styles.paddingBottom)}>Employee Department</div>
                {deptInput && (
                    <div className={styles.employeeDepartment}>
                        <div>
                            {deptsRowOne.map(dept => (
                                <div className={styles.container}>
                                    <input
                                        type='radio'
                                        name='employeeDept'
                                        className={styles.checkmark}
                                        checked={dept.DepartmentId === deptInput.DepartmentId /*userData.department*/}
                                        onChange={() => setDeptInput(dept)}
                                    />
                                    <div className={styles.checkmark} />
                                    <div className={styles.insideCheckmark} />
                                    <img src={icon} className={styles.deptIcon} />
                                    <div className={styles.deptName}>{dept.DepartmentName}</div>
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
                                        checked={dept.DepartmentId === deptInput.DepartmentId /*userData.department*/}
                                        onChange={() => setDeptInput(dept)}
                                    />
                                    <div className={styles.checkmark} />
                                    <div className={styles.insideCheckmark} />
                                    <img src={icon} className={styles.deptIcon} />
                                    <div className={styles.deptName}>{dept.DepartmentName}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.line} />

                {/* Tables */}
                <div className={styles.paddingTop}>
                    <DetailPageTable
                        headers={hardwareHeaders}
                        rows={hardwareRows}
                        setRows={setHardwareRows}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemove}
                    />
                </div>
                {hardwareDropdown && (
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

                <div className={styles.paddingTop}>
                    <DetailPageTable
                        headers={softwareHeaders}
                        rows={softwareRows}
                        setRows={setSoftwareRows}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemove}
                    />
                </div>
                {softwareDropdown && (
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

                <div className={styles.paddingTop}>
                    <DetailPageTable
                        headers={licenseHeaders}
                        rows={licenseRows}
                        setRows={setLicenseRows}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemove}
                    />
                </div>
                {licenseDropdown && (
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

                <div className={styles.submitContainer}>
                    <Button text='Submit' icon='submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
