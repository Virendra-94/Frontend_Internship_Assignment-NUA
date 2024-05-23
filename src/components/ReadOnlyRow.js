import React from 'react';

const ReadOnlyRow = ({ cell }) => {
  return (
    <td {...cell.getCellProps()}>
      {cell.render('Cell')}
    </td>
  );
};

export default ReadOnlyRow;
