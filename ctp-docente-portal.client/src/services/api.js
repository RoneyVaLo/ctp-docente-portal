// src/services/api.js
//import axios from "../services/api";
import axios from "axios";

//const instance = axios.create({
//    baseURL: "http://localhost:5103/api", 
//});
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "/api",
});
export default instance;