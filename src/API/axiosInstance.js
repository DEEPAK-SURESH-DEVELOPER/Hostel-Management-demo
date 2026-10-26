
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'https://hostel-management-backend-krbl.onrender.com',
    timeout: 5000
})

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Hostel Hub API response received!!!')
        return response
    },
    (error) => {
        if (error.response) {
            const status = error.response.status
            console.log(`Hostel Hub API Error: ${status}`)
        } else if (error.request) {
            console.log('Hostel Hub API server is not responding!!!')
        } else {
            console.log('Hostel Hub API request error:', error.message)
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
