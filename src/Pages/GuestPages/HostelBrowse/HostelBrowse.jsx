import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight, FaBed, FaBuilding, FaCheck, FaMapMarkerAlt, FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import { addBooking, fetchBookings } from '../../../Redux/Slices/bookingSlice'
import styles from './HostelBrowse.module.css'

const getRoomCapacity = room => Number(room.capacity) || Number(room.roomType?.match(/\d+/)?.[0]) || 1

const HostelBrowse = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { hostels, loading: hostelsLoading } = useSelector(state => state.hostels)
  const { rooms, loading: roomsLoading } = useSelector(state => state.rooms)
  const { bookings } = useSelector(state => state.bookings)
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [roomId, setRoomId] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const currentUser = JSON.parse(localStorage.getItem('hostelHubUser') || 'null')

  useEffect(() => {
    dispatch(fetchHostels())
    dispatch(fetchRooms())
    dispatch(fetchBookings())
  }, [dispatch, currentUser?.id])

  const listings = useMemo(() => hostels.filter(hostel => hostel.status === 'approved').map(hostel => {
    const hostelRooms = rooms.filter(room => String(room.hostelId) === String(hostel.id))
    const roomsWithAvailability = hostelRooms.map(room => {
      const occupiedBeds = bookings.filter(booking =>
        booking.status === 'approved' &&
        String(booking.roomId) === String(room.id)
      ).length
      return { ...room, availableBeds: Math.max(getRoomCapacity(room) - occupiedBeds, 0) }
    })
    return { ...hostel, rooms: roomsWithAvailability, availableBeds: roomsWithAvailability.reduce((total, room) => total + room.availableBeds, 0), availableRooms: roomsWithAvailability.filter(room => room.availableBeds > 0).length }
  }), [hostels, rooms, bookings])

  const availableOptions = selectedHostel?.rooms?.filter(room => room.availableBeds > 0) || []
  const openBooking = hostel => {
    if (!currentUser || currentUser.role !== 'user') {
      toast.info('Sign in as a resident to request a booking.')
      navigate('/login')
      return
    }
    const existingRequest = bookings.find(booking => String(booking.userId) === String(currentUser.id) && String(booking.hostelId) === String(hostel.id) && ['pending', 'approved'].includes(booking.status))
    if (existingRequest) {
      toast.info(existingRequest.status === 'pending' ? 'You already have a request awaiting this hostel.' : 'You already have an approved booking for this hostel.')
      return
    }
    setSelectedHostel(hostel)
    setRoomId(hostel.rooms.find(room => room.availableBeds > 0)?.id || '')
    setCheckInDate('')
  }

  const submitRequest = async event => {
    event.preventDefault()
    if (!roomId || !checkInDate) {
      toast.error('Choose an available room and check-in date.')
      return
    }
    const request = {
      userId: String(currentUser.id),
      hostelId: String(selectedHostel.id),
      roomId: String(roomId),
      bookingDate: new Date().toISOString().slice(0, 10),
      checkInDate,
      status: 'pending',
      requestType: 'public'
    }
    try {
      setSubmitting(true)
      await dispatch(addBooking(request)).unwrap()
      toast.success('Booking request sent to the hostel owner.')
      setSelectedHostel(null)
    } catch {
      toast.error('Could not send your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.navbar}>
        <Link className={styles.brand} to="/">Hostel<span>Hub</span></Link>
        <div className={styles.navLinks}><Link to="/">Home</Link>{currentUser ? <Link className={styles.signIn} to={currentUser.role === 'user' ? '/user' : `/${currentUser.role}`}>My dashboard</Link> : <Link className={styles.signIn} to="/login">Sign in</Link>}</div>
      </header>
      <section className={styles.intro}>
        <Link to="/" className={styles.back}><FaArrowLeft /> Back home</Link>
        <span className={styles.eyebrow}>A GOOD PLACE TO LAND</span>
        <h1>Explore hostels</h1>
        <p>Find your fit. Compare what’s available and request a room when you’re ready.</p>
      </section>

      {(hostelsLoading || roomsLoading) && !hostels.length ? <p className={styles.message}>Finding welcoming places…</p> : listings.length ? (
        <section className={styles.grid} aria-label="Available hostels">
          {listings.map(hostel => {
            const gallery = Array.isArray(hostel.gallery) ? hostel.gallery : []
            const cover = hostel.image || gallery[0]
            return <article className={styles.card} key={hostel.id}>
              <div className={styles.photo}>
                {cover ? <img src={cover} alt={`${hostel.name} exterior`} /> : <div className={styles.photoFallback}><FaBuilding /><span>HostelHub stay</span></div>}
                <span className={styles.availableTag}>{hostel.availableBeds > 0 ? 'Rooms available' : 'Currently full'}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.titleRow}><h2>{hostel.name}</h2><span className={styles.bedCount}><FaBed /> {hostel.availableBeds}</span></div>
                <p className={styles.location}><FaMapMarkerAlt /> {hostel.location || hostel.address || 'Location not listed'}</p>
                <p className={styles.description}>{hostel.description || 'A comfortable place to settle in, with the essentials close by.'}</p>
                <div className={styles.facilities}>{(hostel.facilities || []).slice(0, 4).map(facility => <span key={facility}><FaCheck /> {facility}</span>)}</div>
                <div className={styles.availability}><strong>{hostel.availableBeds}</strong> available {hostel.availableBeds === 1 ? 'bed' : 'beds'} <span>·</span> {hostel.availableRooms} {hostel.availableRooms === 1 ? 'room' : 'rooms'}</div>
                <button className={styles.bookButton} disabled={!hostel.availableBeds} onClick={() => openBooking(hostel)}>{hostel.availableBeds ? <>Book hostel <FaArrowRight /></> : 'No rooms available'}</button>
              </div>
            </article>
          })}
        </section>
      ) : <div className={styles.empty}><FaBuilding /><h2>No approved hostels yet</h2><p>Check back soon as new places are added.</p><Link to="/">Return home <FaArrowRight /></Link></div>}

      {selectedHostel && <div className={styles.overlay} onClick={() => !submitting && setSelectedHostel(null)}>
        <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="booking-title" onClick={event => event.stopPropagation()}>
          <button className={styles.close} aria-label="Close" onClick={() => setSelectedHostel(null)}><FaTimes /></button>
          <span className={styles.eyebrow}>BOOKING REQUEST</span><h2 id="booking-title">Request a stay at {selectedHostel.name}</h2>
          <p className={styles.modalHint}>Your request goes to the hostel owner for review. A room is reserved only after the owner approves it.</p>
          <form onSubmit={submitRequest}>
            <label>Available room<select value={roomId} onChange={event => setRoomId(event.target.value)} required><option value="">Choose a room</option>{availableOptions.map(room => <option key={room.id} value={room.id}>Room {room.roomNumber || room.id} · {room.roomType || `${room.capacity || ''} sharing`} · {room.availableBeds} {room.availableBeds === 1 ? 'bed' : 'beds'}{room.price ? ` · ₹${room.price}/month` : ''}</option>)}</select></label>
            <label>Preferred check-in date<input type="date" min={new Date().toISOString().slice(0, 10)} value={checkInDate} onChange={event => setCheckInDate(event.target.value)} required /></label>
            <div className={styles.actions}><button className={styles.cancel} type="button" onClick={() => setSelectedHostel(null)}>Cancel</button><button className={styles.submit} type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send request'}</button></div>
          </form>
        </section>
      </div>}
    </main>
  )
}

export default HostelBrowse
