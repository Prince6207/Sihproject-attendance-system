// import {v2 as cloudinary} from "cloudinary"
// import { log } from "console";
// import fs from "fs"



// // (async function() {

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//         api_key: process.env.CLOUDINARY_API_KEY, 
//         api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
//     });
    
//     // Upload an image
//     const uploadOnCloudinary = async (localFilePath) =>{
//         try{
//             if(!localFilePath)
//                 return null
//             const response = await cloudinary.uploader.upload(localFilePath , {
//                 resource_type :"auto"
//             })

//             //file has been uploaded successfuly
//             console.log("file is uploaded on cloudinary",response.url);
//             return response;
//         }
//         catch(error)
//         {
//             fs.unlinkSync(localFilePath)
//             //remove the locally saved temporary file as the upload operation got failed

//             return null;
//         }
//     }
    
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            , {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => { 
//            console.log("CloudinaryError" .error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// // })();


// export {uploadOnCloudinary}

import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
         console.error("❌ Cloudinary upload error:", error.message || error);
        // fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}