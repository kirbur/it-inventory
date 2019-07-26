import {AxiosService} from '../services/AxiosService/AxiosService'

export async function checkImage(img: string, axios: AxiosService, placeholder: string) {
    let image: string = ""
    await axios
        .get(img, "blob")
        .then((data: any) => {
            if (data.size !== 0) {
                let objectURL: string = window.URL.createObjectURL(new Blob([data], {type: data.type}))
                image = objectURL
            }
            else {
                image = placeholder
            }
        })
        .catch((err: any) => console.error(err))

    return image
}
