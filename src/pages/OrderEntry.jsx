import { useState, useEffect } from 'react';
import { getOrders, saveOrders, getLatestOrderDate, getDrawNumbers } from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';
const LOTTERIES = [
  { code: 'ada', name: 'Ada Sampatha' },
  { code: 'dana', name: 'Dhana Nidhanaya' },
  { code: 'govi', name: 'Govi Setha' },
  { code: 'hada', name: 'Handahana' },
  { code: 'jaya', name: 'NLB Jaya' },
  { code: 'maha', name: 'Mahajana Sampatha' },
  { code: 'mgap', name: 'Mega Power' },
  { code: 'suba', name: 'Suba Dawasak' },
];

const OrderEntry = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load latest date on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getLatestOrderDate();
        if (res.data.date) {
          setSelectedDate(res.data.date);
          loadOrders(res.data.date);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedDate) loadOrders(selectedDate);
  }, [selectedDate]);

  const loadOrders = async (date) => {
    setLoading(true);
    try {
      const res = await getOrders(date);
      setOrders(res.data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillDrawNumbers = async () => {
    try {
      const res = await getDrawNumbers(selectedDate);
      setOrders(prev =>
        prev.map(o => {
          const match = res.data.find(d => d.lottery_code === o.lottery_code);
          return match ? { ...o, draw_number: match.draw_number } : o;
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrawChange = (code, value) => {
    setOrders(prev =>
      prev.map(o => (o.lottery_code === code ? { ...o, draw_number: value } : o))
    );
  };

  const handleQuantityChange = (code, value) => {
    setOrders(prev =>
      prev.map(o =>
        o.lottery_code === code ? { ...o, quantity: parseInt(value) || 0 } : o
      )
    );
  };

  const handleSave = async () => {
    if (!window.confirm('Save orders?')) return;
    const payload = {
      order_date: selectedDate,
      orders: orders.map(o => ({
        lottery_code: o.lottery_code,
        draw_number: o.draw_number,
        quantity: o.quantity,
      })),
    };
    try {
      await saveOrders(payload);
      setMessage('Saved successfully');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error saving');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Entry</h1>
      <div className="mb-4 flex items-end gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700">Draw Date</label>
    <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
  </div>
  
</div>
      {selectedDate && (
        <>
          <button
            onClick={handleAutoFillDrawNumbers}
            className="mb-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Auto‑fill Draw Numbers
          </button>
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Ticket Name</th>
                  <th className="px-4 py-2 text-left">Draw Number</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.lottery_code} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{o.lottery_name}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={o.draw_number}
                        onChange={e => handleDrawChange(o.lottery_code, e.target.value)}
                        className="w-28 rounded border-gray-300 shadow-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={o.quantity || ''}
                        onChange={e => handleQuantityChange(o.lottery_code, e.target.value)}
                        className="w-28 rounded border-gray-300 shadow-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
          >
            Save Orders
          </button>
          {message && <p className="mt-2 text-green-600">{message}</p>}
        </>
      )}
    </div>
  );
};

export default OrderEntry;