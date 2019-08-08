import {AxiosService} from '../services/AxiosService/AxiosService';

/*
uploadImage takes a file, and the absolute path, with the service class 
    and an optional callback and will upload an image.
*/
export const uploadImage = async (image: File, imageLocation: string, axios: AxiosService, callback?: () => void) => {
    var formData = new FormData()
    formData.append('file', image)

    await axios
        .put(imageLocation, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        })
        .catch(err => console.error(err))
    callback && callback()
}


