import { useState, useCallback } from 'react';
import { fetchBooks } from '../services/bookService';

const useBookTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [query, setQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({
    ratings_average: '',
    author_name: '',
    title: '',
    first_publish_year: '',
    subject: '',
    author_birth_date: '',
    author_top_work: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await fetchBooks(query, pageIndex + 1, pageSize);
    setData(result.docs);
    setPageCount(Math.ceil(result.num_found / pageSize));
    setLoading(false);
  }, [query, pageIndex, pageSize]);

  const handleEditClick = (index) => {
    if (editingRowIndex === index) {
      // Save the edited data
      handleSaveClick();
    } else {
      // Start editing the selected row
      setEditingRowIndex(index);
      const bookData = data[index] || {};
      setEditFormData({
        ratings_average: bookData.ratings_average || '',
        author_name: bookData.author_name || '',
        title: bookData.title || '',
        first_publish_year: bookData.first_publish_year || '',
        subject: bookData.subject || '',
        author_birth_date: bookData.author_birth_date || '',
        author_top_work: bookData.author_top_work || ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSaveClick = () => {
    const updatedData = [...data];
    updatedData[editingRowIndex] = { ...updatedData[editingRowIndex], ...editFormData };
    setData(updatedData);
    setEditingRowIndex(null);
  };

  return {
    data,
    loading,
    pageCount,
    query,
    setQuery,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    editingRowIndex,
    setEditingRowIndex,
    editFormData,
    setEditFormData,
    handleEditClick,
    handleInputChange,
    handleSaveClick,
    fetchData,
  };
};

export default useBookTable;
