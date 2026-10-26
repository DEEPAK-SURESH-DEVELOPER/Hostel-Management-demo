import axios from 'axios'

const CLOUDINARY_CLOUD_NAME = 'mj2vyjqi'
const CLOUDINARY_UPLOAD_PRESET = 'Hostel-HUB'

export const uploadImageToCloudinary = async (imageFile) => {
    const formData = new FormData()

    formData.append('file', imageFile)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
    )

    return response.data
}