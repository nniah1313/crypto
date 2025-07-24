// CoinModal.js - A popup panel that shows a chart, toggle, and price stats
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const timeOptions = [
  { label: '1D', value: '1' },
  { label: '1W', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
  { label: 'All', value: 'max' }
];

Modal.setAppElement('#root');

function CoinModal({ isOpen, onRequestClose, coinId }) {
  const [data, setData] = useState([]);
  const [days, setDays] = useState('7');
  const [coinInfo, setCoinInfo] = useState(null);

  useEffect(() => {
    if (!coinId) return;

    const fetchChartData = async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      const chartData = await res.json();
      const formatted = chartData.prices.map(([time, price]) => ({
        date: new Date(time).toLocaleDateString(),
        price
      }));
      setData(formatted);
    };

    const fetchCoinDetails = async () => {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`);
      const details = await res.json();
      setCoinInfo(details[0]);
    };

    fetchChartData();
    fetchCoinDetails();
  }, [coinId, days]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Coin Chart Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        },
        content: {
          background: '#1a1a1a',
          color: 'white',
          borderRadius: '16px',
          padding: '20px',
          maxWidth: '700px',
          margin: 'auto'
        }
      }}
    >
      <h2>{coinInfo?.name} ({coinInfo?.symbol?.toUpperCase()})</h2>
      <p style={{ fontSize: '0.9rem', color: coinInfo?.price_change_percentage_24h >= 0 ? 'limegreen' : 'red' }}>
        ${coinInfo?.current_price?.toLocaleString()} USD — {coinInfo?.price_change_percentage_24h?.toFixed(2)}%
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {timeOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setDays(opt.value)}
            style={{
              background: days === opt.value ? '#a855f7' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              cursor: 'pointer'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide={true} />
            <YAxis domain={['auto', 'auto']} hide={true} />
            <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={onRequestClose}
        style={{ marginTop: '1rem', background: '#333', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px' }}
      >
        Close
      </button>
    </Modal>
  );
}

export default CoinModal;
