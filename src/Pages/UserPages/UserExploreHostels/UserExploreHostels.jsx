import { useEffect, useMemo, useState } from 'react'
import { FaArrowRight, FaBed, FaBuilding, FaCheck, FaMapMarkerAlt, FaPhone, FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import { addBooking, fetchBookings } from '../../../Redux/Slices/bookingSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import styles from './UserExploreHostels.module.css'

const getRoomCapacity = room => Number(room.capacity) || Number(room.roomType?.match(/\d+/)?.[0]) || 1

const UserExploreHostels = () => {
    const dispatch = useDispatch()
    const { hostels, loading: hostelsLoading } = useSelector(state => state.hostels)
    const { rooms, loading: roomsLoading } = useSelector(state => state.rooms)
    const { bookings } = useSelector(state => state.bookings)
    const { users } = useSelector(state => state.users)
    const [selectedHostel, setSelectedHostel] = useState(null)
    const [activeImage, setActiveImage] = useState('')
    const [roomId, setRoomId] = useState('')
    const [checkInDate, setCheckInDate] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const loggedInUser = JSON.parse(localStorage.getItem('hostelHubUser') || 'null')
    const userId = loggedInUser?.id
    const resident = users.find(user => String(user.id) === String(userId))

    useEffect(() => {
        dispatch(fetchHostels())
        dispatch(fetchRooms())
        dispatch(fetchBookings())
        dispatch(fetchUsers())
    }, [dispatch])

    const hostelsWithAvailability = useMemo(() => hostels
        .filter(hostel => hostel.status === 'approved')
        .map(hostel => {
            const hostelRooms = rooms.filter(room => String(room.hostelId) === String(hostel.id))
            const availableRooms = hostelRooms.map(room => {
                const occupiedBeds = users.filter(user =>
                    user.role === 'user' &&
                    user.status === 'active' &&
                    String(user.roomId) === String(room.id)
                ).length
                return { ...room, availableBeds: Math.max(getRoomCapacity(room) - occupiedBeds, 0) }
            })
            return {
                ...hostel,
                rooms: availableRooms,
                availableBeds: availableRooms.reduce((total, room) => total + room.availableBeds, 0),
                availableRooms: availableRooms.filter(room => room.availableBeds > 0).length
            }
        }), [hostels, rooms, users])

    const images = selectedHostel
        ? [...new Set([selectedHostel.image, ...(Array.isArray(selectedHostel.gallery) ? selectedHostel.gallery : [])].filter(Boolean))]
        : []
    const hostelOwner = selectedHostel
        ? users.find(user => String(user.id) === String(selectedHostel.ownerId) && user.role === 'owner')
        : null
    const contactNumber = hostelOwner?.phone?.trim()
    const callNumber = contactNumber?.replace(/[^\d+]/g, '')
    const availableRooms = selectedHostel?.rooms?.filter(room => room.availableBeds > 0) || []
    const alreadyRequested = selectedHostel && bookings.some(booking =>
        String(booking.userId) === String(userId) &&
        String(booking.hostelId) === String(selectedHostel.id) &&
        ['pending', 'approved'].includes(booking.status)
    )
    const pendingRequestElsewhere = selectedHostel && bookings.find(booking =>
        String(booking.userId) === String(userId) &&
        String(booking.hostelId) !== String(selectedHostel.id) &&
        booking.status === 'pending'
    )
    const hasAssignment = Boolean(resident?.hostelId || resident?.roomId)

    const openHostel = hostel => {
        setSelectedHostel(hostel)
        setActiveImage(hostel.image || hostel.gallery?.[0] || '')
        setRoomId(hostel.rooms.find(room => room.availableBeds > 0)?.id || '')
        setCheckInDate('')
    }

    const closeDetails = () => {
        if (submitting) return
        setSelectedHostel(null)
        setActiveImage('')
    }

    const sendBookingRequest = async event => {
        event.preventDefault()
        if (!roomId || !checkInDate) {
            toast.error('Choose an available room and check-in date.')
            return
        }
        try {
            setSubmitting(true)
            const [latestBookings, latestUsers] = await Promise.all([
                dispatch(fetchBookings()).unwrap(),
                dispatch(fetchUsers()).unwrap()
            ])
            const latestResident = latestUsers.find(user => String(user.id) === String(userId))
            const hasOpenRequest = latestBookings.some(booking =>
                String(booking.userId) === String(userId) &&
                ['pending', 'approved'].includes(booking.status)
            )

            if (!latestResident || latestResident.status !== 'active') {
                toast.error('Your account must be active to request a hostel.')
                return
            }
            if (latestResident.hostelId || latestResident.roomId) {
                toast.error('Vacate your current hostel before requesting another one.')
                return
            }
            if (hasOpenRequest) {
                toast.error('You already have a pending request or approved booking.')
                return
            }

            await dispatch(addBooking({
                userId: String(userId),
                hostelId: String(selectedHostel.id),
                roomId: String(roomId),
                bookingDate: new Date().toISOString().slice(0, 10),
                checkInDate,
                status: 'pending'
            })).unwrap()
            toast.success('Booking request sent to the hostel owner.')
            setSelectedHostel(null)
        } catch {
            toast.error('Could not send your booking request. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>FIND YOUR NEXT STAY</span>
                    <h1>Explore Hostels</h1>
                    
                </div>
                <div className={styles.listingCount}><FaBuilding /><strong>{hostelsWithAvailability.length}</strong><span>Available hostels</span></div>
            </div>

            {(hostelsLoading || roomsLoading) && !hostels.length ? (
                <div className={styles.message}>Loading available hostels…</div>
            ) : hostelsWithAvailability.length ? (
                <div className={styles.grid}>
                    {hostelsWithAvailability.map(hostel => {
                        const coverImage = hostel.image || hostel.gallery?.[0]
                        return (
                            <article className={styles.card} key={hostel.id}>
                                <div className={styles.cover}>
                                    {coverImage ? <img src={coverImage} alt={hostel.name} /> : <div className={styles.imageFallback}><FaBuilding /><span>Hostel photo coming soon</span></div>}
                                    <span className={styles.photoCount}>{(hostel.gallery || []).length + (hostel.image ? 1 : 0)} photos</span>
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.nameRow}><h2>{hostel.name}</h2><span className={styles.beds}><FaBed /> {hostel.availableBeds}</span></div>
                                    <p className={styles.location}><FaMapMarkerAlt /> {hostel.location || hostel.address || 'Location not available'}</p>
                                    <p className={styles.description}>{hostel.description || 'Comfortable accommodation with useful facilities for your stay.'}</p>
                                    <div className={styles.facilityList}>{(hostel.facilities || []).slice(0, 3).map(facility => <span key={facility}><FaCheck /> {facility}</span>)}{(hostel.facilities || []).length > 3 && <span>+{hostel.facilities.length - 3} more</span>}</div>
                                    <div className={styles.roomSummary}><strong>{hostel.availableBeds}</strong> available beds <span>·</span> {hostel.availableRooms} rooms</div>
                                    <button className={styles.detailsButton} onClick={() => openHostel(hostel)}>View hostel details <FaArrowRight /></button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            ) : (
                <div className={styles.empty}><FaBuilding /><h2>No hostels available yet</h2><p>Approved hostels will appear here when they are available for booking.</p></div>
            )}

            {selectedHostel && (
                <div className={styles.overlay} onClick={closeDetails}>
                    <section className={styles.detailsModal} role="dialog" aria-modal="true" aria-labelledby="hostel-title" onClick={event => event.stopPropagation()}>
                        <button className={styles.closeButton} aria-label="Close hostel details" onClick={closeDetails}><FaTimes /></button>
                        <div className={styles.detailHeader}>
                            <span className={styles.eyebrow}>HOSTEL DETAILS</span>
                            <h2 id="hostel-title">{selectedHostel.name}</h2>
                            <p><FaMapMarkerAlt /> {selectedHostel.address || selectedHostel.location || 'Location not available'}</p>
                        </div>
                        <div className={styles.detailColumns}>
                            <div className={styles.photosColumn}>
                                <div className={styles.mainPhoto}>
                                    {activeImage ? <img src={activeImage} alt={`${selectedHostel.name} gallery`} /> : <div className={styles.imageFallback}><FaBuilding /><span>Owner photos will appear here</span></div>}
                                </div>
                                {images.length > 1 && <div className={styles.thumbnails}>{images.map((image, index) => <button key={`${image}-${index}`} className={activeImage === image ? styles.activeThumbnail : ''} onClick={() => setActiveImage(image)} aria-label={`View hostel photo ${index + 1}`}><img src={image} alt="" /></button>)}</div>}
                                <h3>About this hostel</h3>
                                <p className={styles.fullDescription}>{selectedHostel.description || 'No additional description has been provided yet.'}</p>
                                <h3>Facilities</h3>
                                <div className={styles.detailFacilities}>{selectedHostel.facilities?.length ? selectedHostel.facilities.map(facility => <span key={facility}><FaCheck /> {facility}</span>) : <span>Facilities have not been listed yet.</span>}</div>
                            </div>
                            <div className={styles.bookingColumn}>
                                <div className={styles.contactCard}>
                                    <span className={styles.contactLabel}><FaPhone /> HOSTEL CONTACT</span>
                                    {contactNumber && callNumber ? (
                                        <a className={styles.callLink} href={`tel:${callNumber}`}>
                                            <span>{contactNumber}</span>
                                            <strong>Tap to call <FaPhone /></strong>
                                        </a>
                                    ) : (
                                        <p className={styles.noContact}>The owner has not added a contact number.</p>
                                    )}
                                </div>
                                <h3>Rooms and availability</h3>
                                {availableRooms.length ? <div className={styles.roomList}>{availableRooms.map(room => <div key={room.id} className={roomId === room.id ? styles.selectedRoom : styles.roomOption} onClick={() => setRoomId(room.id)} role="button" tabIndex="0" onKeyDown={event => event.key === 'Enter' && setRoomId(room.id)}><div><strong>Room {room.roomNumber || room.id}</strong><span>{room.roomType || `${getRoomCapacity(room)} sharing`}</span></div><div className={styles.roomPrice}><strong>{room.availableBeds} beds</strong><span>{room.price ? `₹${room.price}/month` : 'Price not listed'}</span></div></div>)}</div> : <p className={styles.noRooms}>No rooms are currently available.</p>}
                                <p className={styles.reviewNote}>The owner will review your request. Your room assignment becomes active after approval.</p>
                                {alreadyRequested ? <div className={styles.notice}>You already have a pending or approved booking request for this hostel.</div> : pendingRequestElsewhere ? <div className={styles.notice}>You already have a pending request for {hostels.find(hostel => String(hostel.id) === String(pendingRequestElsewhere.hostelId))?.name || 'another hostel'}. Wait for the owner’s decision before requesting another hostel.</div> : hasAssignment ? <div className={styles.notice}>You already have a hostel assignment. Contact your owner if you need to change it.</div> : (
                                    <form className={styles.bookingForm} onSubmit={sendBookingRequest}>
                                        <label>Preferred check-in date<input type="date" min={new Date().toISOString().slice(0, 10)} value={checkInDate} onChange={event => setCheckInDate(event.target.value)} required /></label>
                                        <button type="submit" disabled={!availableRooms.length || submitting}>{submitting ? 'Sending request…' : 'Request to book'} <FaArrowRight /></button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}

export default UserExploreHostels
