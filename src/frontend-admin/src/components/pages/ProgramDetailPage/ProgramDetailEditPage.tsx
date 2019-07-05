import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {GoCloudUpload} from 'react-icons/go'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import DatePicker from 'react-datepicker'
import {ProgramForm} from '../../reusables/ProgramForm/ProgramForm'

// Utils
import {formatDate} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './ProgramDetailEditPage.module.css'

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

    //input feild states:
    const [formState, setFormState] = useState<{
        name: string
        programName: string
        description: string
        costPerMonth: number
        flatCost: number
        renewalDate: Date
        monthsPerRenewal: number
        purchaseDate: Date
    }>({
        name: '',
        programName: '',
        description: '',
        costPerMonth: 0,
        flatCost: 0,
        renewalDate: new Date(),
        monthsPerRenewal: 0,
        purchaseDate: new Date(),
    })
    const [imgInput, setImgInput] = useState<File>()
    const [purchaseInput, setPurchaseInput] = useState<Date>(new Date())
    const [renewalInput, setRenewalInput] = useState<Date>(new Date())
    const [costInput, setCostInput] = useState<number>(0)
    const [costTypeInput, setCostTypeInput] = useState<'per month' | 'per year' | 'per use'>('per month')

    useEffect(() => {
        axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                    dateBought: formatDate(data[0].dateBought),
                    description: format(data[0].description),
                    employee: format(data[0].employeeName),
                    employeeId: format(data[0].employeeId),
                    icon: format(data[0].picture),
                    renewalDate: formatDate(data[0].renewalDate),
                    isCostPerYear: data[0].isCostPerYear,
                    flatCost: data[0].programFlatCost,
                    costPerYear: data[0].programFlatCost,
                })

                setFormState({
                    name: data[0].programName,
                    programName: data[0].programName,
                    description: data[0].description,
                    renewalDate: new Date(data[0].renewalDate),
                    monthsPerRenewal: 0,
                    purchaseDate: new Date(data[0].dateBought),
                    ...formState,
                })
                setProgRows([
                    [
                        0,
                        format(data[0].programLicenseKey ? data[0].programLicenseKey : '-'),
                        format(data[0].programPurchaseLink),
                    ],
                ])
                setHistoryList(data[0].entries)
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
                {/* name and date */}
                <div className={s(styles.title, styles.paddingBottom)}>Program Information</div>

                {/* <Group direction={'row'}>
                    <div>
                        <div className={styles.inputtext}>Purchase Date</div>
                        <DatePicker
                            dateFormat='yyyy/MM/dd'
                            selected={purchaseInput}
                            onChange={e => e && setPurchaseInput(e)}
                            className={styles.input}
                        />
                    </div>
                    <div>
                        <div className={styles.inputtext}>Renewal Date</div>
                        <DatePicker
                            dateFormat='yyyy/MM/dd'
                            selected={renewalInput}
                            onChange={e => e && setRenewalInput(e)}
                            className={styles.input}
                        />
                    </div>
                </Group>

                <Group direction={'row'} justify={'between'}>
                    <Group direction={'row'} className={styles.costGroup}>
                        <div className={styles.container}>
                            <input
                                type='radio'
                                name='cost'
                                className={styles.checkmark}
                                checked={costTypeInput === 'per month'}
                                onChange={() => setCostTypeInput('per month')}
                            />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmark} />
                        </div>
                        <div>
                            <div className={styles.inputtext}>Cost per Month</div>
                            <input
                                className={s(styles.input, styles.costInput)}
                                type='number'
                                onChange={cost => setCostInput(parseInt(cost.target.value))}
                            />
                        </div>
                    </Group>

                    <Group direction={'row'} className={styles.costGroup}>
                        <div className={styles.container}>
                            <input
                                type='radio'
                                name='cost'
                                className={styles.checkmark}
                                checked={costTypeInput === 'per year'}
                                onChange={() => setCostTypeInput('per year')}
                            />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmark} />
                        </div>
                        <div>
                            <div className={styles.inputtext}>Cost per Year</div>
                            <input
                                className={s(styles.input, styles.costInput)}
                                type='number'
                                onChange={cost => setCostInput(parseInt(cost.target.value))}
                            />
                        </div>
                    </Group>

                    <Group direction={'row'} className={styles.costGroup}>
                        <div className={styles.container}>
                            <input
                                type='radio'
                                name='cost'
                                className={styles.checkmark}
                                checked={costTypeInput === 'per use'}
                                onChange={() => setCostTypeInput('per use')}
                            />
                            <div className={styles.checkmark} />
                            <div className={styles.insideCheckmark} />
                        </div>
                        <div>
                            <div className={styles.inputtext}>Cost per License</div>
                            <input
                                className={s(styles.input, styles.costInput)}
                                type='number'
                                onChange={cost => setCostInput(parseInt(cost.target.value))}
                            />
                        </div>
                    </Group>
                </Group> */}

                <div className={styles.formContainer}>
                    <ProgramForm state={formState} setState={setFormState} />
                </div>

                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} className={styles.submitbutton} />
                </div>
            </div>
        </div>
    )
}
