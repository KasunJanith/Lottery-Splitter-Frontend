import DatePicker from 'react-datepicker';
import { format, parseISO } from 'date-fns';   // for formatting (install if missing: npm install date-fns)

const DateInput = ({ selectedDate, onChange }) => {
  // Convert YYYY-MM-DD string to Date object (if not empty)
  const dateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

  const handleChange = (date) => {
    if (!date) {
      onChange('');
      return;
    }
    // Format back to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
  };

  return (
    <DatePicker
      selected={dateObj}
      onChange={handleChange}
      dateFormat="dd/MM/yyyy"            // displayed format
      placeholderText="dd/mm/yyyy"
      className="mt-1 w-64 rounded-lg border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
      isClearable
    />
  );
};

export default DateInput;