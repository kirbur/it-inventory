import React, {useState, useEffect, useContext} from 'react'
import {History} from 'history'
import {match} from 'react-router-dom'

// Components
import {DetailPageTable, ITableItem} from '../../reusables/DetailPageTable/DetailPageTable'
import {FaUserShield, FaUser} from 'react-icons/fa'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import DatePicker from 'react-datepicker'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import {AddDropdown} from '../../reusables/Dropdown/AddDropdown'
import {BackButton} from '../../reusables/BackButton/BackButton'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {checkImage} from '../../../utilities/CheckImage'

// Styles
import styles from './EmployeeDetailEditPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'
import {Button} from '../../reusables/Button/Button'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {LoginContext} from '../../App/App'
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import deptPlaceholder from '../../../content/Images/Placeholders/department-placeholder.png'

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

    const {loginContextVariables} = useContext(LoginContext)

    const axios = new AxiosService(loginContextVariables)
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
    const licenseHeaders = ['Licenses', 'Key/Username', 'Monthly Cost']

    const [deptList, setDeptList] = useState<IDepartment[]>([])
    const [deptImages, setDeptImages] = useState<{id: number; img: string}[]>([])
    const [useImages, setUseImages] = useState(false)

    //input feild states:
    const [dateInput, setDateInput] = useState<Date>(new Date())
    const [deptInput, setDeptInput] = useState<IDepartment>()
    const [adminInput, setAdminInput] = useState<boolean>(false)
    const [imgInput, setImgInput] = useState<File>()
    const [roleInput, setRoleInput] = useState<string>('')
    const [changed, setChanged] = useState(false)
    const [descriptionInput, setDescriptionInput] = useState('')

    const [hardwareDropdown, setHardwareDropdown] = useState<any[]>([])
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>([])
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>([])

    const [employeeDropdown, setEmployeeDropdown] = useState<any[]>([{name: 'Select A New Employee', id: -1}])
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>(employeeDropdown[0])

    useEffect(() => {
        axios
            .get(`/add/employeePrep/`)
            .then((data: any) => {
                var availableEmp: any[] = []
                data[0].myDomainUsers.sort().map((emp: any, index: number) => availableEmp.push({name: emp, id: index}))
                setEmployeeDropdown(availableEmp)

                setDeptList(data[0].departments)
                setUseImages(true)

                let uhw: any[] = []
                data[0].unassignedHardware.map((i: any) =>
                    uhw.push({
                        name: i.hardwareName,
                        id: i.type.toLowerCase() + '/' + i.hardwareId,
                        serialNumber: format(i.serialNumber),
                        mfg: format(i.mfg),
                        purchaseDate: formatDate(i.purchaseDate),
                    })
                )
                setHardwareDropdown(uhw)

                let usw: any[] = []
                data[0].unassignedSoftware.map((i: any) =>
                    usw.push({
                        name: i.programName,
                        id: i.programId,
                        key: format(i.programLicenseKey),
                        monthlyCost: '$' + i.monthlyCost,
                    })
                )
                setSoftwareDropdown(usw)

                let ul: any[] = []
                data[0].unassignedLicenses.map((i: any) =>
                    ul.push({
                        name: i.programName,
                        id: i.programId,
                        key: format(i.programLicenseKey),
                        monthlyCost: '$' + i.monthlyCost,
                    })
                )
                setLicenseDropdown(ul)
            })
            .catch((err: any) => console.error(err))
        if (match.params.id !== 'new') {
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
                    setDescriptionInput(data[0].textField)
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
                })
                .catch((err: any) => console.error(err))

            axios
                .get(`/add/employeePrep/`)
                .then((data: any) => {
                    setDeptList(data[0].departments)

                    setUseImages(true)
                })
                .catch((err: any) => console.error(err))
        }
    }, [])

    //Set display Images
    useEffect(() => {
        deptList.map((dept: any) =>
            checkImage(dept.icon, axios, deptPlaceholder).then(data => {
                var list = deptList.filter(i => i.departmentId !== dept.departmentId)
                setDeptList([...list, {...dept, icon: data}])
                deptImages.push({id: dept.departmentId, img: data})
            })
        )
    }, [useImages])

    //Check the current employees department, if they don't have one yet check the first
    useEffect(() => {
        var d = deptList.filter((i: any) => i.departmentName === userData.department)
        d[0] ? setDeptInput({...d[0]}) : setDeptInput({...deptList[0]})
        d[0] ? applyDefaults({...d[0]}) : applyDefaults({...deptList[0]})
    }, [deptList, userData.department])

    //If the employee is new add the default hardware and programs to their tables to be assigned to them
    const applyDefaults = (dept: IDepartment) => {
        if (match.params.id === 'new' && dept) {
            /*APPLY HARDWARE DEFAULTS */
            if (dept.defaultHardware) {
                //clear out added
                hardwareRows.added.map(add => {
                    if (!hardwareDropdown.filter(item => item.id === add[0].id).length) {
                        hardwareDropdown.push({
                            name: add[0].value.toString(),
                            id: add[0].id ? add[0].id.toString() : '',
                            serialNumber: add[1].value.toString(),
                            mfg: add[2].value.toString(),
                            purchaseDate: add[3].value.toString(),
                        })
                    }
                })
                setHardwareRows({...hardwareRows, added: []})

                var toBeAdded: any[] = []
                var unavailable: any[] = []

                dept.defaultHardware.forEach(need => {
                    var needFulfilled = false
                    hardwareDropdown.map(available => {
                        if (
                            !needFulfilled &&
                            (available.name.search(need) >= 0 || available.id.search(need.toLowerCase()) >= 0)
                        ) {
                            var arr = [
                                {value: available.name, id: available.id, sortBy: available.name},
                                {value: available.serialNumber, id: available.id, sortBy: available.serialNumber},
                                {value: available.mfg, id: available.id, sortBy: available.mfg},
                                {value: available.purchaseDate, id: available.id, sortBy: available.purchaseDate},
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
                    setHardwareDropdown([...hardwareDropdown.filter((option: any) => option.name !== added[0].value)])
                )
            }

            if (dept.defaultSoftware) {
                /*APPLY SOFTWARE DEFAULTS */
                //clear out added
                softwareRows.added.map(add => {
                    if (!softwareDropdown.filter(item => item.id === add[0].id).length) {
                        softwareDropdown.push({
                            name: add[0].value.toString(),
                            id: add[0].id ? add[0].id.toString() : '',
                            key: add[1].value.toString(),
                            monthlyCost: add[2].value.toString(),
                        })
                    }
                })
                setSoftwareRows({...softwareRows, added: []})
                toBeAdded = []
                unavailable = []

                dept.defaultSoftware.forEach(need => {
                    var needFulfilled = false
                    softwareDropdown.map(available => {
                        if (!needFulfilled && (available.name.search(need) >= 0 || available.name === need)) {
                            var arr = [
                                {value: available.name, id: available.id, sortBy: available.name},
                                {value: available.key, id: available.id, sortBy: available.key},
                                {value: available.monthlyCost, id: available.id, sortBy: available.monthlyCost},
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
                    setSoftwareDropdown([...softwareDropdown.filter((option: any) => option.name !== added[0].value)])
                )
            }

            if (dept.defaultLicenses) {
                /*APPLY LICENSE DEFAULTS */
                //clear out added
                licenseRows.added.map(add => {
                    if (!licenseDropdown.filter(item => item.id === add[0].id).length) {
                        licenseDropdown.push({
                            name: add[0].value.toString(),
                            id: add[0].id ? add[0].id.toString() : '',
                            key: add[1].value.toString(),
                            monthlyCost: add[2].value.toString(),
                        })
                    }
                })
                setLicenseRows({...licenseRows, added: []})
                toBeAdded = []
                unavailable = []

                dept.defaultLicenses.forEach(need => {
                    var needFulfilled = false
                    licenseDropdown.map(available => {
                        if (!needFulfilled && (available.name.search(need) >= 0 || available.name === need)) {
                            var arr = [
                                {value: available.name, id: available.id, sortBy: available.name},
                                {value: available.key, id: available.id, sortBy: available.key},
                                {value: available.monthlyCost, id: available.id, sortBy: available.monthlyCost},
                                {value: '', id: available.id, sortBy: ''},
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
                    setLicenseDropdown([...licenseDropdown.filter((option: any) => option.name !== added[0].value)])
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
                {value: newRow.serialNumber, id: newRow.id, sortBy: newRow.serialNumber},
                {value: newRow.mfg, id: newRow.id, sortBy: newRow.mfg},
                {value: newRow.purchaseDate, id: newRow.id, sortBy: newRow.purchaseDate},
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
        var drop = {
            name: row[0].value,
            id: row[0].id,
            serialNumber: row[1].value,
            mfg: row[2].value,
            purchaseDate: row[3].value,
        }
        setHardwareDropdown([...hardwareDropdown, drop])
    }

    const handleAddSoftware = (newRow: any) => {
        setChanged(true)
        var arr = [
            [
                {value: newRow.name, id: newRow.id, sortBy: newRow.name},
                {value: newRow.key, id: newRow.id, sortBy: newRow.key},
                {value: newRow.monthlyCost, id: newRow.id, sortBy: newRow.monthlyCost},
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
        var drop = {
            name: row[0].value,
            id: row[0].id,
            key: row[1].id,
            monthlyCost: row[2].id,
        }
        setSoftwareDropdown([...softwareDropdown, drop])
    }

    const handleAddLicense = (newRow: any) => {
        setChanged(true)
        var arr = [
            [
                {value: newRow.name, id: newRow.id, sortBy: newRow.name},
                {value: newRow.key, id: newRow.id, sortBy: newRow.key},
                {value: newRow.monthlyCost, id: newRow.id, sortBy: newRow.monthlyCost},
                {value: '', id: newRow.id, sortBy: ''},
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
        var drop = {
            name: row[0].value,
            id: row[0].id,
            key: row[1].value,
            monthlyCost: row[2].value,
        }
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
            selectedEmployee.name !== 'Select A New Employee'
        ) {
            name = selectedEmployee.name.split(' ')
            var postEmployee = {
                Employee: {
                    FirstName: name.shift(),
                    LastName: name.join(''),
                    HireDate: dateInput.toISOString(),
                    Role: roleInput ? roleInput : deptInput.departmentName,
                    DepartmentID: deptInput.departmentId,
                    IsAdmin: adminInput,
                    TextField: descriptionInput,
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
                .catch((err: any) => console.error(err))

            history.push({pathname: `/employees`, state: {prev: history.location}})
        } else if (match.params.id === 'new') {
            selectedEmployee.name === 'Select A New Employee' && window.alert('No employee was selected')
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
                    TextField: descriptionInput,
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

            await axios.put(`/update/Employee`, updateEmployee).catch((err: any) => console.error(err))

            history.push({pathname: `/employees/detail/${match.params.id}`, state: {prev: history.location}})
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
            history.push({pathname: `/employees/detail/${match.params.id}`, state: {prev: history.location}})
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
                <BackButton history={history} className={styles.backButton} />
                <div className={styles.imgContainer}>
                    <PictureInput setImage={setImgInput} image={imgInput} />
                </div>
            </div>
            {/* column 2 */}
            <div className={styles.secondColumn}>
                {/* name and date */}
                <div className={s(styles.title, styles.paddingTop)}>Employee Information</div>

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
                                        applyDefaults(dept)
                                        setChanged(true)
                                    }}
                                />
                                <div className={styles.checkmark} />
                                <div className={styles.insideCheckmark} />
                                <div className={styles.deptIconContainer}>
                                    {deptImages &&
                                    deptImages.filter(x => x.id === dept.departmentId) &&
                                    deptImages.filter(x => x.id === dept.departmentId)[0] ? (
                                        <img
                                            src={deptImages.filter(x => x.id === dept.departmentId)[0].img}
                                            alt={''}
                                            className={styles.deptIcon}
                                        />
                                    ) : (
                                        <img src={deptPlaceholder} alt={''} className={styles.deptIcon} />
                                    )}
                                </div>
                                <div className={styles.deptName}>{dept.departmentName}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.line} />

                {/* Tables */}
                <div className={styles.tableContainer}>
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
                        <AddDropdown
                            title={'Assign new hardware'}
                            content={hardwareDropdown}
                            onSelect={handleAddHardware}
                            className={s(styles.moveItRight, styles.dropdown3)}
                        />
                    )}

                    <div className={styles.paddingTop}>
                        <DetailPageTable
                            headers={softwareHeaders}
                            rows={displayTable(softwareRows, 'sw')}
                            setRows={() => {}}
                            style={styles.newRowThing}
                            className={styles.paddingTop}
                            edit={true}
                            remove={handleRemoveSoftware}
                            // sorting={false}
                        />
                        <div className={styles.ddc2}>
                            {softwareDropdown && (
                                <AddDropdown
                                    title={'Assign new software'}
                                    content={softwareDropdown}
                                    onSelect={handleAddSoftware}
                                    className={s(styles.moveItRight, styles.dropdown2)}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.paddingTop}>
                        <DetailPageTable
                            headers={licenseHeaders}
                            rows={displayTable(licenseRows, 'l')}
                            setRows={() => {}}
                            style={styles.newRowThing}
                            edit={true}
                            remove={handleRemoveLicence}
                        />
                    </div>

                    <div className={styles.ddc1}>
                        {licenseDropdown && (
                            <AddDropdown
                                title={'Assign new license'}
                                content={licenseDropdown}
                                onSelect={handleAddLicense}
                                className={s(styles.moveItRight, styles.dropdown1)}
                            />
                        )}
                    </div>
                </div>

                <div className={s(styles.inputContainer, styles.descriptionContainer)}>
                    <div className={styles.text}>Description</div>
                    <textarea
                        className={s(styles.input, styles.description)}
                        value={descriptionInput}
                        onChange={e => {
                            setChanged(true)
                            setDescriptionInput(e.target.value)
                        }}
                    />
                </div>

                <div className={styles.submitContainer}>
                    <Button text='Submit' icon='submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
