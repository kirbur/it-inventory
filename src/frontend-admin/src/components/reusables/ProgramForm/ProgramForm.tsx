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
    name: {value: string; changed: boolean}
    programName: {value: string; changed: boolean}
    description: {value: string; changed: boolean}
    cost: {value: number; changed: boolean}
    flatCost: {value: number; changed: boolean}
    renewalDate: {value: Date; changed: boolean}
    monthsPerRenewal: {value: number; changed: boolean}
    purchaseDate?: {value: Date; changed: boolean}
    purchaseLink: {value: string; changed: boolean}
    licenseKey: {value: string; changed: boolean}
    numCopies?: {value: number; changed: boolean}
}

interface IProgramFormProps {
    state: IProgramFormInputs
    setState: Function
}

// Primary Component
export const ProgramForm: React.SFC<IProgramFormProps> = props => {
    const {state, setState} = props

    return (
        <div className={styles.formMain}>
            <Group direction={'row'} justify={'between'}>
                <div className={styles.dateContainer}>
                    {state.purchaseDate && state.purchaseDate.value !== undefined && (
                        <div className={styles.dateInput}>
                            <div className={styles.inputText}>Purchase Date</div>
                            <DatePicker
                                dateFormat='MM/dd/yyyy'
                                selected={state.purchaseDate.value}
                                onChange={e => e && setState({...state, purchaseDate: {value: e, changed: true}})}
                                className={styles.input}
                            />
                        </div>
                    )}
                    <div className={styles.dateInput}>
                        <div className={styles.inputText}>Renewal Date</div>
                        <DatePicker
                            dateFormat='MM/dd/yyyy'
                            selected={state.renewalDate.value}
                            onChange={e => e && setState({...state, renewalDate: {value: e, changed: true}})}
                            className={styles.input}
                        />
                    </div>
                </div>
                {state.numCopies && state.numCopies.value !== undefined && (
                    <div className={styles.row1Input}>
                        <div className={styles.inputText}># of Copies</div>
                        <input
                            className={s(styles.input, styles.costInput)}
                            type='number'
                            value={state.numCopies.value}
                            onChange={cost =>
                                setState({
                                    ...state,
                                    numCopies: {value: parseInt(cost.target.value), changed: true},
                                })
                            }
                        />
                    </div>
                )}
            </Group>

            <Group direction={'row'} justify={'between'}>
                {/* Cost Group */}
                <div className={styles.row2Input}>
                    <div className={styles.inputText}>Flat Cost</div>
                    <input
                        className={s(styles.input, styles.costInput)}
                        type='number'
                        step='0.01'
                        value={state.flatCost.value}
                        onChange={cost =>
                            setState({
                                ...state,
                                flatCost: {value: parseFloat(cost.target.value), changed: true},
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
                        value={state.cost.value}
                        onChange={cost =>
                            setState({
                                ...state,
                                cost: {value: parseFloat(cost.target.value), changed: true},
                            })
                        }
                    />
                </div>
                <div className={styles.row2Input}>
                    <div className={styles.inputText}># of Months per Renewal</div>
                    <input
                        type='number'
                        className={styles.input}
                        value={state.monthsPerRenewal.value}
                        onChange={e =>
                            setState({
                                ...state,
                                monthsPerRenewal: {value: parseInt(e.target.value), changed: true},
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
                        value={state.licenseKey.value}
                        onChange={e => setState({...state, licenseKey: {value: e.target.value, changed: true}})}
                    />
                </div>

                <div className={styles.inputContainer}>
                    <div className={styles.inputText}>Purchase Link</div>
                    <input
                        type='text'
                        className={styles.input}
                        value={state.purchaseLink.value}
                        onChange={e => setState({...state, purchaseLink: {value: e.target.value, changed: true}})}
                    />
                </div>
            </Group>
            <div className={s(styles.inputContainer, styles.descriptionContainer)}>
                <div className={styles.inputText}>Description</div>
                <textarea
                    className={s(styles.input, styles.description)}
                    value={state.description.value}
                    onChange={e => setState({...state, description: {value: e.target.value, changed: true}})}
                />
            </div>

            <div className={styles.line} />
        </div>
    )
}
