import React from 'react'

// Packages
import DatePicker from 'react-datepicker'

// Components
import {Button} from '../Button/Button'
import {Group} from '../Group/Group'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './ProgramForm.module.css'

// Types
interface IProgramFormProps {
    state: any
    setState: any
    submit: any
}

// Primary Component
export const ProgramForm: React.SFC<IProgramFormProps> = props => {
    const {state, setState, submit} = props

    return (
        <div className={styles.formMain}>
            <div className={s(styles.title, styles.paddingBottom)}>Program Information</div>

            <Group direction={'row'}>
                <div>
                    <div className={styles.inputtext}>Purchase Date</div>
                    <DatePicker
                        dateFormat='yyyy/MM/dd'
                        selected={state.purchaseDate}
                        onChange={e => e && setState({...state, purchaseDate: e})}
                        className={styles.input}
                    />
                </div>
                <div>
                    <div className={styles.inputtext}>Renewal Date</div>
                    <DatePicker
                        dateFormat='yyyy/MM/dd'
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
                        <div className={styles.inputtext}>Cost per Month</div>
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
                        <div className={styles.inputtext}>Cost per Year</div>
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
                        <div className={styles.inputtext}>Cost per License</div>
                        <input
                            className={s(styles.input, styles.costInput)}
                            type='number'
                            value={state.cost}
                            onChange={cost => setState({...state, cost: parseInt(cost.target.value)})}
                        />
                    </div>
                </Group>
            </Group>

            <Group direction={'row'}>
                <div>
                    <div className={styles.inputText}>License Key</div>
                    <input
                        type='number'
                        className={s(styles.input, styles.pluginInput)}
                        value={state.licenseKey}
                        onChange={e => setState({...state, licenseKey: e.target.value})}
                    />
                </div>

                <div>
                    <div className={styles.inputText}>License Key</div>
                    <input
                        type='number'
                        className={s(styles.input, styles.pluginInput)}
                        value={state.licenseKey}
                        onChange={e => setState({...state, licenseKey: e.target.value})}
                    />
                </div>
            </Group>

            <Button text='Submit Copies' onClick={submit} className={styles.submitButton} />
        </div>
    )
}
