import axios from 'axios';

export const emisesApi = axios.create({
  baseURL: process.env.NEXT_API_PLEXUS,
  headers: {
    'Content-Type': 'application/json'
  }
});
