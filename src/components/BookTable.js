import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import { fetchBooks } from '../services/bookService';
import { saveAs } from 'file-saver';
import '../App.css';

const BookTable = () => {
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (index) => {
    if (editingRowIndex === index) {
      handleSaveClick();
    } else {
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

  const handleDownloadCSV = () => {
    const csvData = [
      Object.keys(data[0]).join(','),
      ...data.map((row) => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'book_data.csv');
  };

  const columns = useMemo(
    () => [
      { Header: 'Ratings Average', accessor: 'ratings_average' },
      { Header: 'Author Name', accessor: 'author_name' },
      { Header: 'Title', accessor: 'title' },
      { Header: 'First Publish Year', accessor: 'first_publish_year' },
      { Header: 'Subject', accessor: 'subject' },
      { Header: 'Author Birth Date', accessor: 'author_birth_date' },
      { Header: 'Author Top Work', accessor: 'author_top_work' },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <button onClick={() => handleEditClick(row.index)}>
            {editingRowIndex === row.index ? 'Save' : 'Edit'}
          </button>
        ),
      },
    ],
    [editingRowIndex]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex: tablePageIndex, pageSize: tablePageSize },
    gotoPage,
    nextPage,
    previousPage,
    setPageSize: setTablePageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex, pageSize },
      manualPagination: true,
      pageCount,
    },
    useSortBy,
    usePagination
  );

  useEffect(() => {
    setPageIndex(tablePageIndex);
  }, [tablePageIndex]);

  useEffect(() => {
    setPageSize(tablePageSize);
  }, [tablePageSize]);

  return (
    <div>
      <div>
        <button onClick={handleDownloadCSV}>Download CSV</button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by author"
      />
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  if (cell.column.id === 'actions') {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    );
                  } else if (editingRowIndex === row.index) {
                    return (
                      <td {...cell.getCellProps()}>
                        <input
                          name={cell.column.id}
                          value={editFormData[cell.column.id] || ''}
                          onChange={handleInputChange}
                        />
                      </td>
                    );
                  } else {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  }
                })}
              </tr>
            );
          })}
          {loading && (
            <tr>
              <td colSpan="8">Loading...</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPageIndex(0);
          }}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BookTable;










// import React, { useMemo, useState, useEffect, useCallback } from 'react';
// import { useTable, usePagination, useSortBy } from 'react-table';
// import { fetchBooks } from '../services/bookService';
// import '../App.css';

// const BookTable = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pageCount, setPageCount] = useState(0);
//   const [query, setQuery] = useState('');
//   const [pageIndex, setPageIndex] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [editingRowIndex, setEditingRowIndex] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     ratings_average: '',
//     author_name: '',
//     title: '',
//     first_publish_year: '',
//     subject: '',
//     author_birth_date: '',
//     author_top_work: ''
//   });

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const result = await fetchBooks(query, pageIndex + 1, pageSize);
//     setData(result.docs);
//     setPageCount(Math.ceil(result.num_found / pageSize));
//     setLoading(false);
//   }, [query, pageIndex, pageSize]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleEditClick = (index) => {
//     if (editingRowIndex === index) {
//       handleSaveClick();
//     } else {
//       setEditingRowIndex(index);
//       const bookData = data[index] || {};
//       setEditFormData({
//         ratings_average: bookData.ratings_average || '',
//         author_name: bookData.author_name || '',
//         title: bookData.title || '',
//         first_publish_year: bookData.first_publish_year || '',
//         subject: bookData.subject || '',
//         author_birth_date: bookData.author_birth_date || '',
//         author_top_work: bookData.author_top_work || ''
//       });
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: value,
//     });
//   };

//   const handleSaveClick = () => {
//     const updatedData = [...data];
//     updatedData[editingRowIndex] = { ...updatedData[editingRowIndex], ...editFormData };
//     setData(updatedData);
//     setEditingRowIndex(null);
//   };

