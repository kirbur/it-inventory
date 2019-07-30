import React, {useState} from 'react'
import {PieChart, Pie, Cell} from 'recharts'
import {CustomLabel} from './CustomLabel/CustomLabel'
import styles from './PieChart.module.css'

// Types
export interface IRechartPieDatum {
    name: string
    value: number
    id: string //the id is to rout to the dept detail page
}

export interface IPieDataProps {
    headingName: string
    data: IRechartPieDatum[]
}

interface IRechartPieProps {
    pieChartData: IPieDataProps[]
    initialColors: string[]
    onSliceClick?: any
}

export const RechartPieChart: React.FunctionComponent<IRechartPieProps> = props => {
    const {pieChartData, initialColors, onSliceClick} = props

    const [colors, setColors] = useState(initialColors)
    //colors off of invision: ['#009EFF', '#FF9340', '#3D4599', '#1425CC', '#CC4A14']

    const onMouseOver = (data: IRechartPieDatum[], index: number) => {
        const updatedColors = [...initialColors] // Create clone of initial colors array
        updatedColors[index] = initialColors[index] + 95 // Change particular index in our cloned array
        setColors(updatedColors) // Set new color array
    }

    const onMouseOut = () => {
        setColors(initialColors)
    }

    function hasData(i: number) {
        for (let j = 0; j < pieChartData[i].data.length; j++) {
            if (pieChartData[i].data[j].value > 0) {
                return true
            }
        }
        return false
    }

    return (
        <div className={styles.pieContainer}>
            {/* Headers */}
            <div className={styles.inline}>
                {pieChartData.map((datum, i) => (
                    <h3
                        key={datum.headingName}
                        className={i === pieChartData.length - 1 ? styles.lastHeader : styles.header}
                    >
                        {datum.headingName}
                        {datum.headingName === 'Hardware' && <div className={styles.headingText}>*last 30 days</div>}
                    </h3>
                ))}
            </div>

            {/* Pie Charts */}
            <div className={styles.inline}>
                <PieChart width={340 * pieChartData.length} height={300}>
                    {pieChartData.map((datum, j) => (
                        <Pie
                            key={datum.headingName}
                            data={datum.data}
                            cx={170 + 340 * j}
                            cy={150}
                            dataKey='value'
                            fill='#8884d8'
                            labelLine={false}
                            label={<CustomLabel data={datum.data} />}
                            isAnimationActive={false}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}
                        >
                            {datum.data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index]}
                                    onClick={
                                        onSliceClick
                                            ? () => {
                                                  onSliceClick(entry.id)
                                              }
                                            : undefined
                                    }
                                />
                            ))}
                        </Pie>
                    ))}
                </PieChart>
            </div>

            {/* empty pies */}
            {pieChartData.map((datum, i) =>
                hasData(i) ? (
                    <div />
                ) : (
                    <div className={styles.circleContainer} style={{position: 'relative', left: 10 + 340 * i}}>
                        <div className={styles.emptyCircle} />
                        <div className={styles.emptyDataText}>No data to display</div>
                    </div>
                )
            )}

            {/* Legend */}
            <div className={styles.inlineLegend}>
                {pieChartData[0].data.map((datum, index) => (
                    <div
                        key={index}
                        className={styles.legendList}
                        onClick={
                            onSliceClick
                                ? () => {
                                      onSliceClick(datum.id)
                                  }
                                : undefined
                        }
                    >
                        <div className={styles.circle} style={{backgroundColor: colors[index]}} />
                        {datum.name}
                    </div>
                ))}
            </div>
        </div>
    )
}
