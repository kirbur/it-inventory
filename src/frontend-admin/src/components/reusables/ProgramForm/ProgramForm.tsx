import React from 'react'

// Packages
import DatePicker from 'react-datepicker'

// Components
import {Group} from '../Group/Group'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramForm.module.css'

// Types
export interface IProgramFormInputs {
    name: string
    programName: string
    description: string
    cost: number
    flatCost: number
    renewalDate: Date
    monthsPerRenewal: number
    purchaseDate: Date
    purchaseLink: string
    licenseKey: string
    isLicense: boolean
}

interface IProgramFormProps {
    state: IProgramFormInputs
    setState: any
}

// Primary Component
export const ProgramForm: React.SFC<IProgramFormProps> = props => {
    const {state, setState} = props

    return (
        <div className={styles.formMain}>
            <Group direction={'row'}>
                <div className={styles.row1Input}>
                    <div className={styles.inputText}>Purchase Date</div>
                    <DatePicker
                        dateFormat='MM/dd/yyyy'
                        selected={state.purchaseDate}
                        onChange={e => e && setState({...state, purchaseDate: e})}
                        className={styles.input}
                    />
                </div>
                <div className={styles.row1Input}>
                    <div className={styles.inputText}>Renewal Date</div>
                    <DatePicker
                        dateFormat='MM/dd/yyyy'
                        selected={state.renewalDate}
                        onChange={e => e && setState({...state, renewalDate: e})}
                        className={styles.input}
                    />
                </div>
            </Group>

            <Group direction={'row'} justify={'between'}>
                {/* Cost Group */}
                <div className={styles.row2Input}>
                    <div className={styles.inputText}>Flat Cost</div>
                    <input
                        className={s(styles.input, styles.costInput)}
                        type='number'
                        step='0.01'
                        value={state.flatCost}
                        onChange={cost =>
                            setState({
                                ...state,
                                flatCost: parseFloat(cost.target.value),
                            })
                        }
                    />
                </div>
                <div className={styles.row2Input}>
                    <div className={styles.inputText}>Recurring Cost</div>
                    <input
                        className={s(styles.input, styles.costInput)}
                        type='number'
                        step='0.01'
                        value={state.cost}
                        onChange={cost =>
                            setState({
                                ...state,
                                cost: parseFloat(cost.target.value),
                            })
                        }
                    />
                </div>
                <div className={styles.row2Input}>
                    <div className={styles.inputText}># of Months per Renewal</div>
                    <input
                        type='number'
                        className={styles.input}
                        value={state.monthsPerRenewal}
                        onChange={e =>
                            setState({
                                ...state,
                                monthsPerRenewal: parseInt(e.target.value),
                            })
                        }
                    />
                </div>
            </Group>
            <div className={styles.line} />

            <Group direction={'row'} justify={'between'}>
                <div className={styles.inputContainer}>
                    <div className={styles.inputText}>License Key</div>
                    <input
                        type='text'
                        className={styles.input}
                        value={state.licenseKey}
                        onChange={e => setState({...state, licenseKey: e.target.value})}
                    />
                </div>

                <div className={styles.inputContainer}>
                    <div className={styles.inputText}>Purchase Link</div>
                    <input
                        type='text'
                        className={styles.input}
                        value={state.purchaseLink}
                        onChange={e => setState({...state, purchaseLink: e.target.value})}
                    />
                </div>
            </Group>
            <div className={s(styles.inputContainer, styles.descriptionContainer)}>
                <div className={styles.inputText}>Description</div>
                <textarea
                    className={s(styles.input, styles.description)}
                    value={state.description}
                    onChange={e => setState({...state, description: e.target.value})}
                />
            </div>

            <div className={styles.line} />
        </div>
    )
}
