const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const BOOKINGS_FILE = path.join(dataDir, 'bookings.json');

// Load bookings from file
const loadBookings = () => {
    try {
        if (fs.existsSync(BOOKINGS_FILE)) {
            const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
    return [];
};

// Save bookings to file
const saveBookings = (bookings) => {
    try {
        if (!Array.isArray(bookings)) {
            console.error('Bookings is not an array:', bookings);
            return false;
        }
        
        if (bookings.length === 0) {
            console.warn('No bookings to save');
        }
        
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        console.log(`Saved ${bookings.length} bookings to ${BOOKINGS_FILE}`);
        return true;
    } catch (error) {
        console.error('Error saving bookings:', error);
        return false;
    }
};

// Get all bookings
const getBookings = () => {
    return loadBookings();
};

// Add a new booking
const addBooking = (booking) => {
    const bookings = loadBookings();
    bookings.push(booking);
    return saveBookings(bookings);
};

module.exports = {
    getBookings,
    addBooking,
    saveBookings
};
