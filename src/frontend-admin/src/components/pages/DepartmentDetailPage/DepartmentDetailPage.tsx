import React, {useState} from 'react'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Styles
import styles from './DepartmentDetailPage.module.css'
//import styles from './DepartmentDetailPage.module.css';

// Types
interface IDepartmentDetailPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const DepartmentDetailPage: React.SFC<IDepartmentDetailPageProps> = props => {
    const {history, match} = props

    const employeeHeaders = ['Employees', 'Date Hired', 'Cost']
    const softwareHeaders = ['Software', '#', 'Cost']
    const licenseHeaders = ['License', 'CALs']

    const [employeeRows, setEmployeeRows] = useState([])
    const [softwareRows, setSoftwareRows] = useState([])
    const [licenseRows, setLicenseRows] = useState([])

    return (
        <div className={styles.detailMain}>
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
                        {/* <img className={styles.img} src={URL + userData.photo} alt={''} /> */}
                    </div>
                    <div className={styles.costText}>
                        {/* <p>Software ---------------- ${userData.swCost} /month</p> */}
                        {/* <p>Hardware --------------- ${userData.hwCost}</p> */}
                    </div>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {/* {isAdmin && (
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
                    )} */}
                    <div className={styles.titleText}>
                        <div className={styles.deptName}>Department Name</div>
                        <div className={styles.deptText}># Employees</div>
                    </div>
                    <DetailPageTable headers={employeeHeaders} rows={employeeRows} setRows={setEmployeeRows} />
                    {/* {isAdmin && (
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
                    )} */}

                    <DetailPageTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />
                    {/* {isAdmin && (
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
                    )} */}

                    <DetailPageTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />
                    {/* {isAdmin && (
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
                    )} */}
                </div>
            </div>
        </div>
    )
}
