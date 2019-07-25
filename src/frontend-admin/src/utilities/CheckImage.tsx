import {AxiosService, URL} from '../services/AxiosService/AxiosService'

export async function checkImage(img: string, axios: AxiosService, placeholder: string) {
    var image = ''
    await axios
        .get(img)
        .then((data: any) => {
            image = data === '' ? placeholder : URL + img
        })
        .catch((err: any) => console.error(err))

    return image
}
