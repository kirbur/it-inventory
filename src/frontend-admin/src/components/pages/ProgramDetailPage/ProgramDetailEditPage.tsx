import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {GoCloudUpload} from 'react-icons/go'
import {PictureInput} from '../../reusables/PictureInput/PictureInput'
import DatePicker from 'react-datepicker'
import {ProgramForm, IProgramFormInputs} from '../../reusables/ProgramForm/ProgramForm'

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
    const [formState, setFormState] = useState<IProgramFormInputs>()
    const [imgInput, setImgInput] = useState<File>()

    useEffect(() => {
        axios
            .get(`/detail/program/${match.params.id}`)
            .then((data: any) => {
                setProgData({
                    name: data[0].programName,
                })

                setFormState({
                    name: data[0].programName,
                    programName: data[0].programName,
                    description: data[0].description,
                    renewalDate: new Date(data[0].renewalDate),
                    purchaseDate: new Date(data[0].dateBought),
                    purchaseLink: data[0].programPurchaseLink,
                    licenseKey: data[0].programLicenseKey,

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

                <div className={styles.submitContainer}>
                    <Button text='Submit' onClick={handleSubmit} />
                </div>
            </div>
        </div>
    )
}
