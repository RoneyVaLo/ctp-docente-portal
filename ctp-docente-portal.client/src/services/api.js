// src/services/api.js
//import axios from "../services/api";
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // cambialo si usás otro puerto
});

export default instance;
