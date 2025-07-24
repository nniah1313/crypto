import { useState, useEffect } from 'react';

function Watchlist() {
  const [input, setInput] = useState('');
  const [coins, setCoins] = useState(['bitcoin', 'ethereum']);
  const [marketData, setMarketData] = useState({});
  const [allCoins, setAllCoins] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/list')
      .then((res) => res.json())
      .then((data) => setAllCoins(data))
      .catch((err) => console.error('Coin list fetch error:', err));
  }, []);

  useEffect(() => {
    if (coins.length === 0) return;

    const ids = coins.join(',');
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
    )
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

  const handleAdd = (coinId) => {
    const cleaned = coinId.toLowerCase().trim();
    if (cleaned && !coins.includes(cleaned)) {
      setCoins([...coins, cleaned]);
    }
    setInput('');
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

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <h2>Watchlist</h2>
      <input
        type="text"
        value={input}
        placeholder="Search for a coin"
        onChange={handleInputChange}
      />
      <button onClick={() => handleAdd(input)}>Add</button>

      {suggestions.length > 0 && (
        <ul
          style={{
            background: '#fff',
            listStyle: 'none',
            margin: 0,
            padding: '0.5rem',
            border: '1px solid #ccc',
            position: 'absolute',
            zIndex: 1,
            width: '100%',
          }}
        >
          {suggestions.map((coin) => (
            <li
              key={coin.id}
              onClick={() => handleAdd(coin.id)}
              style={{ cursor: 'pointer' }}
            >
              {coin.name} ({coin.symbol.toUpperCase()})
            </li>
          ))}
        </ul>
      )}

      <ul style={{ padding: 0 }}>
        {coins.map((coin) => {
          const data = marketData[coin];
          const change = data?.change ?? null;
          const isPositive = change > 0;

          return (
            <li
              key={coin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                listStyle: 'none',
                marginBottom: '0.5rem',
              }}
            >
              {data?.image && (
                <img
                  src={data.image}
                  alt={coin}
                  style={{ width: 24, height: 24, borderRadius: '50%' }}
                />
              )}
              <span>
                {coin.toUpperCase()} — ${data?.price?.toLocaleString() || 'Loading...'}
              </span>
              {change !== null && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: isPositive ? 'green' : 'red',
                  }}
                >
                  {isPositive ? '+' : ''}
                  {change.toFixed(2)}%
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Watchlist;
