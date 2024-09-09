import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, usePagination, useFilters } from 'react-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'tailwindcss/tailwind.css'; // Assuming you're using Tailwind for styling

const generateCalendar = () => {
  const startDate = new Date(2024, 0, 1);
  const dateRange = Array.from({ length: 30 }, (_, i) => new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000));

  const instagramPosts = ['Educational Infographic', 'User Testimonial', 'AI in Medicine Fact', 'Feature Spotlight', 'Study Tip'];
  const twitterPosts = ['Original Tweet', 'Retweet Medical News', 'Engage with #MedEd', 'Share Blog Post', 'AI Fact'];
  const linkedinPosts = ['Share Blog Post', 'Case Study', 'Industry News', 'Feature Deep Dive', 'Thought Leadership'];
  const blogPosts = ['AI in Diagnostics', 'Study Techniques', 'User Success Story', 'Feature Explanation', 'Industry Trends'];
  const emailContent = ['Newsletter', 'Product Update', 'User Spotlight', 'Tips & Tricks', 'Exclusive Offer'];

  return dateRange.map(date => ({
    Date: date.toISOString().split('T')[0],
    Day: date.toLocaleDateString('en-US', { weekday: 'long' }),
    Instagram: instagramPosts[Math.floor(Math.random() * instagramPosts.length)],
    'Instagram Story': 'Daily Study Tip',
    Twitter: Array.from({ length: 3 }, () => twitterPosts[Math.floor(Math.random() * twitterPosts.length)]).join(', '),
    LinkedIn: date.getDay() < 5 ? linkedinPosts[Math.floor(Math.random() * linkedinPosts.length)] : '',
    Blog: date.getDay() === 1 ? blogPosts[Math.floor(Math.random() * blogPosts.length)] : '',
    Email: date.getDay() === 3 ? emailContent[Math.floor(Math.random() * emailContent.length)] : ''
  }));
};

const App = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = generateCalendar();
    setCalendarData(data);
    updateChartData(data);
  }, []);

  const updateChartData = (data) => {
    const counts = data.reduce((acc, item) => {
      acc.Instagram = (acc.Instagram || 0) + (item.Instagram ? 1 : 0);
      acc.Twitter = (acc.Twitter || 0) + (item.Twitter ? 1 : 0);
      acc.LinkedIn = (acc.LinkedIn || 0) + (item.LinkedIn ? 1 : 0);
      acc.Blog = (acc.Blog || 0) + (item.Blog ? 1 : 0);
      acc.Email = (acc.Email || 0) + (item.Email ? 1 : 0);
      return acc;
    }, {});

    setChartData(Object.entries(counts).map(([name, value]) => ({ name, value })));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedItem(calendarData[index]);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditedItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleSave = (index) => {
    const updatedData = [...calendarData];
    updatedData[index] = editedItem;
    setCalendarData(updatedData);
    setEditingIndex(null);
    updateChartData(updatedData);
  };

  // React-Table Setup
  const columns = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'Date', // accessor is the "key" in the data
      },
      {
        Header: 'Day',
        accessor: 'Day',
      },
      {
        Header: 'Instagram',
        accessor: 'Instagram',
      },
      {
        Header: 'Instagram Story',
        accessor: 'Instagram Story',
      },
      {
        Header: 'Twitter',
        accessor: 'Twitter',
      },
      {
        Header: 'LinkedIn',
        accessor: 'LinkedIn',
      },
      {
        Header: 'Blog',
        accessor: 'Blog',
      },
      {
        Header: 'Email',
        accessor: 'Email',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={() => handleEdit(row.index)}
          >
            {editingIndex === row.index ? 'Save' : 'Edit'}
          </button>
        ),
      },
    ],
    [editingIndex]
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
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: calendarData,
      initialState: { pageIndex: 0 }, // Page Index starts at 0
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Social Media Content Calendar</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Content Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <table {...getTableProps()} className="table-auto w-full border-collapse">
        <thead className="bg-gray-200">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className="p-2 border">
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-100">
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className="p-2 border">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
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
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default App;
