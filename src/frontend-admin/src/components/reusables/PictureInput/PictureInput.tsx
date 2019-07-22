import React from 'react'

import {GoCloudUpload} from 'react-icons/go'

// Styles
import styles from './PictureInput.module.css'

// Types
interface IPictureInputProps {
    setImage: any
    image: any
    className?: string
}

// Helpers

// Primary Component
export const PictureInput: React.SFC<IPictureInputProps> = props => {
    const {setImage, image} = props
    //const [selected, setSelected] = <>()
    const getImg = () => {
        if (image) {
            return URL.createObjectURL(image)
        }

        return ''
    }
    return (
        <div className={styles.pictureInputMain}>
            <div className={styles.imgContainer}>
                {image ? (
                    <img src={getImg()} alt={''} className={styles.selectedImage} />
                ) : (
                    <GoCloudUpload size={300} className={styles.cloudIcon} onClick={() => {}} />
                )}
            </div>
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
