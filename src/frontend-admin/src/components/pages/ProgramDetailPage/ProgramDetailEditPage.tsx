import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {Button} from '../../reusables/Button/Button'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import {ProgramForm, IProgramFormInputs} from '../../reusables/ProgramForm/ProgramForm'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'
import {Group} from '../../reusables/Group/Group'

// Utils
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './ProgramDetailEditPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'
import {FaLessThanEqual} from 'react-icons/fa'

// Types
interface IProgramDetailEditPageProps {
    history: any
    match: any
}

// Helpers

// Primary Component
export const ProgramDetailEditPage: React.SFC<IProgramDetailEditPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [progData, setProgData] = useState<any>({})
    const [historyList, setHistoryList] = useState<any[]>([])
    const [progRows, setProgRows] = useState<any[]>([])
    const progHeaders = ['License Key', 'Purchase Link']

    const [employeeDropdown, setEmployeeDropdown] = useState<any[]>([{name: 'First Last', id: 1}])
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>()

    //input feild states:
    const [formState, setFormState] = useState<IProgramFormInputs>()
    const [imgInput, setImgInput] = useState<File>()

    useEffect(() => {
        axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                    employee: data[0].employeeName,
                })

                setFormState({
                    name: data[0].programName,
                    programName: data[0].programName,
                    description: data[0].description,
                    renewalDate: new Date(data[0].renewalDate),
                    purchaseDate: new Date(data[0].dateBought),
                    purchaseLink: data[0].programPurchaseLink,
                    licenseKey: data[0].programLicenseKey,
                    isLicense: false,

                    costPerMonth:
                        !data[0].isCostPerYear && data[0].programCostPerYear ? data[0].programCostPerYear / 12 : 0,
                    costPerYear: data[0].isCostPerYear ? data[0].programCostPerYear : 0,
                    flatCost: data[0].programFlatCost ? data[0].programFlatCost : 0,
                    costType: data[0].isCostPerYear ? 'per year' : data[0].programCostPerYear ? 'per month' : 'per use',
                    monthsPerRenewal: 0,
                })

                setProgRows([
                    [
                        0,
                        format(data[0].programLicenseKey ? data[0].programLicenseKey : '-'),
                        format(data[0].programPurchaseLink),
                    ],
                ])
                setHistoryList(data[0].entries)

                //TODO: populate employee dropdown
            })
            .catch((err: any) => console.error(err))
    }, [])

    const handleSubmit = () => {
        //TODO: post
    }

    return (
        <div className={styles.columns}>
            {/* column 1 */}

            <div className={styles.firstColumn}>
                <Button
                    text={progData.name + ' ' + match.params.id}
                    icon='back'
                    onClick={() => {
                        history.push(`/programs/details/${match.params.id}`)
                    }}
                    className={styles.backButton}
                    textClassName={styles.backButtonText}
                />
                <PictureInput setImage={setImgInput} />
            </div>
            {/* column 2 */}
            <div className={styles.secondColumn}>
                <div className={s(styles.title, styles.paddingBottom)}>Program Information</div>

                {formState && <ProgramForm state={formState} setState={setFormState} />}

                <div className={styles.assignContainer}>
                    <div className={styles.empText}>
                        Currently {progData.employee ? ' Assigned to ' + progData.employee : ' Unassigned'}
                    </div>

                    <Button className={s(styles.input, styles.employeeDropdownButton)}>
                        <div className={s(dropdownStyles.dropdownContainer, styles.employeeDropdownContainer)}>
                            <DropdownList
                                triggerElement={({isOpen, toggle}) => (
                                    <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                        <div className={s(dropdownStyles.dropdownTitle, styles.employeeDropdownTitle)}>
                                            <div>Assign To Employee</div>
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

                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} />
                </div>
            </div>
        </div>
    )
}
