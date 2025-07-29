export const Endpoints = {
  HEALTH: '/health',
  SIGNUP: '/signup',
  LOGIN: '/login',
  GET_BOOKS: '/books/',
  GET_BOOK: (id: string | number) => `/books/${id}`,
  CREATE_BOOK: '/books/',
  UPDATE_BOOK: (id: string | number) => `/books/${id}`,
  DELETE_BOOK: (id: string | number) => `/books/${id}`,
};