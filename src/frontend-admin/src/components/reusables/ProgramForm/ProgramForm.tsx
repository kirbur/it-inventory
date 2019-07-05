import React from 'react'

// Packages
import DatePicker from 'react-datepicker'

// Components
import {Group} from '../Group/Group'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramForm.module.css'

// Types
interface IProgramFormProps {
    state: any
    setState: any
}

// Primary Component
export const ProgramForm: React.SFC<IProgramFormProps> = props => {
    const {state, setState} = props

    return (
        <div className={styles.formMain}>
            <Group direction={'row'} justify={'between'}>
                <div className={styles.dateInputContainer}>
                    <div className={styles.inputText}>Purchase Date</div>
                    <DatePicker
                        dateFormat='MM/dd/yyyy'
                        selected={state.purchaseDate}
                        onChange={e => e && setState({...state, purchaseDate: e})}
                        className={styles.input}
                    />
                </div>
                <div className={styles.dateInputContainer}>
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
                <Group direction={'row'} className={styles.costGroup}>
                    <div className={styles.container}>
                        <input
                            type='radio'
                            name='cost'
                            className={styles.checkmark}
                            checked={state.costType === 'per month'}
                            onChange={() => setState({...state, costType: 'per month'})}
                        />
                        <div className={styles.checkmark} />
                        <div className={styles.insideCheckmark} />
                    </div>
                    <div>
                        <div className={styles.inputText}>Cost per Month</div>
                        <input
                            className={s(styles.input, styles.costInput)}
                            type='number'
                            value={state.cost}
                            onChange={cost => setState({...state, cost: parseInt(cost.target.value)})}
                        />
                    </div>
                </Group>

                <Group direction={'row'} className={styles.costGroup}>
                    <div className={styles.container}>
                        <input
                            type='radio'
                            name='cost'
                            className={styles.checkmark}
                            checked={state.costType === 'per year'}
                            onChange={() => setState({...state, costType: 'per year'})}
                        />
                        <div className={styles.checkmark} />
                        <div className={styles.insideCheckmark} />
                    </div>
                    <div>
                        <div className={styles.inputText}>Cost per Year</div>
                        <input
                            className={s(styles.input, styles.costInput)}
                            type='number'
                            value={state.cost}
                            onChange={cost => setState({...state, cost: parseInt(cost.target.value)})}
                        />
                    </div>
                </Group>

                <Group direction={'row'} className={styles.costGroup}>
                    <div className={styles.container}>
                        <input
                            type='radio'
                            name='cost'
                            className={styles.checkmark}
                            checked={state.costType === 'per use'}
                            onChange={() => setState({...state, costType: 'per use'})}
                        />
                        <div className={styles.checkmark} />
                        <div className={styles.insideCheckmark} />
                    </div>
                    <div>
                        <div className={styles.inputText}>Cost per License</div>
                        <input
                            className={s(styles.input, styles.costInput)}
                            type='number'
                            value={state.cost}
                            onChange={cost => setState({...state, cost: parseInt(cost.target.value)})}
                        />
                    </div>
                </Group>
            </Group>
            <div className={styles.line} />

            <Group direction={'row'} justify={'between'}>
                <div className={styles.inputContainer}>
                    <div className={styles.inputText}>License Key</div>
                    <input
                        type='text'
                        className={s(styles.input, styles.pluginInput)}
                        value={state.licenseKey}
                        onChange={e => setState({...state, licenseKey: e.target.value})}
                    />
                </div>

                <div className={styles.inputContainer}>
                    <div className={styles.inputText}>Purchase Link</div>
                    <input
                        type='text'
                        className={s(styles.input, styles.pluginInput)}
                        value={state.link}
                        onChange={e => setState({...state, link: e.target.value})}
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
