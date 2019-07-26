import {AxiosService} from '../services/AxiosService/AxiosService'

export async function checkImage(img: string, axios: AxiosService, placeholder: string) {
    let image: any = ""
    await axios
        .get(img, "blob")
        .then((data: any) => {
            if (data.size !== 0) {
                let outside: any = window.URL.createObjectURL(new Blob([data], {type: data.type}))
                image = outside
            }
            else {
                image = placeholder
            }
        })
        .catch((err: any) => console.error(err))

    return image
}
