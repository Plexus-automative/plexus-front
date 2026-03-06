import axios from 'axios';

export const commandesLivreesApi = axios.create({
    baseURL: process.env.NEXT_API_PLEXUS,
    headers: {
        'Content-Type': 'application/json'
    }
});
