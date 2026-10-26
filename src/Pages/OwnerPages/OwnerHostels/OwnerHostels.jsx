import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  fetchHostels,
  addHostel,
  updateHostel,
  deleteHostel
} from '../../../Redux/Slices/hostelSlice'
import { uploadImageToCloudinary } from '../../../Services/cloudinaryAPI'
import styles from './OwnerHostels.module.css'

const OwnerHostels = () => {
  const dispatch = useDispatch()

  const { hostels, loading } = useSelector(
    state => state.hostels
  )

  const [showForm, setShowForm] = useState(false)
  const [editingHostel, setEditingHostel] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    image: '',
    facilities: ''
  })

  const loggedInUser = JSON.parse(
    localStorage.getItem('hostelHubUser')
  )

  const ownerId = loggedInUser?.id

  useEffect(() => {
    dispatch(fetchHostels())
  }, [dispatch])

  const ownerHostels = hostels.filter(
    hostel => hostel.ownerId === ownerId
  )

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setImageUploading(true)

      const response = await uploadImageToCloudinary(file)

      setFormData(prev => ({
        ...prev,
        image: response.secure_url
      }))

      toast.success('Image uploaded successfully')
    } catch (error) {
      console.log(error)
      toast.error('Image upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      description: '',
      image: '',
      facilities: ''
    })

    setEditingHostel(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const {
      name,
      location,
      address,
      description,
      image,
      facilities
    } = formData

    if (!name || !location || !address || !description) {
      toast.error('Please fill all required fields')
      return
    }

    if (imageUploading) {
      toast.error('Please wait for the image upload to finish')
      return
    }

    const hostelData = {
      ownerId,
      name,
      location,
      address,
      description,
      image,
      facilities: facilities
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== ''),
      status: editingHostel
        ? editingHostel.status
        : 'pending'
    }

    try {
      if (editingHostel) {
        await dispatch(
          updateHostel({
            id: editingHostel.id,
            hostelData
          })
        ).unwrap()

        toast.success('Hostel updated successfully')
      } else {
        await dispatch(
          addHostel(hostelData)
        ).unwrap()

        toast.success('Hostel added successfully')
      }

      resetForm()
    } catch (error) {
      console.log(error)
      toast.error('Operation failed')
    }
  }

  const handleEdit = (hostel) => {
    setEditingHostel(hostel)

    setFormData({
      name: hostel.name || '',
      location: hostel.location || '',
      address: hostel.address || '',
      description: hostel.description || '',
      image: hostel.image || '',
      facilities: hostel.facilities
        ? hostel.facilities.join(', ')
        : ''
    })

    setShowForm(true)
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this hostel?'
    )

    if (!confirmDelete) return

    try {
      await dispatch(deleteHostel(id)).unwrap()
      toast.success('Hostel deleted successfully')
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete hostel')
    }
  }

  return (
    <div className={styles.page}>

      <div className={styles.topSection}>
        <div>
          <h1>My Hostels</h1>
          
        </div>

        <button
          className={styles.addButton}
          onClick={() => {
            setEditingHostel(null)

            setFormData({
              name: '',
              location: '',
              address: '',
              description: '',
              image: '',
              facilities: ''
            })

            setShowForm(true)
          }}
        >
          + Add Hostel
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>

          <div className={styles.formHeader}>
            <div>
              <h2>
                {editingHostel
                  ? 'Edit Hostel'
                  : 'Add New Hostel'}
              </h2>

              <p>
                Enter the hostel information below.
              </p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className={styles.formGrid}>

              <div className={styles.formGroup}>
                <label>Hostel Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hostel name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Location *</label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Example: Moolamattom"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Hostel Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <small>
                  Maximum image size: 5MB
                </small>
              </div>

            </div>

            {imageUploading && (
              <div className={styles.uploading}>
                Uploading image...
              </div>
            )}

            {formData.image && (
              <div className={styles.previewContainer}>
                <p>Image Preview</p>

                <img
                  src={formData.image}
                  alt="Hostel preview"
                  className={styles.previewImage}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Description *</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your hostel"
                rows="4"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Facilities</label>

              <input
                type="text"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                placeholder="WiFi, Food, Parking, Laundry"
              />

              <small>
                Separate facilities using commas.
              </small>
            </div>

            <div className={styles.formActions}>

              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading || imageUploading}
              >
                {imageUploading
                  ? 'Uploading Image...'
                  : loading
                    ? 'Saving...'
                    : editingHostel
                      ? 'Update Hostel'
                      : 'Add Hostel'}
              </button>

            </div>

          </form>

        </div>
      )}

      {loading && ownerHostels.length === 0 ? (
        <div className={styles.loading}>
          Loading hostels...
        </div>
      ) : ownerHostels.length === 0 ? (
        <div className={styles.emptyState}>

          <div className={styles.emptyIcon}>
            🏠
          </div>

          <h2>No Hostels Yet</h2>

          <p>
            You have not added any hostels yet.
          </p>

          <button
            className={styles.addButton}
            onClick={() => setShowForm(true)}
          >
            + Add Your First Hostel
          </button>

        </div>
      ) : (
        <div className={styles.hostelGrid}>

          {ownerHostels.map(hostel => (
            <div
              className={styles.hostelCard}
              key={hostel.id}
            >

              <div className={styles.imageContainer}>

                {hostel.image ? (
                  <img
                    src={hostel.image}
                    alt={hostel.name}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    🏠
                  </div>
                )}

                <span
                  className={`${styles.status} ${
                    hostel.status === 'approved'
                      ? styles.approved
                      : styles.pending
                  }`}
                >
                  {hostel.status}
                </span>

              </div>

              <div className={styles.cardContent}>

                <h2>{hostel.name}</h2>

                <p className={styles.location}>
                  📍 {hostel.location}
                </p>

                <p className={styles.address}>
                  {hostel.address}
                </p>

                <p className={styles.description}>
                  {hostel.description}
                </p>

                <div className={styles.facilities}>

                  {hostel.facilities?.map(
                    (facility, index) => (
                      <span key={index}>
                        {facility}
                      </span>
                    )
                  )}

                </div>

                <div className={styles.cardActions}>

                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(hostel)}
                  >
                    Edit
                  </button>

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(hostel.id)}
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default OwnerHostels