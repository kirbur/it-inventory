import React, {useState, useEffect, useContext} from 'react'
import {History} from 'history'
import {match} from 'react-router-dom'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {FaUserShield, FaUser} from 'react-icons/fa'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import DatePicker from 'react-datepicker'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'

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
    match: match<{id: string}>
    history: History
}

interface IEmployee {
    isAdmin: boolean
    photo: string
    firstName: string
    lastName: string
    name: string
    department: string
    role: string
    hireDate: string
    hwCost: number
    swCost: number
}

// Primary Component
export const EmployeeDetailEditPage: React.SFC<IEmployeeDetailEditPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)
    const [userData, setUserData] = useState<IEmployee>({
        isAdmin: false,
        photo: '',
        firstName: '',
        lastName: '',
        name: '',
        department: '',
        role: '',
        hireDate: '',
        hwCost: 0,
        swCost: 0,
    })
    const [hardwareRows, setHardwareRows] = useState<{
        assigned: ITableItem[][]
        added: ITableItem[][]
        removed: ITableItem[][]
    }>({
        assigned: [],
        added: [],
        removed: [],
    })
    const [softwareRows, setSoftwareRows] = useState<{
        assigned: ITableItem[][]
        added: ITableItem[][]
        removed: ITableItem[][]
    }>({
        assigned: [],
        added: [],
        removed: [],
    })
    const [licenseRows, setLicenseRows] = useState<{
        assigned: ITableItem[][]
        added: ITableItem[][]
        removed: ITableItem[][]
    }>({
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
    const [roleInput, setRoleInput] = useState<string>('')
    const [changed, setChanged] = useState(false)

    const [hardwareDropdown, setHardwareDropdown] = useState<any[]>([])
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>([])
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>([])

    const [employeeDropdown, setEmployeeDropdown] = useState<any[]>([{name: 'Select A New Employee', id: -1}])
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>(employeeDropdown[0])

    useEffect(() => {
        if (match.params.id === 'new') {
            axios
                .get(`/add/employeePrep/`)
                .then((data: any) => {
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
            axios
                .get(`/detail/employee/${match.params.id}`)
                .then((data: any) => {
                    setUserData({
                        isAdmin: data[0].admin,
                        photo: data[0].picture,
                        firstName: data[0].firstName,
                        lastName: data[0].lastName,
                        name: data[0].firstName + ' ' + data[0].lastName,
                        department: data[0].department,
                        role: data[0].role,
                        hireDate: formatDate(data[0].hireDate),
                        hwCost: Math.round(data[0].totalHardwareCost * 100) / 100,
                        swCost: Math.round(data[0].totalProgramCostPerMonth * 100) / 100,
                    })

                    setAdminInput(data[0].admin)
                    setDateInput(new Date(formatDate(data[0].hireDate)))
                    setRoleInput(data[0].role)
                    setSelectedEmployee({
                        name: data[0].firstName + ' ' + data[0].lastName,
                        id: parseInt(match.params.id),
                    })

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
                                value: '$' + Math.round(i.costPerMonth * 100) / 100,
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

            axios
                .get(`/add/employeePrep/`)
                .then((data: any) => setDeptList(data[0].departments))
                .catch((err: any) => console.error(err))
        }
    }, [])

    //Check the current employees department, if they don't have one yet check the first
    useEffect(() => {
        var d = deptList.filter((i: any) => i.departmentName === userData.department)
        d[0] ? setDeptInput({...d[0]}) : setDeptInput({...deptList[0]})
    }, [deptList, userData.department])

    //If the employee is new add the default hardware and programs to their tables to be assigned to them
    const applyDefaults = () => {
        if (match.params.id === 'new' && deptInput) {
            /*APPLY HARDWARE DEFAULTS */
            if (deptInput.defaultHardware) {
                //clear out added
                setHardwareRows({...hardwareRows, added: []})

                var toBeAdded: any[] = []
                var unavailable: any[] = []

                deptInput.defaultHardware.forEach(need => {
                    var needFulfilled = false
                    hardwareDropdown.map(available => {
                        if (
                            !needFulfilled &&
                            (available.name.search(need) >= 0 || available.id.search(need.toLowerCase()) >= 0)
                        ) {
                            var arr = [
                                {value: available.name, id: available.id, sortBy: available.name},
                                {value: '', id: available.id, sortBy: available.id},
                                {value: '', id: available.id, sortBy: available.id},
                                {value: '', id: available.id, sortBy: available.id},
                            ]

                            toBeAdded.push(arr)
                            needFulfilled = true
                        }
                        return
                    })
                    if (!needFulfilled) {
                        unavailable.push([
                            {value: need + ' is unavailable', id: -1, sortBy: need, unavailable: true},
                            {value: '', id: -1, sortBy: -1},
                            {value: '', id: -1, sortBy: -1},
                            {value: '', id: -1, sortBy: -1},
                        ])
                    }
                })

                //add the hardware defaults
                setHardwareRows({...hardwareRows, added: [...toBeAdded], assigned: [...unavailable]})

                //remove the defaults from the dropdown
                toBeAdded.map(added =>
                    setHardwareDropdown([...hardwareDropdown.filter((option: any) => option.name === added[0].value)])
                )
            }

            if (deptInput.defaultSoftware) {
                /*APPLY SOFTWARE DEFAULTS */
                //clear out added
                setSoftwareRows({...softwareRows, added: []})
                toBeAdded = []
                unavailable = []

                deptInput.defaultSoftware.forEach(need => {
                    var needFulfilled = false
                    softwareDropdown.map(available => {
                        if (!needFulfilled && (available.name.search(need) >= 0 || available.name === need)) {
                            var arr = [
                                {value: available.name, id: available.id, sortBy: available.name},
                                {value: '', id: available.id, sortBy: available.id},
                                {value: '', id: available.id, sortBy: available.id},
                            ]

                            toBeAdded.push(arr)
                            needFulfilled = true
                        }
                        return
                    })
                    if (!needFulfilled) {
                        unavailable.push([
                            {value: need + ' is unavailable', id: -1, sortBy: need, unavailable: true},
                            {value: '', id: -1, sortBy: -1},
                            {value: '', id: -1, sortBy: -1},
                        ])
                    }
                })

                //add the software defaults
                setSoftwareRows({...softwareRows, added: [...toBeAdded], assigned: [...unavailable]})

                //remove the defaults from the dropdown
                toBeAdded.map(added =>
                    setSoftwareDropdown([...softwareDropdown.filter((option: any) => option.name === added[0].value)])
                )
            }

            if (deptInput.defaultLicenses) {
                /*APPLY LICENSE DEFAULTS */
                //clear out added
                setLicenseRows({...licenseRows, added: []})
                toBeAdded = []
                unavailable = []

                deptInput.defaultLicenses.forEach(need => {
                    var needFulfilled = false
                    licenseDropdown.map(available => {
                        if (!needFulfilled && (available.name.search(need) >= 0 || available.name === need)) {
                            var arr = [
                                {value: available.name, id: available.id, sortBy: available.name},
                                {value: '', id: available.id, sortBy: available.id},
                                {value: '', id: available.id, sortBy: available.id},
                                {value: '', id: available.id, sortBy: available.id},
                            ]

                            toBeAdded.push(arr)
                            needFulfilled = true
                        }
                        return
                    })
                    if (!needFulfilled) {
                        unavailable.push([
                            {value: need + ' is unavailable', id: -1, sortBy: need, unavailable: true},
                            {value: '', id: -1, sortBy: -1},
                            {value: '', id: -1, sortBy: -1},
                            {value: '', id: -1, sortBy: -1},
                        ])
                    }
                })

                //add the license defaults
                setLicenseRows({...licenseRows, added: [...toBeAdded], assigned: [...unavailable]})

                //remove the defaults from the dropdown
                toBeAdded.map(added =>
                    setLicenseDropdown([...licenseDropdown.filter((option: any) => option.name === added[0].value)])
                )
            }
        }
    }

    const handleAddHardware = (newRow: any) => {
        setChanged(true)
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
        setChanged(true)
        //if its in added then remove it
        var arr = hardwareRows.added.filter((add: any) => add[0].id !== row[0].id)

        //add to removed array
        setHardwareRows({...hardwareRows, added: [...arr], removed: [...hardwareRows.removed, [...row]]})

        //add it to the dropdown
        var drop = {name: row[0].value, id: row[0].id}
        setHardwareDropdown([...hardwareDropdown, drop])
    }

    const handleAddSoftware = (newRow: any) => {
        setChanged(true)
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
        setChanged(true)
        //if its in added then remove it
        var arr = softwareRows.added.filter((add: any) => add[0].id !== row[0].id)

        //add to removed array
        setSoftwareRows({...softwareRows, added: [...arr], removed: [...softwareRows.removed, [...row]]})

        //add it to the dropdown
        var drop = {name: row[0].value, id: row[0].id}
        setSoftwareDropdown([...softwareDropdown, drop])
    }

    const handleAddLicense = (newRow: any) => {
        setChanged(true)
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
        setChanged(true)
        //if its in added then remove it
        var arr = licenseRows.added.filter((add: any) => add[0].id !== row[0].id)

        //add to removed array
        setLicenseRows({...licenseRows, added: [...arr], removed: [...licenseRows.removed, [...row]]})

        //add it to the dropdown
        var drop = {name: row[0].value, id: row[0].id}
        setLicenseDropdown([...licenseDropdown, drop])
    }

    async function handleSubmit() {
        var name = ['first', 'last']
        var msg = ''

        /*ADD NEW EMPLOYEE */
        if (
            //make sure no inputs are null/undefined/empty
            match.params.id === 'new' &&
            deptInput &&
            selectedEmployee.name !== 'Select An Employee' &&
            roleInput !== ''
        ) {
            name = selectedEmployee.name.split(' ')
            var postEmployee = {
                Employee: {
                    FirstName: name.shift(),
                    LastName: name.join(''),
                    HireDate: dateInput.toISOString(),
                    Role: roleInput,
                    DepartmentID: deptInput.departmentId,
                    IsAdmin: adminInput,
                },
                HardwareAssigned: [
                    ...hardwareRows.added.map(i => {
                        var hw = i[0].id ? i[0].id.toString().split('/') : [null, null]
                        return {Type: hw[0], ID: hw[1]}
                    }),
                ],
                ProgramAssigned: [
                    ...softwareRows.added.map(i => {
                        return {ID: i[0].id}
                    }),
                    ...licenseRows.added.map(i => {
                        return {ID: i[0].id}
                    }),
                ],
            }

            await axios
                .post('/add/Employee', postEmployee)
                .then((response: any) => {
                    if (response && response.status === 201) {
                        window.alert(`${selectedEmployee.name} was successfully added!`)
                    }
                })
                .catch((err: any) => {
                    window.alert(`Something went wrong`)
                    console.error(err)
                })

            history.push(`/employees`)
        } else if (match.params.id === 'new') {
            //one or maore of the inputs was null/undefined/empty
            msg = 'Failed because:\n'
            msg += selectedEmployee.name === 'Select An Employee' ? 'No employee was selected,\n' : ''
            msg += roleInput === '' ? 'No role was given,' : ''

            window.alert(msg)
        }

        /*UPDATE EMPLOYEE */
        if (
            //make sure no inputs are null/undefined/empty
            match.params.id !== 'new' &&
            deptInput &&
            selectedEmployee.name &&
            roleInput &&
            changed
        ) {
            name = selectedEmployee.name.split(' ')
            var updateEmployee = {
                Employee: {
                    EmployeeId: match.params.id,
                    FirstName: name.shift(),
                    LastName: name.join(''),
                    HireDate: dateInput.toISOString(),
                    Role: roleInput,
                    DepartmentID: deptInput.departmentId,
                    IsAdmin: adminInput,
                },
                HardwareAssigned: [
                    ...hardwareRows.added.map(i => {
                        var hw = i[0].id ? i[0].id.toString().split('/') : [null, null]
                        return {Type: hw[0], ID: hw[1]}
                    }),
                ],
                ProgramAssigned: [
                    ...softwareRows.added.map(i => {
                        return {ID: i[0].id}
                    }),
                    ...licenseRows.added.map(i => {
                        return {ID: i[0].id}
                    }),
                ],

                HardwareUnassigned: [
                    ...hardwareRows.removed.map(i => {
                        var hw = i[0].id ? i[0].id.toString().split('/') : [null, null]
                        return {Type: hw[0], ID: hw[1]}
                    }),
                ],
                ProgramUnassigned: [
                    ...softwareRows.removed.map(i => {
                        return {ID: i[0].id}
                    }),
                    ...licenseRows.removed.map(i => {
                        return {ID: i[0].id}
                    }),
                ],
            }

            await axios
                .put(`/update/Employee`, updateEmployee)
                .then((response: any) => {
                    if (response.status >= 400) {
                        console.error(response)
                    }
                })
                .catch((err: any) => {
                    window.alert(`Something went wrong`)
                    console.error(err)
                })

            history.push(`/employees/details/${match.params.id}`)
        } else if (match.params.id !== 'new' && changed) {
            //one or maore of the inputs was null/undefined/empty
            msg = 'Failed because:\n'

            msg += selectedEmployee.name === ('' || ' ') ? 'Name feild is empty,' : ''
            msg += roleInput === '' ? 'Role feild is empty,' : ''

            window.alert(msg)
        }

        /*CHANGE IMAGE */
        if (imgInput) {
            var formData = new FormData()
            formData.append('file', imgInput)

            await axios
                .put(userData.photo, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                .catch(err => console.error(err))
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
                    {value: add[0].value, id: add[0].id, sortBy: add[0].sortBy, unavailable: add[0].unavailable},
                    {value: add[1].value, id: add[1].id, sortBy: add[1].sortBy},
                    {value: add[2].value, id: add[2].id, sortBy: add[2].sortBy},
                    {value: add[3].value, id: add[3].id, sortBy: add[3].sortBy},
                ])
            }
            if (type === 'sw') {
                arr.push([
                    {value: add[0].value, id: add[0].id, sortBy: add[0].sortBy, unavailable: add[0].unavailable},
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
                            history.push(`/employees/details/${match.params.id}`)
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                )}

                <PictureInput setImage={setImgInput} image={imgInput} />
            </div>
            {/* column 2 */}
            <div className={styles.secondColumn}>
                {/* name and date */}
                <div className={styles.title}>Employee Information</div>

                {/* Admin/nonadmin radio cards */}
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
                                    onChange={() => {
                                        setAdminInput(true)
                                        setChanged(true)
                                    }}
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
                                onChange={() => {
                                    setAdminInput(false)
                                    setChanged(true)
                                }}
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
                                        onChange={e => {
                                            setSelectedEmployee({name: e.target.value, id: parseInt(match.params.id)})
                                            setChanged(true)
                                        }}
                                    />
                                )
                            )}

                            <div className={styles.text}>Role</div>
                            <input
                                type='text'
                                className={styles.input}
                                value={roleInput}
                                onChange={e => {
                                    setRoleInput(e.target.value)
                                    setChanged(true)
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className={styles.text}>Date Hired</div>
                        <DatePicker
                            dateFormat='MM/dd/yyyy'
                            placeholderText={userData.hireDate}
                            selected={dateInput}
                            onChange={e => {
                                e && setDateInput(e)
                                setChanged(true)
                            }}
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
                            <div key={dept.departmentId} className={styles.container}>
                                <input
                                    type='radio'
                                    name='employeeDept'
                                    className={styles.checkmark}
                                    checked={dept.departmentId === deptInput.departmentId}
                                    onChange={() => {
                                        setDeptInput(dept)
                                        applyDefaults()
                                        setChanged(true)
                                    }}
                                />
                                <div className={styles.checkmark} />
                                <div className={styles.insideCheckmark} />
                                <img src={dept.icon} alt={''} className={styles.deptIcon} />
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
                        setRows={() => {}}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemoveHardware}
                        // sorting={false}
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
                        setRows={() => {}}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemoveSoftware}
                        // sorting={false}
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
                        setRows={() => {}}
                        style={styles.newRowThing}
                        edit={true}
                        remove={handleRemoveLicence}
                        // sorting={false}
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
