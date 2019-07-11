import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {Button} from '../../reusables/Button/Button'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import {ProgramForm, IProgramFormInputs} from '../../reusables/ProgramForm/ProgramForm'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './ProgramDetailEditPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

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
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)

    const axios = new AxiosService(accessToken, refreshToken)
    const [progData, setProgData] = useState<any>({})

    const [employeeDropdown, setEmployeeDropdown] = useState<any[]>()
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>()

    //input feild states:
    const [programInput, setProgramInput] = useState<IProgramFormInputs>()
    const [imgInput, setImgInput] = useState<File>()

    useEffect(() => {
        axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                    employee: data[0].employeeName,
                })

                setProgramInput({
                    name: {value: data[0].programName, changed: false},
                    programName: {value: data[0].programName, changed: false},
                    description: {value: data[0].description, changed: false},
                    renewalDate: {value: new Date(data[0].renewalDate), changed: false},
                    purchaseDate: {value: new Date(data[0].dateBought), changed: false},
                    purchaseLink: {value: data[0].programPurchaseLink, changed: false},
                    licenseKey: {value: data[0].programLicenseKey ? data[0].programLicenseKey : '', changed: false},
                    cost: {value: data[0].programCostPerYear, changed: false},
                    flatCost: {value: data[0].programFlatCost ? data[0].programFlatCost : 0, changed: false},
                    monthsPerRenewal: {
                        value: data[0].monthsPerRenewal
                            ? data[0].monthsPerRenewal
                            : 1 /*TODO: make sure this is added*/,
                        changed: false,
                    },
                    isLicense: {value: false, changed: false},
                })

                const employees: any[] = []
                data[0].listOfEmployees.map((i: any) =>
                    employees.push({
                        name: i.employeeName,
                        id: i.employeeId,
                    })
                )
                setEmployeeDropdown(employees)
                setSelectedEmployee({name: data[0].employeeName, id: data[0].employeeId})
            })
            .catch((err: any) => console.error(err))
    }, [])

    const handleSubmit = () => {
        //update image
        if (imgInput) {
            var formData = new FormData()
            formData.append('file', imgInput)

            axios
                .put(`/image/program/${match.params.id}`, formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                })
                .catch(err => console.error(err))
        }

        //update program info
        if (programInput) {
            var updateProgram = {
                program: {
                    ProgramName: progData.name,
                    ProgramCostPerYear: programInput.cost.value, //TODO: ask if this needs to be calculated to yearly
                    ProgramFlatCost: programInput.flatCost.value,
                    ProgramLicenseKey: programInput.licenseKey.value,
                    ProgramDescription: programInput.description.value,
                    ProgramPurchaseLink: programInput.purchaseLink.value,
                    DateBought: programInput.purchaseDate.value.toISOString(),
                    RenewalDate: programInput.renewalDate.value.toISOString(),
                    MonthsPerRenewal: programInput.monthsPerRenewal.value,
                    EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,
                },
            }

            axios.put(`update/program/${match.params.id}`, updateProgram).catch((err: any) => console.error(err))
            history.push(`/programs/details/${match.params.id}`)
        }
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

                {programInput && <ProgramForm state={programInput} setState={setProgramInput} />}

                <div className={styles.assignContainer}>
                    <div className={styles.empText}>Assign to:</div>

                    <Button className={s(styles.input, styles.employeeDropdownButton)}>
                        <div className={s(dropdownStyles.dropdownContainer, styles.employeeDropdownContainer)}>
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
                                                    {selectedEmployee ? selectedEmployee.name : 'Select An Employee'}
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
                                    listWidthClass={styles.dropdownContent}
                                />
                            )}
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
