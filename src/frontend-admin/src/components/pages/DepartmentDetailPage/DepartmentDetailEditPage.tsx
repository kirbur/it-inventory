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
import {cloneDeep} from '@babel/types'

// Types
interface IDepartmentDetailEditPageProps {
    match: any
    history: any
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
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>([])
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>([])

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
                    employeeCount: data[0].countEmpsInDep,
                    departmentName: data[0].departmentName,
                    hardwareCost: data[0].totalCostOfActHardwareInDep,
                    softwareCost: data[0].totalCostOfProgramsInDep,
                }
                setDeptData(dept)

                let hw: any[] = []
                data[0].defaultHardware.map((i: any) => hw.push([format(i.id), i]))
                console.log(hw)
                setHardwareRows(hw)

                let sw: any[] = []
                data[0].defaultSoftware.map((i: any) => sw.push([format(i.id), i]))
                console.log(sw)
                setSoftwareRows(sw)

                let l: any[] = []
                data[0].defaultLicenses.map((i: any) => l.push([format(i.id), i]))
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
            // setHardwareDropdown(data[0].hardware)
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

    // useEffect(() => {
    //     var d = deptList.filter((i: any) => (i.departmentName = userData.department))
    //     d[0] && setDeptInput({name: userData.department, id: d[0].departmentID})
    // }, [deptList, userData])

    const handleAddHardware = (name: string) => {
        console.log(name)
        setHardwareRows([...hardwareRows, [0, name]])
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

    console.log(deptInput)

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
                    <input type='text' className={styles.input} placeholder={deptData.departmentName} />
                </div>

                {/* Tables */}
                <div className={styles.tableColumn}>
                    <div className={styles.firstTableColumn}>
                        {/* default hardware */}
                        <div className={styles.table}>
                            <DetailEditTable headers={hardwareHeaders} rows={hardwareRows} setRows={setHardwareRows} />

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
                            <DetailEditTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />

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
                                    )}
                                    <div />
                                </div>
                            </Button>
                        </div>
                    </div>
                    {/* default software */}
                    <div className={styles.secondTableColumn}>
                        <div className={styles.table}>
                            <DetailEditTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />
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
