import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {Button} from '../../reusables/Button/Button'
import {HistoryLog, IHistoryLogArray} from '../../reusables/HistoryLog/HistoryLog'
import DatePicker from 'react-datepicker'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import {Checkbox} from '../../reusables/Checkbox/Checkbox'
import {BackButton} from '../../reusables/BackButton/BackButton'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './HardwareDetailEditPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

// Context
import {LoginContext, ThemeContext} from '../../App/App'
import {cloneDeep} from 'lodash'
import {sortByDate} from '../../../utilities/quickSort'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Types
interface IHardwareDetailEditPageProps {
    history: any
    match: any
}
export interface MonitorData {
    Make: string
    Model: string
    ScreenSize: number
    Resolution: number
    Inputs: number
    SerialNumber: number

    Location: string
    EmployeeId: number

    RenewalDate: Date
    PurchaseDate: Date

    FlatCost: number
    CostPerYear: number
    MonthsPerRenewal: number
    Mfg: null
    TextField: string
}

// Primary Component
export const HardwareDetailEditPage: React.SFC<IHardwareDetailEditPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const { isDarkMode } = useContext(ThemeContext)

    const axios = new AxiosService(loginContextVariables)

    //default
    const [firstSectionHeaders, setFirstSectionHeaders] = useState<string[]>(['yeah something went wrong'])
    const [secondSectionHeaders, setSecondSectionHeaders] = useState<string[]>(['yeah something went wrong'])
    const [thirdSectionHeaders, setThirdSectionHeaders] = useState<string[]>(['yeah something went wrong'])

    const [firstSectionData, setFirstSectionData] = useState<(string | number)[]>([])
    // var returnFirstSectionData = {}
    const [secondSectionData, setSecondSectionData] = useState<(string | number)[]>([])
    const [thirdSectionData, setThirdSectionData] = useState<(string | number)[]>([])
    const [costSection, setCostSection] = useState<(number | string)[]>([])
    const [isVirtualized, setIsVirtualized] = useState<boolean>(false)

    const [purchaseDateInput, setPurchaseDateInput] = useState<Date>(new Date())
    const [renewalDateInput, setRenewalDateInput] = useState<Date>(new Date())
    const [endOfLifeInput, setEndOfLifeInput] = useState<Date>(new Date())

    const [commentText, setCommentText] = useState('')

    const [historyLogEntries, setHistoryLogEntries] = useState<IHistoryLogArray[]>([])
    const [addHistoryLog, setAddHistoryLog] = useState<IHistoryLogArray[]>([])
    const [removeHistoryLog, setRemoveHistoryLog] = useState<(number | undefined)[]>([])
    const [eventInput, setEventInput] = useState<'Broken' | 'Repaired'>()
    const [historyLogBool, setHistoryLogBool] = useState(false)
    const [dateInput, setDateInput] = useState<Date>(new Date())

    const [hasRecurringCost, setHasRecurringCost] = useState<boolean>(false)
    const [hasFlatCost, setHasFlatCost] = useState<boolean>(false)

    const [employeeDropdown, setEmployeeDropdown] = useState<{name: string; id: number}[]>()
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>()

    const [imgInput, setImgInput] = useState<File>()

    var key = 0

    useEffect(() => {
        axios.get(`add/hardwarePrep`).then((data: any) => {
            const employees: {name: string; id: number}[] = []
            data.map((i: {employeeName: string; employeeId: number}) =>
                employees.push({
                    name: i.employeeName,
                    id: i.employeeId,
                })
            )
            setEmployeeDropdown(employees)
        })
        if (match.params.type === 'server') {
            setFirstSectionHeaders([
                'Make',
                'Model',
                'OS',
                'RAM (GB)',
                'Local HHD (GB)',
                '# of Cores',
                'MFG Tag',
                'Serial #',
                'IP Address',
                'SAN',
                'FQDN',
            ])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date', 'End of Life'])
            setThirdSectionHeaders(['Employee Assigned', 'Location'])
            if (match.params.id !== 'new') {
                axios
                    .get(`/detail/server/${match.params.id}`)
                    .then((data: any) => {
                        setFirstSectionData([
                            data[0].server.make,
                            data[0].server.model,
                            data[0].server.operatingSystem,
                            data[0].server.ram,
                            data[0].server.localHHD,
                            data[0].server.numberOfCores,
                            data[0].server.mfg,
                            data[0].server.serialNumber,
                            data[0].server.ipAddress,
                            data[0].server.san,
                            data[0].server.fqdn,
                        ])
                        setSecondSectionData([])
                        setPurchaseDateInput(data[0].server.purchaseDate)
                        setRenewalDateInput(data[0].server.renewalDate)
                        setEndOfLifeInput(data[0].server.endOfLife)
                        setThirdSectionData([data[0].employeeAssignedName, data[0].server.location])
                        setIsVirtualized(data[0].server.virtualize)
                        setCostSection([
                            data[0].server.flatCost,
                            data[0].server.costPerYear,
                            data[0].server.monthsPerRenewal,
                        ])
                        checkCostStates(data[0].server.flatCost, data[0].server.costPerYear)
                        setCommentText(data[0].server.textField)
                        setHistoryLogEntries(data[0].serverHistory)
                        setHistoryLogEntries(data[0].serverHistory)
                        setSelectedEmployee({name: data[0].employeeAssignedName, id: data[0].server.employeeId})
                    })
                    .catch((err: any) => console.error(err))
            }
        } else if (match.params.type === ('laptop' || 'computer')) {
            setFirstSectionHeaders([
                'Make',
                'Model',
                'CPU',
                'RAM (GB)',
                'SSD (GB)',
                'Screen Size (in)',
                'Monitor Output',
                'Serial #',
                'MFG Tag',
                'FQDN',
            ])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date', 'End of Life'])
            setThirdSectionHeaders(['Employee Assigned', 'Location'])
            if (match.params.id !== 'new') {
                axios
                    .get(`/detail/computer/${match.params.id}`)
                    .then((data: any) => {
                        setFirstSectionData([
                            data[0].computer.make,
                            data[0].computer.model,
                            data[0].computer.cpu,
                            data[0].computer.ramgb,
                            data[0].computer.ssdgb,
                            data[0].computer.screenSize,
                            data[0].computer.monitorOutput,
                            data[0].computer.serialNumber,
                            data[0].computer.mfg,
                            data[0].computer.fqdn,
                        ])

                        setSecondSectionData([])
                        setCostSection([
                            data[0].computer.flatCost,
                            data[0].computer.costPerYear,
                            data[0].computer.monthsPerRenewal,
                        ])
                        checkCostStates(data[0].computer.flatCost, data[0].computer.costPerYear)
                        setPurchaseDateInput(data[0].computer.purchaseDate)
                        setRenewalDateInput(data[0].computer.renewalDate)
                        setHistoryLogEntries(data[0].computerHistory)
                        setEndOfLifeInput(data[0].computer.endOfLife)

                        setThirdSectionData([
                            data[0].employeeAssignedName,
                            data[0].computer.location,
                            data[0].computer.employeeId,
                        ])
                        setCommentText(data[0].computer.textField)
                        setHistoryLogEntries(data[0].computerHistory)
                        setSelectedEmployee({name: data[0].employeeAssignedName, id: data[0].computer.employeeId})
                    })
                    .catch((err: any) => console.error(err))
            }
        } else if (match.params.type === 'monitor') {
            setFirstSectionHeaders(['Make', 'Model', 'Screen Size (in)', 'Resolution (k)', 'Inputs', 'Serial #'])
            setSecondSectionHeaders(['Purchase Date', 'Renewal Date'])
            setThirdSectionHeaders(['Employee Assigned', 'Location'])
            if (match.params.id !== 'new') {
                axios
                    .get(`/detail/monitor/${match.params.id}`)
                    .then((data: any) => {
                        setFirstSectionData([
                            data[0].monitor.make,
                            data[0].monitor.model,
                            data[0].monitor.screenSize,
                            data[0].monitor.resolution,
                            data[0].monitor.inputs,
                            data[0].monitor.serialNumber,
                        ])
                        setSecondSectionData([])
                        setPurchaseDateInput(data[0].monitor.purchaseDate)
                        setRenewalDateInput(data[0].monitor.renewalDate)

                        setThirdSectionData([
                            data[0].employeeAssignedName,
                            data[0].monitor.location,
                            data[0].monitor.employeeId,
                        ])
                        setCostSection([
                            data[0].monitor.flatCost,
                            data[0].monitor.costPerYear,
                            data[0].monitor.monthsPerRenewal,
                        ])
                        checkCostStates(data[0].monitor.flatCost, data[0].monitor.costPerYear)
                        setCommentText(data[0].monitor.textField)
                        setHistoryLogEntries(data[0].monitorHistory)
                        setSelectedEmployee({name: data[0].employeeAssignedName, id: data[0].monitor.employeeId})
                    })
                    .catch((err: any) => console.error(err))
            }
        } else if (match.params.type === 'peripheral') {
            setFirstSectionHeaders(['Name', 'Type', 'Serial #'])
            setSecondSectionHeaders(['Purchase Date'])
            setThirdSectionHeaders(['Employee Assigned'])
            if (match.params.id !== 'new') {
                axios
                    .get(`/detail/peripheral/${match.params.id}`)
                    .then((data: any) => {
                        setFirstSectionData([
                            data[0].peripheral.peripheralName,
                            data[0].peripheral.peripheralType,
                            data[0].peripheral.serialNumber,
                        ])
                        setPurchaseDateInput(data[0].peripheral.purchaseDate)

                        setSecondSectionData([])
                        setThirdSectionData([])
                        setCostSection([
                            data[0].peripheral.flatCost,
                            data[0].peripheral.costPerYear,
                            data[0].peripheral.monthsPerRenewal,
                        ])
                        checkCostStates(data[0].peripheral.flatCost, data[0].peripheral.costPerYear)

                        setCommentText(data[0].peripheral.textField)
                        setHistoryLogEntries(data[0].peripheralHistory)
                        setSelectedEmployee({name: data[0].employeeAssignedName, id: data[0].peripheral.employeeId})
                    })
                    .catch((err: any) => console.error(err))
            }
        }
        // checkCostStates()
    }, [])

    function checkCostStates(flatCost: number, recurringCost: number) {
        if (flatCost != null && flatCost > 0) {
            setHasFlatCost(true)
        }
        if (recurringCost != null && recurringCost > 0) {
            setHasRecurringCost(true)
        }
    }

    //checks for incorrectly filled out form
    //returns true if it is a bad form
    //returns false if it passes every check
    function badForm() {
        let alertMssg = ''
        //checks for every form
        if (hasRecurringCost) {
            if (costSection[1] == 0 || costSection[1] == null || costSection[2] == 0 || costSection[2] == null) {
                alertMssg += '\n Recurring cost and months must have values greater than zero!'
            }
        }
        if (hasFlatCost) {
            if (costSection[0] == 0 || costSection[0] == null) {
                alertMssg += '\n Initial cost must have a value greater than zero!'
            }
        }
        //everything must be filled out - sorting doesnt work with null values
        //this will only do something when creating a new piece of hardware
        if (firstSectionData.length !== firstSectionHeaders.length) {
            alertMssg += '\n All hardware info fields must be filled out!'
        }

        //checks for server form
        if (match.params.type === 'server') {
            if (isNaN(Number(firstSectionData[3]))) {
                alertMssg += '\n RAM must be a number!'
            }
            if (isNaN(Number(firstSectionData[5]))) {
                alertMssg += '\n # of cores must be a number! '
            }
        }

        //check for laptop form
        if (match.params.type === 'laptop') {
            if (isNaN(Number(firstSectionData[3]))) {
                alertMssg += '\n RAM must be a number!'
            }
            if (isNaN(Number(firstSectionData[4]))) {
                alertMssg += '\n SSD must be a number!'
            }
            if (isNaN(Number(firstSectionData[5]))) {
                alertMssg += '\n Screen size must be a number! '
            }
        }

        //check for monitor form
        if (match.params.type === 'monitor') {
            if (isNaN(Number(firstSectionData[2]))) {
                alertMssg += '\n Screen size must be a number!'
            }
            if (isNaN(Number(firstSectionData[3]))) {
                alertMssg += '\n Resolution must be a number!'
            }
        }

        if (alertMssg.length > 0) {
            window.alert(alertMssg)
            return true
        }
        return false
    }

    async function handleSubmit() {
        //update image
        var newID = ''

        if (imgInput) {
            var formData = new FormData()
            formData.append('file', imgInput)

            axios
                .put(`/image/${match.params.type}/${match.params.id}`, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                .catch(err => console.error(err))
        }

        if (badForm()) {
            return
        }

        if (match.params.id === 'new') {
            if (match.params.type === 'monitor') {
                await axios.post(`add/monitor`, {
                    Entity: {
                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        ScreenSize: firstSectionData[2],
                        Resolution: firstSectionData[3],
                        Inputs: firstSectionData[4],
                        SerialNumber: firstSectionData[5],

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,

                        FlatCost: hasFlatCost ? costSection[0] : null,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,
                        Mfg: 0,
                        TextField: commentText,
                    },
                }).then((response:any) => {
                    newID = response.data
                })
            } else if (match.params.type === 'server') {
                await axios.post(`add/server`, {
                    Entity: {
                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        OperatingSystem: firstSectionData[2],
                        Ram: firstSectionData[3],
                        LocalHHD: firstSectionData[4],
                        NumberOfCores: firstSectionData[5],
                        MFG: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        IPAddress: firstSectionData[8],
                        SAN: firstSectionData[9],
                        Fqdn: firstSectionData[10],

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Virtualize: isVirtualized,

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        FlatCost: hasFlatCost ? costSection[0] : 0,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,

                        TextField: commentText,
                    },
                }).then((response:any) => {
                    newID = response.data
                })
            } else if (match.params.type === 'laptop') {
                await axios.post(`add/laptop`, {
                    Entity: {
                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        Cpu: firstSectionData[2],
                        Ramgb: firstSectionData[3],
                        Ssdgb: firstSectionData[4],
                        ScreenSize: firstSectionData[5],
                        MonitorOutput: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        MFG: firstSectionData[8],
                        Fqdn: firstSectionData[9],

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        FlatCost: hasFlatCost ? costSection[0] : 0,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,

                        TextField: commentText,
                    },
                }).then((response:any) => {
                    newID = response.data
                })
            } else if (match.params.type === 'peripheral') {
                await axios.post(`add/peripheral`, {
                    Entity: {
                        PeripheralName: firstSectionData[0],
                        PeripheralType: firstSectionData[1],
                        SerialNumber: firstSectionData[2],

                        PurchaseDate: purchaseDateInput,

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        FlatCost: hasFlatCost ? costSection[0] : 0,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,

                        TextField: commentText,
                    },
                }).then((response:any) => {
                    newID = response.data
                })
            }
            history.push({pathname: `/hardware/detail/${match.params.type}/${newID}`, state: {prev: history.location}})
        } else {
            //not new --> editing existing page
            if (match.params.type === 'monitor') {
                await axios.put(`update/monitor`, {
                    Entity: {
                        MonitorId: match.params.id,

                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        ScreenSize: firstSectionData[2],
                        Resolution: firstSectionData[3],
                        Inputs: firstSectionData[4],
                        SerialNumber: firstSectionData[5],

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,

                        FlatCost: hasFlatCost ? costSection[0] : 0,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,
                        Mfg: null,
                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: removeHistoryLog,
                })
            } else if (match.params.type === 'server') {
                await axios.put(`update/server`, {
                    Entity: {
                        ServerId: match.params.id,

                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        OperatingSystem: firstSectionData[2],
                        Ram: firstSectionData[3],
                        LocalHHD: firstSectionData[4],
                        NumberOfCores: firstSectionData[5],
                        MFG: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        IPAddress: firstSectionData[8],
                        SAN: firstSectionData[9],
                        Fqdn: firstSectionData[10],

                        Virtualize: isVirtualized,

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        FlatCost: hasFlatCost ? costSection[0] : 0,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,

                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: removeHistoryLog,
                })
            } else if (match.params.type === 'laptop') {
                await axios.put(`update/computer`, {
                    Entity: {
                        ComputerId: match.params.id,

                        Make: firstSectionData[0],
                        Model: firstSectionData[1],
                        Cpu: firstSectionData[2],
                        Ramgb: firstSectionData[3],
                        Ssdgb: firstSectionData[4],
                        ScreenSize: firstSectionData[5],
                        MonitorOutput: firstSectionData[6],
                        SerialNumber: firstSectionData[7],
                        MFG: firstSectionData[8],
                        Fqdn: firstSectionData[9],

                        RenewalDate: renewalDateInput,
                        PurchaseDate: purchaseDateInput,
                        EndOfLife: endOfLifeInput,

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        FlatCost: hasFlatCost ? costSection[0] : 0,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,

                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: removeHistoryLog,
                })
            } else if (match.params.type === 'peripheral') {
                await axios.put(`update/peripheral`, {
                    Entity: {
                        PeripheralId: match.params.id,

                        PeripheralName: firstSectionData[0],
                        PeripheralType: firstSectionData[1],
                        SerialNumber: firstSectionData[2],

                        PurchaseDate: purchaseDateInput,

                        Location: thirdSectionData[1],
                        EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,

                        FlatCost: hasFlatCost ? costSection[0] : 0,
                        CostPerYear: hasRecurringCost
                            ? (parseFloat(costSection[1].toString()) * 12) / parseFloat(costSection[2].toString())
                            : 0,
                        MonthsPerRenewal: hasRecurringCost ? costSection[2] : 0,

                        TextField: commentText,
                    },
                    AddHistory: addHistoryLog,
                    DeleteHistory: removeHistoryLog,
                })
            }
            history.push({
                pathname: `/hardware/detail/${match.params.type}/${match.params.id}`,
                state: {prev: history.location},
            })
        }
    }

    function handleInputChange(index: number, sectionData: any[], value: string | number) {
        let tempData = cloneDeep(sectionData)
        tempData[index] = value
        if (sectionData == firstSectionData) {
            setFirstSectionData(tempData)
        } else if (sectionData == secondSectionData) {
            setSecondSectionData(tempData)
        } else if (sectionData == thirdSectionData) {
            setThirdSectionData(tempData)
        }
    }

    // make first section
    function renderSection(sectionHeaders: string[], sectionData: any[]) {
        var rows = []
        if (sectionData == secondSectionData) {
            for (let i = 0; i < sectionHeaders.length; i += 3) {
                rows.push(
                    <div className={styles.row}>
                        {sectionHeaders[i] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i]}</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={new Date(purchaseDateInput)}
                                    onChange={e => e && setPurchaseDateInput(e)}
                                    className={styles.input}
                                    popperClassName={styles.rdp}
                                />
                            </div>
                        )}
                        {sectionHeaders[i + 1] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 1]}</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={new Date(renewalDateInput)}
                                    onChange={e => e && setRenewalDateInput(e)}
                                    className={styles.input}
                                />
                            </div>
                        )}
                        {sectionHeaders[i + 2] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 2]}</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={new Date(endOfLifeInput)}
                                    onChange={e => e && setEndOfLifeInput(e)}
                                    className={styles.input}
                                />
                            </div>
                        )}
                    </div>
                )
            }
            //employee assigned
        } else if (sectionData == thirdSectionData) {
            for (let i = 0; i < sectionHeaders.length; i += 3) {
                rows.push(
                    <div className={styles.row}>
                        {sectionHeaders[i] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i]}</div>
                                <Button className={s(styles.input, styles.employeeDropdownButton)}>
                                    <div
                                        className={s(
                                            dropdownStyles.dropdownContainer,
                                            styles.employeeDropdownContainer
                                        )}
                                    >
                                        {employeeDropdown && (
                                            <DropdownList
                                                triggerElement={({isOpen, toggle}) => (
                                                    <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                        <div
                                                            className={s(
                                                                dropdownStyles.dropdownTitle,
                                                                styles.employeeDropdownTitle
                                                            )}
                                                        >
                                                            <div>
                                                                {selectedEmployee
                                                                    ? selectedEmployee.name
                                                                    : 'Select An Employee'}
                                                            </div>
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
                                                        {employeeDropdown.map(item => (
                                                            <li
                                                                className={dropdownStyles.dropdownListItem}
                                                                key={item.name}
                                                                onClick={() => {
                                                                    setSelectedEmployee(item)
                                                                }}
                                                            >
                                                                <button
                                                                    className={dropdownStyles.dropdownListItemButton}
                                                                >
                                                                    <div className={dropdownStyles.dropdownItemLabel}>
                                                                        {item.name}
                                                                    </div>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                listWidthClass={styles.dropdownContent}
                                            />
                                        )}
                                        <div />
                                    </div>
                                </Button>
                            </div>
                        )}
                        {sectionHeaders[i + 1] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 1]}</div>
                                <input
                                    type='text'
                                    className={styles.input}
                                    placeholder={sectionData[i + 1]}
                                    onChange={e => e && handleInputChange(i + 1, sectionData, e.target.value)}
                                ></input>
                            </div>
                        )}
                        {match.params.type == 'server' && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>Virtualize</div>
                                <Checkbox
                                    className={styles.checkBoxContainer}
                                    checked={isVirtualized}
                                    onClick={() => setIsVirtualized(!isVirtualized)}
                                />
                            </div>
                        )}
                    </div>
                )
            }
        } else {
            for (let i = 0; i < sectionHeaders.length; i += 3) {
                rows.push(
                    <div className={styles.row}>
                        {sectionHeaders[i] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i]}</div>
                                <input
                                    type='text'
                                    className={styles.input}
                                    value={sectionData[i]}
                                    onChange={e => e && handleInputChange(i, sectionData, e.target.value)}
                                ></input>
                            </div>
                        )}
                        {sectionHeaders[i + 1] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 1]}</div>
                                <input
                                    type='text'
                                    className={styles.input}
                                    value={sectionData[i + 1]}
                                    onChange={e => e && handleInputChange(i + 1, sectionData, e.target.value)}
                                ></input>
                            </div>
                        )}
                        {sectionHeaders[i + 2] && (
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>{sectionHeaders[i + 2]}</div>
                                <input
                                    type='text'
                                    className={styles.input}
                                    value={sectionData[i + 2]}
                                    onChange={e => e && handleInputChange(i + 2, sectionData, e.target.value)}
                                ></input>
                            </div>
                        )}
                    </div>
                )
            }
        }

        return <div className={styles.section}>{rows}</div>
    }

    const handleSubmitHistoryLog = () => {
        if (eventInput === 'Broken' || eventInput === 'Repaired') {
            setHistoryLogBool(!historyLogBool)
            let tempHistoryLog = new Array()
            if (historyLogEntries !== undefined) {
                tempHistoryLog = cloneDeep(historyLogEntries)
            }
            tempHistoryLog.push({
                employeeName: thirdSectionData[0],
                eventType: eventInput,
                eventDate: dateInput.toISOString(),
                key: key,
            })
            setHistoryLogEntries(tempHistoryLog)

            //adding to add history log to send to backend
            tempHistoryLog = cloneDeep(addHistoryLog)
            tempHistoryLog.push({
                EventType: eventInput,
                EventDate: dateInput.toISOString(),
                key: key,
            })
            key = key + 1
            setAddHistoryLog(tempHistoryLog)
        } else {
            window.alert('History log must have an event!')
        }
    }

    function removeLog(index: number) {
        //the backend adds the id to the hardware history logs
        //so if there is an id then remove that log and add id to removeHistoryLog array
        //if not, then it was added but removed before submitted and saved in database
        if (historyLogEntries[index].hasOwnProperty('historyId')) {
            //add to removeHistoryLog
            let tempRemoveId = cloneDeep(removeHistoryLog)
            tempRemoveId.push(historyLogEntries[index].historyId)
            setRemoveHistoryLog(tempRemoveId)
        } else {
            //remove from addHistoryLog
            let tempAddHistoryLog = cloneDeep(addHistoryLog)
            tempAddHistoryLog = tempAddHistoryLog.filter(log => log.key != historyLogEntries[index].key)

            setAddHistoryLog(tempAddHistoryLog)
        }

        let tempHistoryLog = cloneDeep(historyLogEntries)
        tempHistoryLog = tempHistoryLog.slice(0, index).concat(tempHistoryLog.slice(index + 1, tempHistoryLog.length))
        setHistoryLogEntries(tempHistoryLog)
    }

    const changeCost = (cost: string, index: number) => {
        let tempArray = cloneDeep(costSection)
        tempArray[index] = cost
        setCostSection(tempArray)
    }

    return (
        <div className={s(styles.columns, isDarkMode ? styles.backgroundDark : {})}>
            {/* column 1 */}
            <div className={styles.firstColumn}>
                <BackButton history={history} className={styles.backButton} />
                <div className={styles.imgContainer}>
                    <PictureInput setImage={setImgInput} image={imgInput} />
                </div>
            </div>

            {/* column 2 */}
            <div className={styles.secondColumn}>
                <div className={s(styles.hardwareHeader, isDarkMode ? styles.headerDark : {})}>{match.params.type} Information</div>
                {/* first section */}
                {firstSectionHeaders.length > 0 && renderSection(firstSectionHeaders, firstSectionData)}
                {firstSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* second section */}
                {secondSectionHeaders.length > 0 && renderSection(secondSectionHeaders, secondSectionData)}
                {secondSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* third section */}
                {thirdSectionHeaders.length > 0 && renderSection(thirdSectionHeaders, thirdSectionData)}
                {thirdSectionHeaders.length > 0 && <div className={styles.line} />}
                {/* cost section */}
                <div className={styles.radioSection}>
                    <div className={styles.radioContainer}>
                        <div className={s(styles.radio, styles.marginTop)}>
                            <Checkbox
                                className={styles.checkBoxContainerOne}
                                checked={hasFlatCost}
                                onClick={() => setHasFlatCost(!hasFlatCost)}
                            />
                        </div>
                        <div>
                            <div className={styles.inputHeader}>Initial Cost</div>
                            <input
                                className={styles.radioInput}
                                type='number'
                                step='0.01'
                                value={costSection[0]}
                                onChange={e => {
                                    if (hasFlatCost) {
                                        changeCost(e.target.value, 0)
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.radioContainer}>
                        <Checkbox
                            className={styles.checkBoxContainerTwo}
                            checked={hasRecurringCost}
                            onClick={() => setHasRecurringCost(!hasRecurringCost)}
                        />
                        <div>
                            <div className={styles.inputHeader}>Recurring Cost</div>
                            <input
                                className={styles.radioInput}
                                type='number'
                                step='0.01'
                                value={costSection[1]}
                                onChange={e => {
                                    if (hasRecurringCost) {
                                        changeCost(e.target.value, 1)
                                    }
                                }}
                            />
                        </div>
                        {hasRecurringCost && (
                            <div className={styles.marginLeft}>
                                <div className={styles.inputHeader}>Months per Renewal</div>
                                <input
                                    className={styles.monthsInput}
                                    type='number'
                                    step='1'
                                    value={costSection[2]}
                                    onChange={e => changeCost(e.target.value, 2)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.historyLogContainer}>
                    <HistoryLog historyLog={sortByDate(historyLogEntries)} remove={removeLog} canEdit={true} />
                    {historyLogBool && (
                        <div className={styles.row}>
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>Date</div>
                                <DatePicker
                                    dateFormat='MM/dd/yyyy'
                                    selected={dateInput}
                                    onChange={e => e && setDateInput(e)}
                                    className={styles.input}
                                />
                            </div>
                            {/* TODO: make this a component. */}
                            <div className={styles.inputContainer}>
                                <div className={styles.inputHeader}>Event Type</div>
                                <div className={styles.radioContainer}>
                                    <div className={styles.radio}>
                                        <input
                                            type='radio'
                                            name='event'
                                            className={styles.checkmark}
                                            checked={eventInput === 'Broken'}
                                            onChange={() => setEventInput('Broken')}
                                        />
                                        <div className={s(styles.checkmark, isDarkMode ? styles.checkmarkDark : {})} />
                                        <div className={s(styles.insideCheckmark, isDarkMode ? styles.insideCheckmarkDark : {})} />
                                    </div>
                                    <div className={styles.inputHeader}>Broken</div>
                                </div>
                                <div className={styles.radioContainer}>
                                    <div className={styles.radio}>
                                        <input
                                            type='radio'
                                            name='event'
                                            className={styles.checkmark}
                                            checked={eventInput === 'Repaired'}
                                            onChange={() => setEventInput('Repaired')}
                                        />
                                        <div className={s(styles.checkmark, isDarkMode ? styles.checkmarkDark : {})} />
                                        <div className={s(styles.insideCheckmark, isDarkMode ? styles.insideCheckmarkDark : {})} />
                                        <div className={styles.inputHeader}>Repaired</div>
                                    </div>
                                </div>
                                {/* the rest of the logs are done on the backend */}
                            </div>
                            {/* should send back the employee of this page */}
                            <div className={s(styles.historyLogSubmit, isDarkMode ? styles.textDark : {})}>
                                <Button
                                    icon='add'
                                    onClick={handleSubmitHistoryLog}
                                    className={styles.historyLogButton}
                                />
                                Submit Log
                            </div>
                        </div>
                    )}
                    {!historyLogBool && (
                        <div className={s(styles.historyLogAdd, isDarkMode ? styles.textDark : {})}>
                            <Button
                                icon='add'
                                onClick={() => setHistoryLogBool(!historyLogBool)}
                                className={styles.historyLogButton}
                            />
                            add log
                        </div>
                    )}
                </div>

                {/* comment section */}
                <div>
                    <div className={styles.header}>Text Field</div>

                    <textarea
                        className={styles.description}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                    ></textarea>
                </div>
                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
