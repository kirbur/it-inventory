import React, {useState, useEffect, useContext} from 'react'
import {AxiosService} from '../../../services/AxiosService/AxiosService'

// Components
import {Button} from '../../reusables/Button/Button'
import {ProgramForm, IProgramFormInputs} from '../../reusables/ProgramForm/ProgramForm'
import {History} from 'history'
import {match} from 'react-router-dom'
import {BackButton} from '../../reusables/BackButton/BackButton'

// Utils
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Context
import {LoginContext, ThemeContext} from '../../App/App'

// Styles
import styles from './ProgramDetailEditPage.module.css'

// Types
interface IProgramDetailEditPageProps {
    history: History
    match: match<{id: string}>
}

// Helpers

// Primary Component
export const ProgramDetailEditPage: React.SFC<IProgramDetailEditPageProps> = props => {
    const {history, match} = props

    const {loginContextVariables} = useContext(LoginContext)
    const {isDarkMode} = useContext(ThemeContext)

    const axios = new AxiosService(loginContextVariables)
    const [progData, setProgData] = useState<{name: string; employee: string; dateBought: string}>({
        name: '',
        employee: '',
        dateBought: '',
    })

    const [employeeDropdown, setEmployeeDropdown] = useState<{name: string; id: number}[]>()
    const [selectedEmployee, setSelectedEmployee] = useState<{name: string; id: number}>()

    //input feild states:
    const [programInput, setProgramInput] = useState<IProgramFormInputs>()

    useEffect(() => {
        axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                    employee: data[0].employeeName,
                    dateBought: data[0].dateBought,
                })

                setProgramInput({
                    name: {value: data[0].programName, changed: false},
                    programName: {value: data[0].programName, changed: false},
                    description: {value: data[0].description, changed: false},
                    renewalDate: {value: new Date(data[0].renewalDate), changed: false},
                    purchaseDate: {value: new Date(data[0].dateBought), changed: false},
                    purchaseLink: {value: data[0].programPurchaseLink, changed: false},
                    licenseKey: {value: data[0].programLicenseKey ? data[0].programLicenseKey : '', changed: false},
                    cost: {value: data[0].programCostPerYear / (12 / data[0].monthsPerRenewal), changed: false},
                    flatCost: {value: data[0].programFlatCost ? data[0].programFlatCost : 0, changed: false},
                    monthsPerRenewal: {
                        value: data[0].monthsPerRenewal,
                        changed: false,
                    },
                    hasFlatCost: data[0].programFlatCost > 0 ? true : false,
                    hasRecurringCost: data[0].programCostPerYear > 0 ? true : false,
                })

                const employees: {name: string; id: number}[] = []
                data[0].listOfEmployees.map((i: {employeeName: string; employeeId: number}) =>
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

    async function handleSubmit() {
        //update program info
        if (programInput) {
            var updateProgram = {
                program: {
                    ProgramName: progData.name,
                    ProgramCostPerYear:
                        Number.isNaN(programInput.cost.value) || programInput.cost.value <= 0
                            ? 0
                            : programInput.cost.value * (12 / programInput.monthsPerRenewal.value),
                    ProgramFlatCost: Number.isNaN(programInput.flatCost.value) ? 0 : programInput.flatCost.value,
                    ProgramLicenseKey: programInput.licenseKey.value,
                    Description: programInput.description.value,
                    ProgramPurchaseLink: programInput.purchaseLink.value,
                    DateBought: programInput.purchaseDate
                        ? programInput.purchaseDate.value.toISOString()
                        : progData.dateBought,
                    RenewalDate: programInput.renewalDate.changed ? programInput.renewalDate.value.toISOString() : null,
                    MonthsPerRenewal: Number.isNaN(programInput.monthsPerRenewal.value)
                        ? 0
                        : programInput.monthsPerRenewal.value,
                    EmployeeId: selectedEmployee && selectedEmployee.id !== -1 ? selectedEmployee.id : null,
                },
            }
            await axios.put(`update/program/${match.params.id}`, updateProgram).catch((err: any) => console.error(err))

            history.push({pathname: `/programs/detail/${match.params.id}`, state: {prev: history.location}})
        }
    }

    return (
        <div className={s(styles.columns, isDarkMode ? styles.backgroundDark : {})}>
            {/* column 1 */}

            <div className={styles.firstColumn}>
                <BackButton history={history} className={styles.backButton} />
            </div>
            {/* column 2 */}
            <div className={styles.secondColumn}>
                <div className={s(styles.title, styles.paddingBottom, isDarkMode ? styles.dark : {})}>
                    {progData.name + ' Copy ' + match.params.id + ' '} Information
                </div>

                {programInput && (
                    <ProgramForm
                        state={programInput}
                        setState={setProgramInput}
                        employeeDropdown={employeeDropdown}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                    />
                )}

                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} />
                </div>
            </div>
        </div>
    )
}
