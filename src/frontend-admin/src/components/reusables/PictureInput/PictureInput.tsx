import React from 'react'

import {GoCloudUpload} from 'react-icons/go'

// Styles
import styles from './PictureInput.module.css'

// Types
interface IPictureInputProps {
    setImage: any
    className?: string
}

// Helpers

// Primary Component
export const PictureInput: React.SFC<IPictureInputProps> = props => {
    const {setImage} = props

    return (
        <div className={styles.pictureInputMain}>
            <GoCloudUpload size={300} className={styles.cloudIcon} onClick={() => {}} />
            <input
                className={styles.imgInput}
                type='file'
                accept='image/*'
                onChange={e => {
                    var files = e.target.files
                    files && files[0] && setImage(files[0])
                }}
            />
        </div>
    )
}
