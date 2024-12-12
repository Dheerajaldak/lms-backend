// Use import instead of require
import app from './app.js';
import connectionToDB from './config/dbConnection.js';
import cloudinary from 'cloudinary';

const PORT = process.env.PORT || 5000;

//Cloudinary configuratiaon
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Use the key from your .env file
    api_key: process.env.CLOUDINARY_API_KEY,        // Use the key from your .env file
    api_secret: process.env.CLOUDINARY_API_SECRET   // Use the key from your .env file

})

app.listen(PORT, async () => {
    await connectionToDB();
    console.log(`App is listening at http://localhost:${PORT}`);
});
