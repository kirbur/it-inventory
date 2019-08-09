import {AxiosService} from '../services/AxiosService/AxiosService';

/*
putUploadImage takes a file, and the absolute path, with the service class 
    and an optional callback and will upload an image.
*/
export const putUploadImage = (image: File, imageLocation: string, axios: AxiosService, callback?: () => void) => {
    var formData = new FormData()
    formData.append('file', image)

    axios
        .put(imageLocation, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        })
        .then(() => callback && callback())
        .catch(err => console.error(err))
}


