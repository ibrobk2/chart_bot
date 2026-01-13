/**
 * Technical Indicators Service
 * 
 * Provides calculations for common technical analysis indicators
 * Used to filter noise and provide more accurate trading signals
 */

// Default periods for indicators
const DEFAULT_PERIODS = {
    SMA: 20,
    EMA: 12,
    RSI: 14,
    MACD_FAST: 12,
    MACD_SLOW: 26,
    MACD_SIGNAL: 9,
    BOLLINGER: 20,
    BOLLINGER_STD: 2,
    STOCHASTIC_K: 14,
    STOCHASTIC_D: 3,
};

class TechnicalIndicatorsService {
    /**
     * Calculate Simple Moving Average (SMA)
     * @param {number[]} prices - Array of closing prices
     * @param {number} period - Number of periods for SMA
     * @returns {Object} SMA value and signal
     */
    calculateSMA(prices, period = DEFAULT_PERIODS.SMA) {
        if (!prices || prices.length < period) {
            return { value: null, signal: 'neutral', description: 'Insufficient data' };
        }

        const recentPrices = prices.slice(-period);
        const sum = recentPrices.reduce((acc, price) => acc + price, 0);
        const sma = sum / period;
        const currentPrice = prices[prices.length - 1];

        // Generate signal based on price vs SMA
        let signal = 'neutral';
        let description = '';

        if (currentPrice > sma * 1.02) {
            signal = 'bullish';
            description = `Price above SMA${period} - uptrend momentum`;
        } else if (currentPrice < sma * 0.98) {
            signal = 'bearish';
            description = `Price below SMA${period} - downtrend momentum`;
        } else {
            signal = 'neutral';
            description = `Price near SMA${period} - consolidation`;
        }

        return {
            value: parseFloat(sma.toFixed(4)),
            period,
            signal,
            description,
            priceRelation: currentPrice > sma ? 'above' : currentPrice < sma ? 'below' : 'at',
        };
    }

    /**
     * Calculate Exponential Moving Average (EMA)
     * @param {number[]} prices - Array of closing prices
     * @param {number} period - Number of periods for EMA
     * @returns {Object} EMA value and signal
     */
    calculateEMA(prices, period = DEFAULT_PERIODS.EMA) {
        if (!prices || prices.length < period) {
            return { value: null, signal: 'neutral', description: 'Insufficient data' };
        }

        const multiplier = 2 / (period + 1);

        // Start with SMA for first EMA value
        let ema = prices.slice(0, period).reduce((acc, price) => acc + price, 0) / period;

        // Calculate EMA for remaining prices
        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        const currentPrice = prices[prices.length - 1];

        let signal = 'neutral';
        let description = '';

        if (currentPrice > ema * 1.015) {
            signal = 'bullish';
            description = `Price above EMA${period} - bullish momentum`;
        } else if (currentPrice < ema * 0.985) {
            signal = 'bearish';
            description = `Price below EMA${period} - bearish momentum`;
        } else {
            signal = 'neutral';
            description = `Price near EMA${period} - neutral`;
        }

        return {
            value: parseFloat(ema.toFixed(4)),
            period,
            signal,
            description,
            priceRelation: currentPrice > ema ? 'above' : currentPrice < ema ? 'below' : 'at',
        };
    }

    /**
     * Calculate Relative Strength Index (RSI)
     * @param {number[]} prices - Array of closing prices
     * @param {number} period - RSI period (typically 14)
     * @returns {Object} RSI value (0-100) and signal
     */
    calculateRSI(prices, period = DEFAULT_PERIODS.RSI) {
        if (!prices || prices.length < period + 1) {
            return { value: null, signal: 'neutral', description: 'Insufficient data' };
        }

        let gains = 0;
        let losses = 0;

        // Calculate initial gains and losses
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // Calculate smoothed average for remaining periods
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? Math.abs(change) : 0;

            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
        }

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        let signal = 'neutral';
        let zone = 'normal';
        let description = '';

