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

// Types
interface IDepartmentDetailEditPageProps {
    match: any
    history: any
}

// Primary Component
export const DepartmentDetailEditPage: React.SFC<IDepartmentDetailEditPageProps> = props => {
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
    const licenseHeaders = ['Licenses', 'CALs']

    //input feild states:
    const [dateInput, setDateInput] = useState<Date>()
    const [deptInput, setDeptInput] = useState<{name: string; id: number}>()
    //TODO: add states for the rest of the inputs

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
                data[0].jsonHardware.DefaultHardware.map((i: any) => hw.push([format(i.id), i]))
                console.log(hw)
                setHardwareRows(hw)

                let sw: any[] = []
                data[0].jsonPrograms.DefaultPrograms.map((i: any) => sw.push([format(i.id), i]))
                console.log(sw)
                setSoftwareRows(sw)

                // let l: any[] = []
                // data[0].licensesList.map((i: any) =>
                //     l.push([format(i.id), format(i.progName), format(i.countOfThatLicense)])
                // )
                // console.log(l)
                // setLicenseRows(l)
            })
            .catch((err: any) => console.error(err))

        //TODO: get dropdown content for all 3 dropdowns
    }, [])

    // useEffect(() => {
    //     var d = deptList.filter((i: any) => (i.departmentName = userData.department))
    //     d[0] && setDeptInput({name: userData.department, id: d[0].departmentID})
    // }, [deptList, userData])

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
                <div className={s(styles.title, styles.paddingBottom)}>Department Information</div>

                <div className={styles.row}>
                    <div className={styles.paddingRight}>
                        <div className={styles.paddingBottom}>
                            <div className={styles.text}>Department Name</div>
                            <input type='text' className={styles.input} placeholder={deptData.departmentName} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.text}>Date</div>
                        <DatePicker
                            dateFormat='yyyy/MM/dd'
                            selected={new Date()}
                            onChange={e => e && setDateInput(e)}
                            className={styles.input}
                        />
                    </div>
                </div>

                {/* Tables */}
                {/* default hardware */}
                <div className={styles.tableRow}>
                    <div className={s(styles.table, styles.paddingRight)}>
                        <DetailEditTable
                            headers={hardwareHeaders}
                            rows={hardwareRows}
                            setRows={setHardwareRows}
                            style={styles.newRowThing}
                        />

                        <Button className={styles.addDefaultContainer} icon='add' onClick={() => {}} textInside={false}>
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
                    </div>
                    {/* default software */}
                    <div className={styles.table}>
                        <DetailEditTable
                            headers={softwareHeaders}
                            rows={softwareRows}
                            setRows={setSoftwareRows}
                            style={styles.newRowThing}
                        />
                        <Button className={styles.addDefaultContainer} icon='add' onClick={() => {}} textInside={false}>
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
                    </div>
                </div>
                {/* default licenses */}
                <div className={styles.tableRow}>
                    <div className={s(styles.table, styles.paddingRight)}>
                        <DetailEditTable
                            headers={licenseHeaders}
                            rows={licenseRows}
                            setRows={setLicenseRows}
                            style={styles.newRowThing}
                        />

                        <Button className={styles.addDefaultContainer} icon='add' onClick={() => {}} textInside={false}>
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
                    </div>
                </div>
                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
