import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import Axios from 'axios'
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
import styles from './ProgramOverviewPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IProgramOverviewPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const ProgramOverviewPage: React.SFC<IProgramOverviewPageProps> = props => {
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
        fetch('https://localhost:44358/api/detail/ProgramOverview/123.Net')
            .then(res => {
                console.log(res)
                return res.json()
            })
            .then(data => {
                console.log(data)
            })
            .catch(err => console.error(err))

        Axios.get('https://localhost:44358/api/detail/ProgramOverview/123.Net')
            .then(res => {
                console.log(res.data)
            })
            .catch((err: any) => console.error(err))

        axios
            .get(`/detail/ProgramOverview/${match.params.id}`)
            .then((data: any) => {
                console.log(data)
            })
            .catch((err: any) => console.error(err))

        //TODO: get dropdown content for all 3 dropdowns
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive ${match.params.id}?`)) {
            //TODO: a post request to archive user w/ id match.params.id
            history.push('/programs')
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
        <div className={styles.progOverviewMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text='All Programs'
                        icon='back'
                        onClick={() => {
                            history.push('/programs')
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={URL + userData.photo} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        <p>Yearly ---------------- ${userData.swCost}</p>
                        <p>Monthly --------------- ${userData.hwCost}</p>
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
                                    //history.push('/editProgram/' + match.params.id)
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
                    {isAdmin && (
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

                    <DetailPageTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />
                    {isAdmin && (
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

                    <DetailPageTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />
                    {isAdmin && (
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
                </div>
            </div>
        </div>
    )
}
