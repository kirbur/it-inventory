import {AxiosService, URL} from '../services/AxiosService/AxiosService'

export async function checkImage(img: string, axios: AxiosService, placeholder: string) {
    var arr: string[] = []
    await axios
        .get(img)
        .then((data: any) => {
            arr.push(data === '' ? placeholder : URL + img)
        })
        .catch((err: any) => console.error(err))

    return arr[0]
}
