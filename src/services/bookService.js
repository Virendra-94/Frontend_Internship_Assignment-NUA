import axios from 'axios';

const API_URL = 'https://openlibrary.org/search.json';

export const fetchBooks = async (query, page, limit) => {
  const params = {
    q: query || 'book', // Default to 'book' if query is empty
    page: page,
    limit: limit,
  };
  const response = await axios.get(API_URL, { params });
  return response.data;
};
