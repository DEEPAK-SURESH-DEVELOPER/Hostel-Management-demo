
import axiosInstance from './axiosInstance'

const apiServices = async (httpMethod, url, reqBody) => {
    return await axiosInstance({
        method: httpMethod,
        url: url,
        data: reqBody
    })
}

export default apiServices
