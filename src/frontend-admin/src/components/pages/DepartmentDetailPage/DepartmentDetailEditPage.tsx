import React, {useState, useEffect, useContext} from 'react'

// Components
import icon from '../../../content/Images/CQL-favicon.png'
import {DetailEditTable} from '../../reusables/DetailEditTable/DetailEditTable'
import {IoIosPersonAdd, IoMdAdd} from 'react-icons/io'
import {FaUserShield, FaUser, FaUserGraduate} from 'react-icons/fa'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './DepartmentDetailEditPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'
import {Button} from '../../reusables/Button/Button'
import {AxiosService} from '../../../services/AxiosService/AxiosService'
import {LoginContext} from '../../App/App'
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {cloneDeep} from 'lodash'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'

// Types
interface IDepartmentDetailEditPageProps {
    match: any
    history: any
}
interface Defaults {
    value: string
    sortBy: string
    id: number
}

// Primary Component
export const DepartmentDetailEditPage: React.SFC<IDepartmentDetailEditPageProps> = props => {
    const {history, match} = props

    const [deptList, setDeptList] = useState<any>([])
    var deptsRowOne: any[] = []
    var deptsRowTwo: any[] = []
    //push them into alternating rows so that rows are equal
    for (let i = 0; i < deptList.length; i++) {
        if (i % 2 == 0) {
            deptsRowOne.push(deptList[i].DepartmentName)
        } else {
            deptsRowTwo.push(deptList[i].DepartmentName)
        }
    }

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)
    const [deptData, setDeptData] = useState<any>({})
    const [hardwareRows, setHardwareRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])

    const hardwareHeaders = ['Hardware']
    const softwareHeaders = ['Software']
    const licenseHeaders = ['Licenses']

    //all possible hardware, software, and licenses
    const [hardwareDropdown, setHardwareDropdown] = useState<{name: string; id: number}[]>([])
    const [softwareDropdown, setSoftwareDropdown] = useState<{name: string; id: number}[]>([])
    const [licenseDropdown, setLicenseDropdown] = useState<{name: string; id: number}[]>([])

    //input feild states:
    const [dateInput, setDateInput] = useState<Date>()
    const [deptInput, setDeptInput] = useState<{name: string; id: number}>()
    //TODO: add states for the rest of the inputs

    const formatToolTip = (obj: any) => obj.cpu + ' | ' + obj.ramgb + 'GB | ' + obj.ssdgb + 'GB'

    useEffect(() => {
        axios
            .get(`/detail/department/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
                let dept: any = {
                    // photo: data[0].picture,'
                    departmentName: data[0].departmentName,
                }
                setDeptData(dept)

                let hw: any[] = []
                data[0].defaultHardware.map((item: string, index: number) =>
                    hw.push([{value: format(item), sortBy: item, id: index}])
                )
                console.log(hw)
                setHardwareRows(hw)

                let sw: any[] = []
                data[0].defaultSoftware.map((item: string, index: number) =>
                    sw.push([{value: format(item), sortBy: item, id: index}])
                )
                console.log(sw)
                setSoftwareRows(sw)

                let l: any[] = []
                data[0].defaultLicenses.map((item: string, index: number) =>
                    l.push([{value: format(item), sortBy: item, id: index}])
                )
                console.log(l)
                setLicenseRows(l)
            })
            .catch((err: any) => console.error(err))
    }, [])

    //get the lists of all possible hardware, licenses, and software
    useEffect(() => {
        axios.get(`/add/departmentprep`).then((data: any) => {
            console.log(data)
            let hw: {name: string; id: number}[] = []
            data[0].hardware.map(
                (hardware: string, index: number) => hw.push({name: hardware, id: index}) //gives each hardware unique id
            )
            setHardwareDropdown(hw)
            let sw: {name: string; id: number}[] = []
            data[0].software.map(
                (software: string, index: number) => sw.push({name: software, id: index}) //gives each hardware unique id
            )
            setSoftwareDropdown(sw)

            let l: {name: string; id: number}[] = []
            data[0].licenses.map(
                (licenses: string, index: number) => l.push({name: licenses, id: index}) //gives each hardware unique id
            )
            setLicenseDropdown(l)
        })
    }, [])

    const handleAddHardware = (name: string) => {
        let tempArray = cloneDeep(hardwareRows)
        tempArray.push([{value: format(name), sortBy: name, id: tempArray.length}])
        setHardwareRows(tempArray)
    }
    const handleRemoveHardware = (name: Defaults[]) => {
        let tempArray = cloneDeep(hardwareRows)
        tempArray = tempArray.filter(item => item[0].id != name[0].id)
        setHardwareRows(tempArray)
    }

    const handleAddSoftware = (name: string) => {
        let tempArray = cloneDeep(softwareRows)
        tempArray.push([{value: format(name), sortBy: name, id: tempArray.length}])
        setSoftwareRows(tempArray)
    }
    const handleRemoveSoftware = (name: Defaults[]) => {
        let tempArray = cloneDeep(softwareRows)
        tempArray = tempArray.filter(item => item[0].id != name[0].id)
        setSoftwareRows(tempArray)
    }

    const handleAddLicense = (name: string) => {
        let tempArray = cloneDeep(licenseRows)
        tempArray.push([{value: format(name), sortBy: name, id: tempArray.length}])
        setLicenseRows(tempArray)
    }
    const handleRemoveLicense = (name: Defaults[]) => {
        let tempArray = cloneDeep(licenseRows)
        tempArray = tempArray.filter(item => item[0].id != name[0].id)
        setLicenseRows(tempArray)
    }

    //takes in the array of array of objects (type:Defaults) and returns
    //an array of strings to send to the database
    function formatForPost(rows: Defaults[][]) {
        let tempArray: string[] = []
        console.log(rows)
        for (let i = 0; i < rows.length; i++) {
            tempArray.push(rows[i][0].value)
        }
        return tempArray
    }
    async function handleSubmit() {
        console.log(deptData.departmentName)
        if (
            //check to make sure there is a proper entry in department name
            deptData.departmentName === '' ||
            deptData.departmentName === null ||
            deptData.departmentName === undefined
        ) {
            window.alert('Department must have a name!')
        } else {
            let newDefaultHardware = formatForPost(hardwareRows)
            let newDefaultSoftware = formatForPost(softwareRows)
            let newDefaultLicenses = formatForPost(licenseRows)
            if (match.params.id === 'new') {
                await axios.post(`add/department`, {
                    DefaultHardware: {DefaultHardware: newDefaultHardware},
                    DefaultPrograms: {
                        license: newDefaultLicenses,
                        software: newDefaultSoftware,
                    },
                    name: deptData.departmentName,
                })
                history.push('/departments')
            } else {
                await axios.put(`update/department`, {
                    DefaultHardware: {DefaultHardware: newDefaultHardware},
                    DefaultPrograms: {
                        license: newDefaultLicenses,
                        software: newDefaultSoftware,
                    },
                    name: deptData.departmentName,
                    ID: match.params.id,
                })
                history.push(`/departments/detail/${match.params.id}`)
            }
        }
    }

    return (
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
                    <img className={styles.img} src={icon} />
                </div>
            </div>
            {/* column 2 */}
            <div className={styles.secondColumn}>
                {/* name and date */}
                <div className={styles.title}>Department Information</div>

                <div className={styles.row}>
                    <div className={styles.text}>Department Name</div>
                    <input
                        type='text'
                        className={styles.input}
                        placeholder={deptData.departmentName}
                        onChange={e => setDeptData({...deptData, departmentName: e.target.value})}
                    />
                </div>

                {/* Tables */}
                <div className={styles.tableColumn}>
                    <div className={styles.firstTableColumn}>
                        {/* default hardware */}
                        <div className={styles.table}>
                            <DetailPageTable
                                headers={hardwareHeaders}
                                rows={hardwareRows}
                                setRows={setHardwareRows}
                                style={styles.newRowThing}
                                edit={true}
                                remove={handleRemoveHardware}
                            />
                            <Button
                                className={styles.addDefaultContainer}
                                icon='add'
                                onClick={() => {}}
                                textInside={false}
                            >
                                <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                    {hardwareDropdown && (
                                        <DropdownList
                                            triggerElement={({isOpen, toggle}) => (
                                                <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                    <div
                                                        className={s(
                                                            dropdownStyles.dropdownTitle,
                                                            styles.dropdownTitle
                                                        )}
                                                    >
                                                        Add default hardware
                                                    </div>
                                                </button>
                                            )}
                                            choicesList={() => (
                                                <ul className={dropdownStyles.dropdownList}>
                                                    {hardwareDropdown.map(i => (
                                                        <li
                                                            className={dropdownStyles.dropdownListItem}
                                                            key={i.id}
                                                            onClick={() => handleAddHardware(i.name)}
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
                                    )}
                                    <div />
                                </div>
                            </Button>
                        </div>
                        {/* default licenses */}
                        <div className={styles.table}>
                            <DetailPageTable
                                headers={licenseHeaders}
                                rows={licenseRows}
                                setRows={setLicenseRows}
                                style={styles.newRowThing}
                                edit={true}
                                remove={handleRemoveLicense}
                            />
                            <Button
                                className={styles.addDefaultContainer}
                                icon='add'
                                onClick={() => {}}
                                textInside={false}
                            >
                                <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                    {licenseDropdown && (
                                        <DropdownList
                                            triggerElement={({isOpen, toggle}) => (
                                                <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                    <div
                                                        className={s(
                                                            dropdownStyles.dropdownTitle,
                                                            styles.dropdownTitle
                                                        )}
                                                    >
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
                                                            onClick={() => handleAddLicense(i.name)}
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
                                    )}
                                    <div />
                                </div>
                            </Button>
                        </div>
                    </div>
                    {/* default software */}
                    <div className={styles.secondTableColumn}>
                        <div className={styles.table}>
                            <DetailPageTable
                                headers={softwareHeaders}
                                rows={softwareRows}
                                setRows={setSoftwareRows}
                                style={styles.newRowThing}
                                edit={true}
                                remove={handleRemoveSoftware}
                            />
                            <Button
                                className={styles.addDefaultContainer}
                                icon='add'
                                onClick={() => {}}
                                textInside={false}
                            >
                                <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                    {softwareDropdown && (
                                        <DropdownList
                                            triggerElement={({isOpen, toggle}) => (
                                                <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                                    <div
                                                        className={s(
                                                            dropdownStyles.dropdownTitle,
                                                            styles.dropdownTitle
                                                        )}
                                                    >
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
                                                            onClick={() => handleAddSoftware(i.name)}
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
                                    )}
                                    <div />
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