        if (rsi >= 70) {
            signal = 'bearish';
            zone = 'overbought';
            description = 'RSI overbought - potential reversal down';
        } else if (rsi <= 30) {
            signal = 'bullish';
            zone = 'oversold';
            description = 'RSI oversold - potential reversal up';
        } else if (rsi >= 50) {
            signal = 'bullish';
            zone = 'normal';
            description = 'RSI above 50 - bullish momentum';
        } else {
            signal = 'bearish';
            zone = 'normal';
            description = 'RSI below 50 - bearish momentum';
        }

        return {
            value: parseFloat(rsi.toFixed(2)),
            period,
            signal,
            zone,
            description,
        };
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     * @param {number[]} prices - Array of closing prices
     * @returns {Object} MACD line, signal line, histogram, and signal
     */
    calculateMACD(prices, fastPeriod = DEFAULT_PERIODS.MACD_FAST, slowPeriod = DEFAULT_PERIODS.MACD_SLOW, signalPeriod = DEFAULT_PERIODS.MACD_SIGNAL) {
        if (!prices || prices.length < slowPeriod + signalPeriod) {
            return {
                macdLine: null,
                signalLine: null,
                histogram: null,
                signal: 'neutral',
                description: 'Insufficient data'
            };
        }

        // Calculate EMAs
        const calculateEMAArray = (data, period) => {
            const multiplier = 2 / (period + 1);
            const emaArray = [];
            let ema = data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
            emaArray.push(ema);

            for (let i = period; i < data.length; i++) {
                ema = (data[i] - ema) * multiplier + ema;
                emaArray.push(ema);
            }
            return emaArray;
        };

        const fastEMA = calculateEMAArray(prices, fastPeriod);
        const slowEMA = calculateEMAArray(prices, slowPeriod);

        // Calculate MACD line (Fast EMA - Slow EMA)
        const macdLineArray = [];
        const offset = slowPeriod - fastPeriod;
        for (let i = 0; i < slowEMA.length; i++) {
            macdLineArray.push(fastEMA[i + offset] - slowEMA[i]);
        }

        // Calculate Signal line (EMA of MACD line)
        const signalLineArray = calculateEMAArray(macdLineArray, signalPeriod);

        // Get current values
        const macdLine = macdLineArray[macdLineArray.length - 1];
        const signalLine = signalLineArray[signalLineArray.length - 1];
        const histogram = macdLine - signalLine;

        // Previous values for crossover detection
        const prevMacd = macdLineArray[macdLineArray.length - 2] || macdLine;
        const prevSignal = signalLineArray[signalLineArray.length - 2] || signalLine;

        let signal = 'neutral';
        let description = '';

        // Check for crossovers
        if (prevMacd <= prevSignal && macdLine > signalLine) {
            signal = 'bullish';
            description = 'MACD bullish crossover - buy signal';
        } else if (prevMacd >= prevSignal && macdLine < signalLine) {
            signal = 'bearish';
            description = 'MACD bearish crossover - sell signal';
        } else if (histogram > 0) {
            signal = 'bullish';
            description = 'MACD above signal line - bullish momentum';
        } else if (histogram < 0) {
            signal = 'bearish';
            description = 'MACD below signal line - bearish momentum';
        } else {
            signal = 'neutral';
            description = 'MACD neutral';
        }

        return {
            macdLine: parseFloat(macdLine.toFixed(4)),
            signalLine: parseFloat(signalLine.toFixed(4)),
            histogram: parseFloat(histogram.toFixed(4)),
            signal,
            description,
        };
    }

