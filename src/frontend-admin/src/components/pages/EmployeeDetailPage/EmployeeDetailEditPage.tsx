import React, {useState, useEffect, useContext} from 'react'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {IoIosPersonAdd, IoMdAdd} from 'react-icons/io'
import {GoCloudUpload, GoDiffAdded} from 'react-icons/go'
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
interface IDepartment {
    departmentName: string
    departmentId: number
    icon: string
    defaultHardware: string[]
    defaultSoftware: string[]
    defaultLicenses: string[]
}

interface IEmployeeDetailEditPageProps {
    match: any
    history: any
}

// Primary Component
export const EmployeeDetailEditPage: React.SFC<IEmployeeDetailEditPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)
    const [userData, setUserData] = useState<any>({})
    const [hardwareRows, setHardwareRows] = useState<{assigned: any[]; added: any[]; removed: any[]}>({
        assigned: [],
        added: [],
        removed: [],
    })
    const [softwareRows, setSoftwareRows] = useState<{assigned: any[]; added: any[]; removed: any[]}>({
        assigned: [],
        added: [],
        removed: [],
    })
    const [licenseRows, setLicenseRows] = useState<{assigned: any[]; added: any[]; removed: any[]}>({
        assigned: [],
        added: [],
        removed: [],
    })

    const hardwareHeaders = ['Hardware', 'Serial Number', 'MFG Tag', 'Purchase Date']
    const softwareHeaders = ['Software', 'Key/Username', 'Monthly Cost']
    const licenseHeaders = ['Licenses', 'Key/Username', 'Monthly Cost', 'CALs']

    const [deptList, setDeptList] = useState<IDepartment[]>([])

    //input feild states:
    const [dateInput, setDateInput] = useState<Date>(new Date())
    const [deptInput, setDeptInput] = useState<IDepartment>()
    const [adminInput, setAdminInput] = useState<boolean>()
    const [imgInput, setImgInput] = useState<File>()
    const [roleInput, setRoleInput] = useState<string>()

    const [hardwareDropdown, setHardwareDropdown] = useState<any[]>([])
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>([])
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>([])

    const [employeeDropdown, setEmployeeDropdown] = useState<any[]>([{name: 'Select An Employee', id: -1}])
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>(employeeDropdown[0])

    useEffect(() => {
        if (match.params.id === 'new') {
            //TODO: populate all 4 dropdowns
            //employee dropdown with employees
            //and available hw/progs

            axios //TODO: get from edit endpoint
                .get(`/add/employeePrep/`)
                .then((data: any) => {
                    console.log(data)

                    var availableEmp: any[] = []
                    data[0].myDomainUsers
                        .sort()
                        .map((emp: any, index: number) => availableEmp.push({name: emp, id: index}))

                    setEmployeeDropdown(availableEmp)

                    setDeptList(data[0].departments)

                    let uhw: any[] = []
                    data[0].unassignedHardware.map((i: any) =>
                        uhw.push({
                            name: i.monitorName ? i.monitorName : i.compName ? i.compName : i.periphName,
                            id: i.monitorId
                                ? i.type.toLowerCase() + '/' + i.monitorId
                                : i.computerId
                                ? i.type.toLowerCase() + '/' + i.computerId
                                : i.type.toLowerCase() + '/' + i.peripheralId,
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
                                id: format(i.type.toLowerCase() + '/' + i.id),
                                sortBy: i.make + ' ' + i.model,
                            },
                            {value: format(i.serialNumber), id: format(i.id), sortBy: i.serialNumber},
                            {value: format(i.mfg), id: format(i.id), sortBy: i.mfg},
                            {value: formatDate(i.purchaseDate), id: format(i.id), sortBy: i.purchaseDate},
                        ])
                    )
                    setHardwareRows({...hardwareRows, assigned: [...hw]})

                    let sw: any[] = []
                    data[0].software.map((i: any) =>
                        sw.push([
                            {
                                value: format(i.name),
                                id: format(i.id),
                                sortBy: i.name,
                            },
                            {value: format(i.licenseKey), id: format(i.id), sortBy: i.licenseKey},
                            {
                                value: '$' + format(Math.round(i.costPerMonth * 100) / 100),
                                id: format(i.id),
                                sortBy: i.costPerMonth,
                            },
                        ])
                    )
                    setSoftwareRows({...softwareRows, assigned: [...sw]})

                    let l: any[] = []
                    data[0].licenses.map((i: any) =>
                        l.push([
                            {
                                value: format(i.name),
                                id: format(i.id),
                                sortBy: i.name,
                            },
                            {
                                value: format(i.licenseKey),
                                id: format(i.id),
                                sortBy: format(i.licenseKey),
                            },
                            {
                                value: '$' + format(Math.round(i.costPerMonth * 100) / 100),
                                sortBy: i.costPerMonth,
                            },
                            {value: format(i.cals), id: format(i.id), sortBy: i.cals},
                        ])
                    )
                    setLicenseRows({...licenseRows, assigned: [...l]})

                    let uhw: any[] = []
                    data[0].unassignedHardware.map((i: any) =>
                        uhw.push({
                            name: i.monitorName ? i.monitorName : i.compName ? i.compName : i.periphName,
                            id: i.monitorId
                                ? i.type.toLowerCase() + '/' + i.monitorId
                                : i.computerId
                                ? i.type.toLowerCase() + '/' + i.computerId
                                : i.type.toLowerCase() + '/' + i.peripheralId,
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
        var d = deptList.filter((i: any) => i.DepartmentName === userData.department)
        d[0] ? setDeptInput({...d[0]}) : setDeptInput({...deptList[0]})
    }, [deptList])

    useEffect(() => {
        if (match.params.id === 'new' && deptInput) {
            //Add defaults to [type].added
            //deptInput.defaultHardware.map(hw => handleAddHardware({name: hw, id: }))
            hardwareDropdown.map(available => {
                // deptInput.defaultHardware.map( (default: string) => {
                //     // if() {
                //     // }
                // })
            })
        }
    }, [deptInput])

    const handleAddHardware = (newRow: any) => {
        //first add to displayed table
        var arr = [
            [
                {value: newRow.name, id: newRow.id, sortBy: newRow.name},
                {value: '', id: newRow.id, sortBy: newRow.id},
                {value: '', id: newRow.id, sortBy: newRow.id},
                {value: '', id: newRow.id, sortBy: newRow.id},
            ],
        ]

        //take it out of remove if its there
        var rem = hardwareRows.removed.filter((remove: any) => remove[0].id !== arr[0][0].id)
        setHardwareRows({...hardwareRows, removed: [...rem]})

        //dont put in added if its already assigned
        var isAssigned = hardwareRows.assigned.filter((add: any) => add[0].id === arr[0][0].id)
        if (isAssigned.length <= 0) {
            setHardwareRows({...hardwareRows, added: [...hardwareRows.added, ...arr]})
        }

        //remove it from the dropdown list
        var drop = hardwareDropdown.filter((option: any) => option !== newRow)
        setHardwareDropdown([...drop])
    }

    const handleRemoveHardware = (row: any) => {
        //if its in added then remove it
        var arr = hardwareRows.added.filter((add: any) => add[0].id !== row[0].id)

        //add to removed array
        setHardwareRows({...hardwareRows, added: [...arr], removed: [...hardwareRows.removed, [...row]]})

        //add it to the dropdown
        var drop = {name: row[0].value, id: row[0].id}
        setHardwareDropdown([...hardwareDropdown, drop])
    }

    const handleAddSoftware = (newRow: any) => {
        var arr = [
            [
                {value: newRow.name, id: newRow.id, sortBy: newRow.name},
                {value: '', id: newRow.id, sortBy: newRow.id},
                {value: '', id: newRow.id, sortBy: newRow.id},
            ],
        ]
        //take it out of remove if its there
        var rem = softwareRows.removed.filter((remove: any) => remove[0].id !== arr[0][0].id)
        setSoftwareRows({...softwareRows, removed: [...rem]})

        //dont put in added if its already assigned
        var isAssigned = softwareRows.assigned.filter((add: any) => add[0].id === arr[0][0].id)
        if (isAssigned.length <= 0) {
            setSoftwareRows({...softwareRows, added: [...softwareRows.added, ...arr]})
        }

        //remove it from the dropdown list
        var drop = softwareDropdown.filter((option: any) => option !== newRow)
        setSoftwareDropdown([...drop])
    }
    const handleRemoveSoftware = (row: any) => {
        //if its in added then remove it
        var arr = softwareRows.added.filter((add: any) => add[0].id !== row[0].id)

        //add to removed array
        setSoftwareRows({...softwareRows, added: [...arr], removed: [...softwareRows.removed, [...row]]})

        //add it to the dropdown
        var drop = {name: row[0].value, id: row[0].id}
        setSoftwareDropdown([...softwareDropdown, drop])
    }

    const handleAddLicense = (newRow: any) => {
        var arr = [
            [
                {value: newRow.name, id: newRow.id, sortBy: newRow.name},
                {value: '', id: newRow.id, sortBy: newRow.id},
                {value: '', id: newRow.id, sortBy: newRow.id},
                {value: '', id: newRow.id, sortBy: newRow.id},
            ],
        ]
        //take it out of remove if its there
        var rem = licenseRows.removed.filter((remove: any) => remove[0].id !== arr[0][0].id)
        setLicenseRows({...licenseRows, removed: [...rem]})

        //dont put in added if its already assigned
        var isAssigned = licenseRows.assigned.filter((add: any) => add[0].id === arr[0][0].id)
        if (isAssigned.length <= 0) {
            setLicenseRows({...licenseRows, added: [...licenseRows.added, ...arr]})
        }

        //remove it from the dropdown list
        var drop = licenseDropdown.filter((option: any) => option !== newRow)
        setLicenseDropdown([...drop])
    }

    const handleRemoveLicence = (row: any) => {
        //if its in added then remove it
        var arr = licenseRows.added.filter((add: any) => add[0].id !== row[0].id)

        //add to removed array
        setLicenseRows({...licenseRows, added: [...arr], removed: [...licenseRows.removed, [...row]]})

        //add it to the dropdown
        var drop = {name: row[0].value, id: row[0].id}
        setLicenseDropdown([...licenseDropdown, drop])
    }

    const handleSubmit = () => {
        //TODO: post request
        //everything in every removed array needs to be unassigned
        //everything in every added array needs to be assigned

        //post image

        if (imgInput) {
            var formData = new FormData()
            formData.append('file', imgInput)

            axios
                .put(userData.photo, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                .then(data => console.log(data))
                .catch(err => console.error(err))
        }

        if (window.confirm('Finished Editing?')) {
            history.push(`/employees/${match.params.id}`)
        }
    }

    const displayTable = (rows: any, type: string) => {
        let arr: any[] = []

        if (rows.removed.length === 0) {
            arr = [...rows.assigned]
        } else {
            var bools: any[] = [] //bools[i] will be true if assigned[i] is not in removed
            rows.assigned.forEach((row: any, index: number) => {
                bools[index] = true
                rows.removed.forEach((remove: any) => {
                    bools[index] = bools[index] && remove[0].id !== row[0].id
                })
            })
            rows.assigned.forEach((row: any, index: number) => {
                if (bools[index]) {
                    arr.push(row)
                }
            })
        }

        rows.added.map((add: any) => {
            if (type === 'hw' || type === 'l') {
                arr.push([
                    {value: add[0].value, id: add[0].id, sortBy: add[0].sortBy},
                    {value: add[1].value, id: add[1].id, sortBy: add[1].sortBy},
                    {value: add[2].value, id: add[2].id, sortBy: add[2].sortBy},
                    {value: add[3].value, id: add[3].id, sortBy: add[3].sortBy},
                ])
            }
            if (type === 'sw') {
                arr.push([
                    {value: add[0].value, id: add[0].id, sortBy: add[0].sortBy},
                    {value: add[1].value, id: add[1].id, sortBy: add[1].sortBy},
                    {value: add[2].value, id: add[2].id, sortBy: add[2].sortBy},
                ])
            }
        })

        return arr
    }

    return (
        <div className={styles.columns}>
            {/* column 1 */}

            <div className={styles.firstColumn}>
                {match.params.id === 'new' ? (
                    <Button
                        text={'All Employees'}
                        icon='back'
                        onClick={() => {
                            history.push(`/employees`)
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                ) : (
                    <Button
                        text={userData.name}
                        icon='back'
                        onClick={() => {
                            history.push(`/employees/${match.params.id}`)
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                )}
                <div className={styles.imgPadding}>
                    {/* <ImageInput /> */}
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
                                                        <div>{selectedEmployee.name}</div>
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
                                                <ul className={s(dropdownStyles.dropdownList, styles.dropdownList)}>
                                                    {employeeDropdown.map(i => (
                                                        <li
                                                            className={dropdownStyles.dropdownListItem}
                                                            key={i.id}
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
                {deptInput && deptList && (
                    <div className={styles.employeeDepartment}>
                        {deptList.map((dept: any) => (
                            <div className={styles.container}>
                                <input
                                    type='radio'
                                    name='employeeDept'
                                    className={styles.checkmark}
                                    checked={dept.departmentId === deptInput.departmentId}
                                    onChange={() => setDeptInput(dept)}
                                />
                                <div className={styles.checkmark} />
                                <div className={styles.insideCheckmark} />
                                <img src={dept.icon} className={styles.deptIcon} />
                                <div className={styles.deptName}>{dept.departmentName}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.line} />

                {/* Tables */}
                <div className={styles.paddingTop}>
                    <DetailPageTable
                        headers={hardwareHeaders}
                        rows={displayTable(hardwareRows, 'hw')}
                        setRows={setHardwareRows}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemoveHardware}
                    />
                </div>
                {hardwareDropdown && (
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
                                                key={i.id}
                                                onClick={() => handleAddHardware(i)}
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
                        rows={displayTable(softwareRows, 'sw')}
                        setRows={setSoftwareRows}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemoveSoftware}
                    />
                </div>
                {softwareDropdown && (
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
                                    <ul className={s(dropdownStyles.dropdownList, styles.dropdownList)}>
                                        {softwareDropdown.map(i => (
                                            <li
                                                className={dropdownStyles.dropdownListItem}
                                                key={i.id}
                                                onClick={() => handleAddSoftware(i)}
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
                        rows={displayTable(licenseRows, 'l')}
                        setRows={setLicenseRows}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemoveLicence}
                    />
                </div>
                {licenseDropdown && (
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
                                    <ul className={s(dropdownStyles.dropdownList, styles.dropdownList)}>
                                        {licenseDropdown.map(i => (
                                            <li
                                                className={dropdownStyles.dropdownListItem}
                                                key={i.id}
                                                onClick={() => handleAddLicense(i)}
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
