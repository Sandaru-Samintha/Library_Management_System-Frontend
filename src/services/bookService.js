import React from 'react'
import api from './api';

const  bookService = {
 getAllBooks: async ()=>{
  const response = await api.get('/books/public/all');
  return response.data;
 },

 getBookById : async (bookId)=>{
  const response = await api.get(`/books/public/${bookId}`);
  return response.data;
 },

 searchBooks : async(keyword) =>{
  const response = await api.get(`/books/public/search?keyword=${keyword}`);
  return response.data;
 },

 getAvailableBooks : async()=>{
  const response = await api.get('/books/public/available');
  return response.data;
 },
 getBooksByGenre : async(genre)=>{
  const response = await api.get(`/books/public/genre/${genre}`);
  return response.data;
 },
 getBooksByAuthor : async(author)=>{
  const response = await api.get(`/books/public/author/${author}`);
  return response.data;
 },

addBook: async (bookData) => {
  const formdata = new FormData();
  Object.keys(bookData).forEach(key => {
    if (bookData[key] !== null && bookData !== undefined) {
      formdata.append(key, bookData[key]);
    }
  });
  const response = await api.post('/books/admin/add', formdata, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
},

  updateBookAvailability: async (bookId, totalCopies) => {
    const response = await api.put(`/books/admin/${bookId}/availability?totalCopies=${totalCopies}`);
    return response.data;
  },

  deleteBook: async (bookId) => {
    const response = await api.delete(`/books/admin/delete/${bookId}`);
    return response.data;
 }

};

export default bookService;