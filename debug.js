const fs = require('fs');
const path = require('path');

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
console.log('Data directory exists:', fs.existsSync(dataDir));

// Check if bookings file exists
const bookingsFile = path.join(dataDir, 'bookings.json');
console.log('Bookings file exists:', fs.existsSync(bookingsFile));

// Try to read bookings file
try {
    if (fs.existsSync(bookingsFile)) {
        const data = fs.readFileSync(bookingsFile, 'utf8');
        const bookings = JSON.parse(data);
        console.log('Number of bookings:', bookings.length);
        console.log('Sample booking:', bookings[0] || 'No bookings found');
    } else {
        console.log('Bookings file does not exist');
    }
} catch (error) {
    console.error('Error reading bookings file:', error);
}

// Test file permissions
try {
    fs.writeFileSync(path.join(dataDir, 'test.txt'), 'Test write permissions');
    console.log('Write permissions OK');
    fs.unlinkSync(path.join(dataDir, 'test.txt'));
} catch (error) {
    console.error('Write permission error:', error);
}

console.log('Current working directory:', process.cwd());
```

You can run this script using: node debug.js