//   const columns = useMemo(
//     () => [
//       { Header: 'Ratings Average', accessor: 'ratings_average' },
//       { Header: 'Author Name', accessor: 'author_name' },
//       { Header: 'Title', accessor: 'title' },
//       { Header: 'First Publish Year', accessor: 'first_publish_year' },
//       { Header: 'Subject', accessor: 'subject' },
//       { Header: 'Author Birth Date', accessor: 'author_birth_date' },
//       { Header: 'Author Top Work', accessor: 'author_top_work' },
//       {
//         Header: 'Actions',
//         accessor: 'actions',
//         Cell: ({ row }) => (
//           <button onClick={() => handleEditClick(row.index)}>
//             {editingRowIndex === row.index ? 'Save' : 'Edit'}
//           </button>
//         ),
//       },
//     ],
//     [editingRowIndex]
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     prepareRow,
//     page,
//     canPreviousPage,
//     canNextPage,
//     pageOptions,
//     state: { pageIndex: tablePageIndex, pageSize: tablePageSize },
//     gotoPage,
//     nextPage,
//     previousPage,
//     setPageSize: setTablePageSize,
//   } = useTable(
//     {
//       columns,
//       data,
//       initialState: { pageIndex, pageSize },
//       manualPagination: true,
//       pageCount,
//     },
//     useSortBy,
//     usePagination
//   );

//   useEffect(() => {
//     setPageIndex(tablePageIndex);
//   }, [tablePageIndex]);

//   useEffect(() => {
//     setPageSize(tablePageSize);
//   }, [tablePageSize]);

//   return (
//     <div>
//       <input
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search by author"
//       />
//       <table {...getTableProps()}>
//         <thead>
//           {headerGroups.map((headerGroup) => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column) => (
//                 <th {...column.getHeaderProps(column.getSortByToggleProps())}>
//                   {column.render('Header')}
//                   <span>
//                     {column.isSorted
//                       ? column.isSortedDesc
//                         ? ' 🔽'
//                         : ' 🔼'
//                       : ''}
//                   </span>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           {page.map((row) => {
           
//             prepareRow(row);
//             return (
//               <tr {...row.getRowProps()}>
//                 {row.cells.map((cell) => {
//                   if (cell.column.id === 'actions') {
//                     return (
//                       <td {...cell.getCellProps()}>
//                         {cell.render('Cell')}
//                       </td>
//                     );
//                   } else if (editingRowIndex === row.index) {
//                     return (
//                       <td {...cell.getCellProps()}>
//                         <input
//                           name={cell.column.id}
//                           value={editFormData[cell.column.id] || ''}
//                           onChange={handleInputChange}
//                         />
//                       </td>
//                     );
//                   } else {
//                     return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
//                   }
//                 })}
//               </tr>
//             );
//           })}
//           {loading && (
//             <tr>
//               <td colSpan="8">Loading...</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//       <div>
//         <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
//           {'<<'}
//         </button>{' '}
//         <button onClick={() => previousPage()} disabled={!canPreviousPage}>
//           {'<'}
//         </button>{' '}
//         <button onClick={() => nextPage()} disabled={!canNextPage}>
//           {'>'}
//         </button>{' '}
//         <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
//           {'>>'}
//         </button>{' '}
//         <span>
//           Page{' '}
//           <strong>
//             {pageIndex + 1} of {pageOptions.length}
//           </strong>{' '}
//         </span>
//         <span>
//           | Go to page:{' '}
//           <input
//             type="number"
//             defaultValue={pageIndex + 1}
//             onChange={(e) => {
//               const page = e.target.value ? Number(e.target.value) - 1 : 0;
//               gotoPage(page);
//             }}
//             style={{ width: '100px' }}
//           />
//         </span>{' '}
//         <select
//           value={pageSize}
//           onChange={(e) => {
//             setPageSize(Number(e.target.value));
//             setPageIndex(0);
//           }}
//         >
//           {[10, 20, 50, 100].map((size) => (
//             <option key={size} value={size}>
//               Show {size}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// };

// export default BookTable;





