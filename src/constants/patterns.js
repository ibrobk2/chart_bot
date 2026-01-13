// Candlestick patterns definitions
export const PATTERNS = {
    bullish: [
        { id: 'hammer', name: 'Hammer', description: 'A bullish reversal pattern with a small body and long lower wick.' },
        { id: 'bullish_engulfing', name: 'Bullish Engulfing', description: 'A two-candle pattern where a bullish candle engulfs the previous bearish candle.' },
        { id: 'morning_star', name: 'Morning Star', description: 'A three-candle bullish reversal pattern at the end of a downtrend.' },
        { id: 'piercing_line', name: 'Piercing Line', description: 'A two-candle pattern with a bullish close above midpoint of prior bearish candle.' },
        { id: 'three_white_soldiers', name: 'Three White Soldiers', description: 'Three consecutive bullish candles indicating strong upward momentum.' },
    ],
    bearish: [
        { id: 'shooting_star', name: 'Shooting Star', description: 'A bearish reversal pattern with a small body and long upper wick.' },
        { id: 'bearish_engulfing', name: 'Bearish Engulfing', description: 'A two-candle pattern where a bearish candle engulfs the previous bullish candle.' },
        { id: 'evening_star', name: 'Evening Star', description: 'A three-candle bearish reversal pattern at the end of an uptrend.' },
        { id: 'dark_cloud_cover', name: 'Dark Cloud Cover', description: 'A bearish reversal pattern that opens above and closes below mid-point of prior candle.' },
        { id: 'three_black_crows', name: 'Three Black Crows', description: 'Three consecutive bearish candles indicating strong downward momentum.' },
    ],
    neutral: [
        { id: 'doji', name: 'Doji', description: 'Indicates indecision; open and close are nearly equal.' },
        { id: 'spinning_top', name: 'Spinning Top', description: 'Small body with upper and lower wicks; signals indecision.' },
        { id: 'gravestone_doji', name: 'Gravestone Doji', description: 'Doji with long upper wick; potential bearish reversal.' },
        { id: 'dragonfly_doji', name: 'Dragonfly Doji', description: 'Doji with long lower wick; potential bullish reversal.' },
    ],
};

export const SIGNAL_TYPES = {
    BUY: 'BUY',
    SELL: 'SELL',
    HOLD: 'HOLD',
};

export const CONFIDENCE_LEVELS = {
    HIGH: { label: 'High', min: 70, color: '#22C55E' },
    MEDIUM: { label: 'Medium', min: 40, color: '#F59E0B' },
    LOW: { label: 'Low', min: 0, color: '#EF4444' },
};

export const RISK_LEVELS = {
    CONSERVATIVE: { label: 'Conservative', stopLossPercent: 1, takeProfitPercent: 2 },
    MODERATE: { label: 'Moderate', stopLossPercent: 2, takeProfitPercent: 4 },
    AGGRESSIVE: { label: 'Aggressive', stopLossPercent: 3, takeProfitPercent: 6 },
};

export const INDICATOR_TYPES = {
    SMA: 'SMA',
    EMA: 'EMA',
    RSI: 'RSI',
    MACD: 'MACD',
    BOLLINGER: 'BOLLINGER',
    STOCHASTIC: 'STOCHASTIC',
};

export const INDICATOR_SIGNALS = {
    BULLISH: 'bullish',
    BEARISH: 'bearish',
    NEUTRAL: 'neutral',
    OVERBOUGHT: 'overbought',
    OVERSOLD: 'oversold',
};

export const NOTIFICATION_THRESHOLDS = {
    HIGH: 75,
    MEDIUM: 60,
    LOW: 50,
};
