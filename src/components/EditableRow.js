import React from 'react';

const EditableRow = ({ cell, editFormData, handleInputChange }) => {
  return (
    <td {...cell.getCellProps()}>
      <input
        name={cell.column.id}
        value={editFormData[cell.column.id] || ''}
        onChange={handleInputChange}
      />
    </td>
  );
};

export default EditableRow;
