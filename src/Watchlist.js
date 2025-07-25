import { useState, useEffect } from 'react';
import CoinModal from './CoinModal';

function Watchlist() {
  const [input, setInput] = useState('');
  const [coins, setCoins] = useState(['bitcoin', 'ethereum']);
  const [marketData, setMarketData] = useState({});
  const [allCoins, setAllCoins] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/list')
      .then((res) => res.json())
      .then((data) => setAllCoins(data))
      .catch((err) => console.error('Coin list fetch error:', err));
  }, []);

  useEffect(() => {
    if (coins.length === 0) return;
    const ids = coins.join(',');
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = {};
        data.forEach((coin) => {
          mapped[coin.id] = {
            price: coin.current_price,
            image: coin.image,
            change: coin.price_change_percentage_24h,
          };
        });
        setMarketData(mapped);
      })
      .catch((err) => console.error('Market data fetch error:', err));
  }, [coins]);

  const handleAdd = () => {
    const cleaned = input.toLowerCase().trim();
    if (cleaned && !coins.includes(cleaned)) {
      setCoins([...coins, cleaned]);
    }
    setInput('');
    setSuggestions([]);
  };

  const handleSuggestionClick = (coinId) => {
    setInput(coinId);
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val.length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = allCoins
      .filter(
        (coin) =>
          coin.id.toLowerCase().startsWith(val.toLowerCase()) ||
          coin.name.toLowerCase().startsWith(val.toLowerCase())
      )
      .slice(0, 10);

    setSuggestions(filtered);
  };

  const handleRightClick = (e, coinId) => {
    e.preventDefault();
    setCoins(coins.filter((id) => id !== coinId));
  };

  const openModalForCoin = (coinId) => {
    setSelectedCoinId(coinId);
    setIsModalOpen(true);
  };

  return (
    <div style={{ flex: 1, position: 'relative', padding: '1rem' }}>
      <h2 style={{ color: 'white' }}>Watchlist</h2>

      {/* Search Input + Suggestions */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={input}
            placeholder="Search for a coin"
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #888',
              background: '#111',
              color: 'white'
            }}
          />
          {suggestions.length > 0 && (
            <ul style={{
              background: '#1a1a1a',
              color: 'white',
              listStyle: 'none',
              margin: 0,
              padding: '0.5rem 0',
              border: '1px solid #555',
              position: 'absolute',
              top: '100%',
              width: '100%',
              maxHeight: '200px',
              overflowY: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              zIndex: 999,
            }}>
              {suggestions.map((coin) => (
                <li
                  key={coin.id}
                  onClick={() => handleSuggestionClick(coin.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #333',
                  }}
                >
                  {coin.name} ({coin.symbol.toUpperCase()})
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleAdd}
          style={{
            marginTop: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: '#a855f7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {/* Coin List */}
      <ul style={{ padding: 0 }}>
        {coins.map((coinId) => {
          const data = marketData[coinId];
          if (!data) return null;

          return (
            <li
              key={coinId}
              onClick={() => openModalForCoin(coinId)}
              onContextMenu={(e) => handleRightClick(e, coinId)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                background: '#222',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={data.image} alt={coinId} style={{ width: 24, height: 24 }} />
                <span>{coinId.toUpperCase()}</span>
              </div>
              <div>
                <div>${data.price.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: data.change >= 0 ? 'limegreen' : 'red' }}>
                  {data.change?.toFixed(2)}%
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Chart Modal */}
      <CoinModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        coinId={selectedCoinId}
      />
    </div>
  );
}

export default Watchlist;
