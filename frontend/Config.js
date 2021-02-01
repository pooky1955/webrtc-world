const DEV_BACKEND_URL = "http://127.0.0.1:3000" 
const PROD_BACKEND_URL = "https://webrtc-world-backend.herokuapp.com/"
const BACKEND_URL = window.location.hostname !== "127.0.0.1" ? PROD_BACKEND_URL : DEV_BACKEND_URL

