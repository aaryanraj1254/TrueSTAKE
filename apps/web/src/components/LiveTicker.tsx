import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

interface LiveTickerProps {
  onMarketClick?: (symbol: string) => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ onMarketClick }) => {
  const [cryptoData, setCryptoData] = useState<TickerItem[]>([]);
  const [forexData, setForexData] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: 'bitcoin,ethereum,solana',
            vs_currencies: 'inr',
            include_24hr_change: 'true',
          },
        });

        const data: TickerItem[] = Object.entries(response.data).map(
          ([symbol, data]: [string, unknown]) => {
            const cryptoData = data as {
              name: string;
              inr: number;
              inr_24h_change: number;
              inr_24h_change_percentage: number;
            };
            return {
              symbol: symbol.toUpperCase(),
              name: cryptoData.name,
              price: cryptoData.inr,
              change: cryptoData.inr_24h_change,
              changePercent: cryptoData.inr_24h_change_percentage,
              isPositive: cryptoData.inr_24h_change_percentage >= 0,
            };
          },
        );

        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    const fetchForexData = async () => {
      try {
        const response = await axios.get('https://api.frankfurter.app/latest', {
          params: {
            from: 'USD',
            to: 'INR,GBP,EUR',
          },
        });

        const data: TickerItem[] = Object.entries(response.data.rates).map(
          ([currency, rate]: [string, number]) => ({
            symbol: `USD/${currency}`,
            name: currency,
            price: rate,
            change: 0,
            changePercent: 0,
            isPositive: true,
          }),
        );

        data.unshift({
          symbol: 'USD/INR',
          name: 'USD/INR',
          price: response.data.rates.INR,
          change: 0,
          changePercent: 0,
          isPositive: true,
        });

        setForexData(data);
      } catch (error) {
        console.error('Error fetching forex data:', error);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCryptoData(), fetchForexData()]);
      setIsLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  return (
    <div className="border-b border-emerald-800/30 bg-slate-900/60 backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-6 w-2 bg-emerald-900/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex gap-3">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Crypto
              </span>
              {cryptoData.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => onMarketClick?.(item.symbol.split('/')[0])}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-emerald-800/30 bg-slate-900/50 hover:bg-emerald-900/30 hover:border-emerald-600/50 cursor-pointer transition-all duration-200"
                >
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-100">
                      {formatPrice(item.price)}
                    </div>
                    <div className="text-xs text-emerald-200/60">
                      <div>{item.name}</div>
                      <div className={item.isPositive ? 'text-emerald-400' : 'text-red-400'}>
                        {formatChange(item.change, item.changePercent)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      item.isPositive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {item.symbol}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block w-px h-4 bg-emerald-800/30">
              <div className="h-full w-px bg-emerald-700/50" />
            </div>

            <div className="flex gap-3">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Forex
              </span>
              {forexData.slice(0, 4).map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => onMarketClick?.(item.symbol.split('/')[1])}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-emerald-800/30 bg-slate-900/50 hover:bg-emerald-900/30 hover:border-emerald-600/50 cursor-pointer transition-all duration-200"
                >
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-100">
                      {formatPrice(item.price)}
                    </div>
                    <div className="text-xs text-emerald-200/60">
                      <div>{item.name}</div>
                      <div className="text-emerald-400">
                        {formatChange(item.change, item.changePercent)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
                    {item.symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
