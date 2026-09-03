import axios from "axios";

export default axios.create({
  baseURL: "https://nomade-server-u309.onrender.com/",
  // baseURL: "http://localhost:5000",
});
