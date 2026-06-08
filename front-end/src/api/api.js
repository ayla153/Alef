import axios from "axios";

const api = axios.create({
  baseURL: "https://murmuring-cassette-jingling.ngrok-free.dev",
});

export default api;