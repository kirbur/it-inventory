import React from 'react'
import styles from './DetailImage.module.css'
import {concatStyles} from '../../../utilities/mikesConcat'

interface IDetailImageProps {
    src: string;
}

/*
DetailImage will render an image with a grey background and padding.
Will scale the image as the page flexes.
*/
export const DetailImage: React.FC<IDetailImageProps> = props => {
    const {
        src,
    } = props

    return (
        <div className={styles.imgContainer}>
            <div className={styles.imgPadding}>
                <img className={styles.img} src={src} alt={''} />
            </div>
        </div>
    )
}