    /**
     * Calculate Bollinger Bands
     * @param {number[]} prices - Array of closing prices
     * @param {number} period - SMA period for middle band
     * @param {number} stdDev - Standard deviation multiplier
     * @returns {Object} Upper, middle, lower bands and signal
     */
    calculateBollingerBands(prices, period = DEFAULT_PERIODS.BOLLINGER, stdDev = DEFAULT_PERIODS.BOLLINGER_STD) {
        if (!prices || prices.length < period) {
            return {
                upper: null,
                middle: null,
                lower: null,
                bandwidth: null,
                signal: 'neutral',
                description: 'Insufficient data'
            };
        }

        const recentPrices = prices.slice(-period);
        const middle = recentPrices.reduce((acc, price) => acc + price, 0) / period;

        // Calculate standard deviation
        const squaredDiffs = recentPrices.map(price => Math.pow(price - middle, 2));
        const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
        const standardDeviation = Math.sqrt(variance);

        const upper = middle + (standardDeviation * stdDev);
        const lower = middle - (standardDeviation * stdDev);
        const bandwidth = ((upper - lower) / middle) * 100;
        const currentPrice = prices[prices.length - 1];

        let signal = 'neutral';
        let position = 'middle';
        let description = '';

        if (currentPrice >= upper) {
            signal = 'bearish';
            position = 'upper';
            description = 'Price at upper band - potential overbought';
        } else if (currentPrice <= lower) {
            signal = 'bullish';
            position = 'lower';
            description = 'Price at lower band - potential oversold';
        } else if (currentPrice > middle) {
            signal = 'bullish';
            position = 'upper-middle';
            description = 'Price above middle band - bullish bias';
        } else {
            signal = 'bearish';
            position = 'lower-middle';
            description = 'Price below middle band - bearish bias';
        }

        // Check for squeeze (low volatility)
        if (bandwidth < 5) {
            description += ' (Squeeze detected - breakout imminent)';
        }

        return {
            upper: parseFloat(upper.toFixed(4)),
            middle: parseFloat(middle.toFixed(4)),
            lower: parseFloat(lower.toFixed(4)),
            bandwidth: parseFloat(bandwidth.toFixed(2)),
            position,
            signal,
            description,
        };
    }

    /**
     * Calculate Stochastic Oscillator
     * @param {number[]} highs - Array of high prices
     * @param {number[]} lows - Array of low prices
     * @param {number[]} closes - Array of closing prices
     * @param {number} kPeriod - %K period
     * @param {number} dPeriod - %D period (SMA of %K)
     * @returns {Object} %K, %D values and signal
     */
    calculateStochastic(highs, lows, closes, kPeriod = DEFAULT_PERIODS.STOCHASTIC_K, dPeriod = DEFAULT_PERIODS.STOCHASTIC_D) {
        if (!closes || closes.length < kPeriod + dPeriod) {
            return {
                k: null,
                d: null,
                signal: 'neutral',
                description: 'Insufficient data'
            };
        }

        // Calculate %K values
        const kValues = [];
        for (let i = kPeriod - 1; i < closes.length; i++) {
            const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
            const periodLows = lows.slice(i - kPeriod + 1, i + 1);

            const highestHigh = Math.max(...periodHighs);
            const lowestLow = Math.min(...periodLows);
            const currentClose = closes[i];

            const k = highestHigh === lowestLow
                ? 50
                : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
            kValues.push(k);
        }

        // Calculate %D (SMA of %K)
        const dValues = [];
        for (let i = dPeriod - 1; i < kValues.length; i++) {
            const sum = kValues.slice(i - dPeriod + 1, i + 1).reduce((acc, val) => acc + val, 0);
            dValues.push(sum / dPeriod);
        }

        const k = kValues[kValues.length - 1];
        const d = dValues[dValues.length - 1];
        const prevK = kValues[kValues.length - 2] || k;
        const prevD = dValues[dValues.length - 2] || d;

        let signal = 'neutral';
        let zone = 'normal';
        let description = '';

        // Check zones and crossovers
        if (k >= 80 && d >= 80) {
            zone = 'overbought';
            if (prevK >= prevD && k < d) {
                signal = 'bearish';
                description = 'Stochastic bearish crossover in overbought zone';
            } else {
                signal = 'bearish';
                description = 'Stochastic in overbought zone';
            }
        } else if (k <= 20 && d <= 20) {
            zone = 'oversold';
            if (prevK <= prevD && k > d) {
                signal = 'bullish';
                description = 'Stochastic bullish crossover in oversold zone';
            } else {
                signal = 'bullish';
                description = 'Stochastic in oversold zone';
            }
        } else if (k > d) {
            signal = 'bullish';
            description = '%K above %D - bullish momentum';
        } else {
            signal = 'bearish';
            description = '%K below %D - bearish momentum';
        }

        return {
            k: parseFloat(k.toFixed(2)),
            d: parseFloat(d.toFixed(2)),
            zone,
            signal,
            description,
        };
    }

