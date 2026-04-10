const TICKERS = [
  { symbol: 'S&P 500', value: '5,218.19', change: '+0.52%', up: true },
  { symbol: 'NASDAQ', value: '16,399.52', change: '+0.70%', up: true },
  { symbol: 'DOW', value: '39,127.14', change: '-0.11%', up: false },
  { symbol: 'EUR/USD', value: '1.0831', change: '+0.03%', up: true },
  { symbol: 'GBP/USD', value: '1.2659', change: '-0.08%', up: false },
  { symbol: 'USD/JPY', value: '151.62', change: '+0.14%', up: true },
  { symbol: 'BTC/USD', value: '68,412.00', change: '+1.23%', up: true },
  { symbol: 'ETH/USD', value: '3,521.40', change: '+0.88%', up: true },
  { symbol: 'GOLD', value: '2,331.50', change: '+0.42%', up: true },
  { symbol: 'OIL (WTI)', value: '83.14', change: '-0.33%', up: false },
  { symbol: 'US 10Y', value: '4.312%', change: '+0.02%', up: true },
];

export default function TickerBar() {
  const doubled = [...TICKERS, ...TICKERS];

  return (
    <div className="bg-slate-800 text-white overflow-hidden border-b border-slate-700">
      <div className="flex items-center">
        <span className="flex-shrink-0 bg-blue-600 px-3 py-1.5 text-xs font-bold tracking-wider uppercase">
          LIVE
        </span>
        <div className="relative overflow-hidden flex-1 h-8">
          <div className="flex animate-ticker gap-8 absolute whitespace-nowrap h-full items-center">
            {doubled.map((ticker, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-gray-300">{ticker.symbol}</span>
                <span className="font-bold text-white">{ticker.value}</span>
                <span className={`font-medium ${ticker.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ticker.change}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
