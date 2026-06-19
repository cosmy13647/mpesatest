import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api/mpesa';

function App() {
  const [amount, setAmount] = useState('1');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/transactions`);
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Poll for payment status every 3 seconds until completed/failed
  const pollStatus = (checkoutRequestId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/status/${checkoutRequestId}`);
        const { status, mpesaReceipt } = res.data;

        if (status === 'completed') {
          setStatusMsg('✅ Payment completed');
          setPaymentResult({ status, mpesaReceipt });
          clearInterval(interval);
          setLoading(false);
          fetchTransactions();
        } else if (status === 'failed') {
          setStatusMsg('❌ Payment failed or cancelled');
          setPaymentResult({ status });
          clearInterval(interval);
          setLoading(false);
          fetchTransactions();
        } else {
          setStatusMsg('⏳ Waiting for customer to enter PIN...');
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 3000);

    // Stop polling after 60 seconds no matter what
    setTimeout(() => clearInterval(interval), 60000);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('Sending STK Push...');
    setPaymentResult(null);

    try {
      const reference = `SALE-${Date.now()}`;
      const res = await axios.post(`${API_BASE}/stk-push`, {
        amount: Number(amount),
        phone,
        reference,
        description: 'Supermarket Payment',
      });

      if (res.data.success) {
        setStatusMsg('📲 STK Push sent — check your phone');
        pollStatus(res.data.checkoutRequestId);
      } else {
        setStatusMsg(`❌ ${res.data.message}`);
        setLoading(false);
      }
    } catch (err) {
      setStatusMsg(`❌ ${err.response?.data?.message || err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Supermarket POS</h1>
      <p className="subtitle">M-Pesa Payment Demo</p>

      <form onSubmit={handlePay} className="pay-form">
        <label>
          Amount (KES)
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            required
          />
        </label>

        <label>
          Phone Number
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712345678 or 254708374149"
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Pay with M-Pesa'}
        </button>
      </form>

      {statusMsg && <div className="status-box">{statusMsg}</div>}

      {paymentResult?.status === 'completed' && (
        <div className="receipt">
          <strong>Receipt:</strong> {paymentResult.mpesaReceipt}
        </div>
      )}

      <h2>Recent Transactions</h2>
      <table className="tx-table">
        <thead>
          <tr>
            <th>Phone</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.phone}</td>
              <td>KES {tx.amount}</td>
              <td>
                <span className={`badge ${tx.status}`}>{tx.status}</span>
              </td>
              <td>{tx.mpesa_receipt || '—'}</td>
              <td>{new Date(tx.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;