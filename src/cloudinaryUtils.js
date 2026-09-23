import axios from "axios";
import imageCompression from "browser-image-compression";

const API_URL = "https://lakasliget-backend.vercel.app/api/"

//const API_URL = "http://localhost:5050/api/"

//const API_URL="https://fm06-recipe-backend.vercel.app/api/"

//const API_URL = "https://recipe-backend-n72t.onrender.com"

//const API_URL = "https://receptek-backend.vercel.app/api/"

const convertToBase64 = (file)=>{
    return new Promise((resolve,reject)=>{
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload=()=>resolve(reader.result)
        reader.onerror=(error)=>reject(error)  
    })
} 

// ... (API_URL és convertToBase64 marad)

export const uploadImage = async (file) => { // A függvény neve: uploadImage
    try {
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true });
        const base64 = await convertToBase64(compressed);
        
        // A backend végpontod: uploadImages (többes szám!)
        const resp = await axios.post(API_URL + "uploadImages", { images: [base64] });
        
        // A backend válaszod: { images: [{url, public_id}] }
        return resp.data.images[0]; 
    } catch (error) {
        console.error("Hiba az utils-ban:", error);
        throw error; // FONTOS: Dobd tovább a hibát, ne csak null-t adj vissza!
    }
}

export const deleteImage = async (public_id) => {
    console.log(public_id);
    try {
        const resp = await axios.post(API_URL+"deleteImage",{public_id})
        console.log(resp.data);
        return resp.data
        
    } catch (error) {
        console.log(error);
        
    }
    
}