    /**
     * Run all indicators and generate a comprehensive analysis
     * @param {Object} priceData - Object containing OHLC arrays
     * @returns {Object} All indicator results and aggregate signal
     */
    analyzeAll(priceData) {
        const { opens, highs, lows, closes } = priceData;

        const indicators = {
            sma: this.calculateSMA(closes, 20),
            ema: this.calculateEMA(closes, 12),
            rsi: this.calculateRSI(closes, 14),
            macd: this.calculateMACD(closes),
            bollingerBands: this.calculateBollingerBands(closes),
            stochastic: this.calculateStochastic(highs, lows, closes),
        };

        // Aggregate signals
        const signals = [
            indicators.sma.signal,
            indicators.ema.signal,
            indicators.rsi.signal,
            indicators.macd.signal,
            indicators.bollingerBands.signal,
            indicators.stochastic.signal,
        ];

        const bullishCount = signals.filter(s => s === 'bullish').length;
        const bearishCount = signals.filter(s => s === 'bearish').length;
        const neutralCount = signals.filter(s => s === 'neutral').length;

        let aggregateSignal = 'neutral';
        let confidence = 50;

        if (bullishCount >= 4) {
            aggregateSignal = 'bullish';
            confidence = 60 + (bullishCount - 4) * 15;
        } else if (bearishCount >= 4) {
            aggregateSignal = 'bearish';
            confidence = 60 + (bearishCount - 4) * 15;
        } else if (bullishCount > bearishCount) {
            aggregateSignal = 'bullish';
            confidence = 40 + (bullishCount * 5);
        } else if (bearishCount > bullishCount) {
            aggregateSignal = 'bearish';
            confidence = 40 + (bearishCount * 5);
        }

        return {
            indicators,
            aggregate: {
                signal: aggregateSignal,
                confidence: Math.min(95, confidence),
                bullishCount,
                bearishCount,
                neutralCount,
            },
        };
    }

    /**
     * Generate mock OHLC price data for simulation
     * Used when real price data is not available
     * @param {number} periods - Number of periods to generate
     * @returns {Object} Mock OHLC data
     */
    generateMockPriceData(periods = 50) {
        const opens = [];
        const highs = [];
        const lows = [];
        const closes = [];

        let price = 100 + Math.random() * 50; // Start between 100-150

        for (let i = 0; i < periods; i++) {
            const open = price;
            const volatility = price * (0.005 + Math.random() * 0.02); // 0.5-2.5% volatility
            const direction = Math.random() > 0.5 ? 1 : -1;

            const range = volatility * (1 + Math.random());
            const high = open + (direction > 0 ? range : volatility * 0.3);
            const low = open - (direction < 0 ? range : volatility * 0.3);
            const close = low + Math.random() * (high - low);

            opens.push(parseFloat(open.toFixed(2)));
            highs.push(parseFloat(high.toFixed(2)));
            lows.push(parseFloat(low.toFixed(2)));
            closes.push(parseFloat(close.toFixed(2)));

            price = close + (Math.random() - 0.5) * volatility;
        }

        return { opens, highs, lows, closes };
    }
}

export default new TechnicalIndicatorsService();
