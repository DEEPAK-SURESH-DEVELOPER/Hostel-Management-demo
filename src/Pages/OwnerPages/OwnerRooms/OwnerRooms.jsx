import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchHostels } from "../../../Redux/Slices/hostelSlice";
import {
  fetchRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from "../../../Redux/Slices/roomSlice";
import { fetchUsers } from "../../../Redux/Slices/userSlice";
import styles from "./OwnerRooms.module.css";

const OwnerRooms = () => {
  const dispatch = useDispatch();

  const { hostels } = useSelector((state) => state.hostels);

  const { rooms, loading: roomLoading } = useSelector((state) => state.rooms);

  const { users } = useSelector((state) => state.users);

  const [selectedHostel, setSelectedHostel] = useState("all");
  const [editingRoom, setEditingRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    hostelId: "",
    roomNumber: "",
    roomType: "1 Sharing",
    price: "",
  });

  const loggedInUser = JSON.parse(localStorage.getItem("hostelHubUser"));

  const ownerId = loggedInUser?.id;

  const roomCapacity = {
    "1 Sharing": 1,
    "2 Sharing": 2,
    "3 Sharing": 3,
    "4 Sharing": 4,
  };

  useEffect(() => {
    if (ownerId) {
      dispatch(fetchHostels());
      dispatch(fetchRooms());
      dispatch(fetchUsers());
    }
  }, [dispatch, ownerId]);

  const ownerHostels = hostels.filter(
    (hostel) => String(hostel.ownerId) === String(ownerId),
  );

  const ownerHostelIds = ownerHostels.map((hostel) => String(hostel.id));

  const ownerRooms = rooms.filter((room) =>
    ownerHostelIds.includes(String(room.hostelId)),
  );

  const filteredRooms =
    selectedHostel === "all"
      ? ownerRooms
      : ownerRooms.filter(
          (room) => String(room.hostelId) === String(selectedHostel),
        );

  const getCapacity = (roomType) => {
    return roomCapacity[roomType] || 1;
  };

  const getOccupiedBeds = (roomId) => {
    return users.filter(
      (user) =>
        user.role === "user" &&
        user.status === "active" &&
        String(user.roomId) === String(roomId),
    ).length;
  };

  const getAvailableBeds = (room) => {
    const capacity = getCapacity(room.roomType);

    const occupiedBeds = getOccupiedBeds(room.id);

    return Math.max(capacity - occupiedBeds, 0);
  };

  const getRoomStatus = (room) => {
    const capacity = getCapacity(room.roomType);

    const availableBeds = getAvailableBeds(room);

    if (availableBeds === 0) {
      return "full";
    }

    if (availableBeds < capacity) {
      return "filling";
    }

    return "available";
  };

  const getStatusClass = (status) => {
    if (status === "available") {
      return styles.available;
    }

    if (status === "filling") {
      return styles.filling;
    }

    if (status === "full") {
      return styles.full;
    }

    return "";
  };

  const getStatusText = (status) => {
    if (status === "available") {
      return "Available";
    }

    if (status === "filling") {
      return "Filling Fast";
    }

    if (status === "full") {
      return "Full";
    }

    return status;
  };

  const getHostelName = (hostelId) => {
    const hostel = ownerHostels.find(
      (hostel) => String(hostel.id) === String(hostelId),
    );

    return hostel?.name || "Unknown Hostel";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRoom = () => {
    setEditingRoom(null);

    setFormData({
      hostelId: "",
      roomNumber: "",
      roomType: "1 Sharing",
      price: "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setFormData({
      hostelId: "",
      roomNumber: "",
      roomType: "1 Sharing",
      price: "",
    });

    setEditingRoom(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.hostelId ||
      !formData.roomNumber ||
      !formData.roomType ||
      !formData.price
    ) {
      toast.error("Please fill all fields");
      return;
    }

    const price = Number(formData.price);

    const capacity = getCapacity(formData.roomType);

    if (price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const roomData = {
      hostelId: formData.hostelId,
      roomNumber: formData.roomNumber,
      roomType: formData.roomType,
      price: price,
      capacity: capacity,
    };

    try {
      if (editingRoom) {
        await dispatch(
          updateRoom({
            id: editingRoom.id,
            roomData,
          }),
        ).unwrap();

        toast.success("Room updated successfully");
      } else {
        await dispatch(addRoom(roomData)).unwrap();

        toast.success("Room added successfully");
      }

      resetForm();

      dispatch(fetchRooms());
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);

    setFormData({
      hostelId: room.hostelId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.price,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const assignedResidents = users.filter(
      (user) =>
        user.role === "user" &&
        user.status === "active" &&
        String(user.roomId) === String(id),
    );

    if (assignedResidents.length > 0) {
      toast.error("This room has assigned users and cannot be deleted.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await dispatch(deleteRoom(id)).unwrap();

      toast.success("Room deleted successfully");

      dispatch(fetchRooms());

      if (editingRoom?.id === id) {
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  const selectedRoomTypeCapacity = getCapacity(formData.roomType);

  return (
    <div className={styles.roomsPage}>
      <div className={styles.heroSection}>
        <div>
          <span className={styles.pageLabel}>ROOM MANAGEMENT</span>

          <h1>Manage Your Rooms</h1>
        </div>

        {!showForm && (
          <button className={styles.addRoomButton} onClick={handleAddRoom}>
            <span>+</span>
            Add Room
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <span className={styles.formLabel}>
                {editingRoom ? "EDIT ROOM" : "NEW ROOM"}
              </span>

              <h2>{editingRoom ? "Update Room" : "Add a New Room"}</h2>

              <p>Capacity and availability are calculated automatically.</p>
            </div>

            <button
              className={styles.closeButton}
              onClick={resetForm}
              type="button"
            >
              ×
            </button>
          </div>

          <form className={styles.roomForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Hostel</label>

              <select
                name="hostelId"
                value={formData.hostelId}
                onChange={handleChange}
              >
                <option value="">Select Hostel</option>

                {ownerHostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Room Number</label>

              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="Example: 101"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Room Type</label>

              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
              >
                <option value="1 Sharing">1 Sharing</option>

                <option value="2 Sharing">2 Sharing</option>

                <option value="3 Sharing">3 Sharing</option>

                <option value="4 Sharing">4 Sharing</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Monthly Price</label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Example: 6000"
                min="1"
              />
            </div>

            <div className={styles.autoInfo}>
              <div className={styles.autoInfoItem}>
                <span>Room Capacity</span>

                <strong>{selectedRoomTypeCapacity}</strong>

                <small>Automatically based on room type</small>
              </div>

              <div className={styles.autoInfoItem}>
                <span>Initial Available Beds</span>

                <strong>{selectedRoomTypeCapacity}</strong>

                <small>No users assigned yet</small>
              </div>
            </div>

            <div className={styles.formNote}>
              <span>✓</span>

              <p>
                Available beds reflect active resident assignments and update
                when an account is vacated.
              </p>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={roomLoading}
              >
                {roomLoading
                  ? "Saving..."
                  : editingRoom
                    ? "Update Room"
                    : "Create Room"}
              </button>

              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <div>
            <span className={styles.sectionLabel}>YOUR ACCOMMODATION</span>

            <h2>My Rooms</h2>

            <p>
              {filteredRooms.length} room
              {filteredRooms.length !== 1 ? "s" : ""} across your hostels
            </p>
          </div>

          <select
            className={styles.filterSelect}
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
          >
            <option value="all">All Hostels</option>

            {ownerHostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </select>
        </div>

        {filteredRooms.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>+</div>

            <h3>No rooms yet</h3>

            <p>Create your first room to start managing accommodation.</p>

            <button className={styles.emptyAddButton} onClick={handleAddRoom}>
              Add Your First Room
            </button>
          </div>
        ) : (
          <div className={styles.roomsGrid}>
            {filteredRooms.map((room) => {
              const capacity = getCapacity(room.roomType);

              const occupiedBeds = getOccupiedBeds(room.id);

              const availableBeds = getAvailableBeds(room);

              const status = getRoomStatus(room);

              const occupiedPercentage =
                capacity > 0 ? (occupiedBeds / capacity) * 100 : 0;

              return (
                <div className={styles.roomCard} key={room.id}>
                  <div className={styles.cardTop}>
                    <div className={styles.roomIdentity}>
                      <span>ROOM</span>

                      <h3>{room.roomNumber}</h3>
                    </div>

                    <span
                      className={`${styles.status} ${getStatusClass(status)}`}
                    >
                      <span className={styles.statusDot} />

                      {getStatusText(status)}
                    </span>
                  </div>

                  <div className={styles.hostelName}>
                    {getHostelName(room.hostelId)}
                  </div>

                  <div className={styles.roomType}>{room.roomType}</div>

                  <div className={styles.roomDetails}>
                    <div>
                      <span>Monthly Rent</span>

                      <strong>₹{room.price}</strong>
                    </div>

                    <div>
                      <span>Capacity</span>

                      <strong>{capacity} Beds</strong>
                    </div>

                    <div>
                      <span>Occupied</span>

                      <strong>{occupiedBeds}</strong>
                    </div>

                    <div>
                      <span>Available</span>

                      <strong
                        className={availableBeds === 0 ? styles.noBeds : ""}
                      >
                        {availableBeds}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.occupancySection}>
                    <div className={styles.occupancyHeader}>
                      <div>
                        <span>Occupancy</span>

                        <strong>
                          {occupiedBeds}/{capacity}
                        </strong>
                      </div>

                      <span>{Math.round(occupiedPercentage)}%</span>
                    </div>

                    <div className={styles.progressTrack}>
                      <div
                        className={`${styles.progressBar} ${getStatusClass(
                          status,
                        )}`}
                        style={{
                          width: `${occupiedPercentage}%`,
                        }}
                      />
                    </div>

                    <p>
                      {availableBeds === 0
                        ? "All beds are currently occupied"
                        : availableBeds === capacity
                          ? "All beds are available"
                          : `${availableBeds} bed${
                              availableBeds !== 1 ? "s" : ""
                            } still available`}
                    </p>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(room)}
                    >
                      Edit Room
                    </button>

                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(room.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerRooms;
