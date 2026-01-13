import { SIGNAL_TYPES, RISK_LEVELS } from '../constants';
import StorageService from './StorageService';
import TechnicalIndicatorsService from './TechnicalIndicatorsService';

/**
 * Signal Generation Engine
 * 
 * Generates trading signals based on detected patterns and technical indicators
 * Includes risk management calculations
 */
class SignalEngine {

    /**
     * Generate a trading signal based on detected patterns and optional price data
     * @param {Array} patterns - Array of detected patterns
     * @param {Object} priceData - Optional OHLC price data for indicator analysis
     * @returns {Object} Trading signal with action, confidence, and risk levels
     */
    generateSignal(patterns, priceData = null) {
        // Get indicator analysis if price data available, otherwise use mock data
        const indicatorAnalysis = this.analyzeIndicators(priceData);

        if ((!patterns || patterns.length === 0) && !indicatorAnalysis) {
            return this.createHoldSignal(30);
        }

        // Calculate bullish vs bearish score from patterns
        const patternAnalysis = this.analyzePatterns(patterns || []);

        // Combine pattern and indicator analysis
        const combinedAnalysis = this.combineAnalyses(patternAnalysis, indicatorAnalysis);

        // Determine signal action
        const action = this.determineAction(combinedAnalysis);

        // Calculate overall confidence
        const confidence = this.calculateConfidence(patterns || [], combinedAnalysis, indicatorAnalysis);

        // Get risk management levels
        const riskManagement = this.calculateRiskLevels(action, confidence);

        return {
            action,
            confidence,
            ...riskManagement,
            reasoning: this.generateReasoning(patterns || [], combinedAnalysis, indicatorAnalysis),
            indicators: indicatorAnalysis?.indicators || null,
            indicatorAggregate: indicatorAnalysis?.aggregate || null,
        };
    }

    /**
     * Analyze technical indicators
     * @param {Object} priceData - OHLC price data, uses mock if null
     * @returns {Object} Indicator analysis results
     */
    analyzeIndicators(priceData) {
        // Use provided price data or generate mock data for simulation
        const data = priceData || TechnicalIndicatorsService.generateMockPriceData(50);
        return TechnicalIndicatorsService.analyzeAll(data);
    }

    /**
     * Combine pattern and indicator analyses
     */
    combineAnalyses(patternAnalysis, indicatorAnalysis) {
        const patternWeight = 0.6; // Patterns are primary signal source
        const indicatorWeight = 0.4; // Indicators are confirmation

        let combinedBullish = patternAnalysis.bullishPercent * patternWeight;
        let combinedBearish = patternAnalysis.bearishPercent * patternWeight;
        let combinedNeutral = patternAnalysis.neutralPercent * patternWeight;

        if (indicatorAnalysis) {
            const totalIndicators = indicatorAnalysis.aggregate.bullishCount +
                indicatorAnalysis.aggregate.bearishCount +
                indicatorAnalysis.aggregate.neutralCount;

            if (totalIndicators > 0) {
                const indBullishPct = (indicatorAnalysis.aggregate.bullishCount / totalIndicators) * 100;
                const indBearishPct = (indicatorAnalysis.aggregate.bearishCount / totalIndicators) * 100;
                const indNeutralPct = (indicatorAnalysis.aggregate.neutralCount / totalIndicators) * 100;

                combinedBullish += indBullishPct * indicatorWeight;
                combinedBearish += indBearishPct * indicatorWeight;
                combinedNeutral += indNeutralPct * indicatorWeight;
            }
        }

        // Normalize
        const total = combinedBullish + combinedBearish + combinedNeutral;
        if (total > 0) {
            combinedBullish = (combinedBullish / total) * 100;
            combinedBearish = (combinedBearish / total) * 100;
            combinedNeutral = (combinedNeutral / total) * 100;
        }

        return {
            ...patternAnalysis,
            bullishPercent: combinedBullish,
            bearishPercent: combinedBearish,
            neutralPercent: combinedNeutral,
            dominantDirection: combinedBullish > combinedBearish ? 'bullish' :
                combinedBearish > combinedBullish ? 'bearish' : 'neutral',
            indicatorConfirmation: indicatorAnalysis ?
                (indicatorAnalysis.aggregate.signal === patternAnalysis.dominantDirection) : false,
        };
    }

    /**
     * Analyze patterns to determine market direction
     */
    analyzePatterns(patterns) {
        let bullishScore = 0;
        let bearishScore = 0;
        let neutralScore = 0;

        patterns.forEach(pattern => {
            const weight = pattern.confidence / 100;

            switch (pattern.type) {
                case 'bullish':
                    bullishScore += weight;
                    break;
                case 'bearish':
                    bearishScore += weight;
                    break;
                default:
                    neutralScore += weight;
            }
        });

        const total = bullishScore + bearishScore + neutralScore;

        return {
            bullishScore,
            bearishScore,
            neutralScore,
            bullishPercent: total > 0 ? (bullishScore / total) * 100 : 33.33,
            bearishPercent: total > 0 ? (bearishScore / total) * 100 : 33.33,
            neutralPercent: total > 0 ? (neutralScore / total) * 100 : 33.34,
            dominantDirection: bullishScore > bearishScore ? 'bullish' :
                bearishScore > bullishScore ? 'bearish' : 'neutral',
        };
    }

    /**
     * Determine trading action based on analysis
     */
    determineAction(analysis) {
        const threshold = 55; // Lowered from 60 since we now have indicator confirmation

        if (analysis.bullishPercent >= threshold && analysis.bullishPercent > analysis.bearishPercent) {
            return SIGNAL_TYPES.BUY;
        }

        if (analysis.bearishPercent >= threshold && analysis.bearishPercent > analysis.bullishPercent) {
            return SIGNAL_TYPES.SELL;
        }

        return SIGNAL_TYPES.HOLD;
    }

    /**
     * Calculate overall signal confidence
     */
    calculateConfidence(patterns, analysis, indicatorAnalysis) {
        let baseConfidence = 30;

        if (patterns.length > 0) {
            // Base confidence on pattern confidences
            const avgPatternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
            baseConfidence = avgPatternConfidence;

            // Boost confidence for pattern alignment
            const dominantPercent = Math.max(analysis.bullishPercent, analysis.bearishPercent, analysis.neutralPercent);
            const alignmentBoost = (dominantPercent - 33.33) / 66.67 * 15; // Max 15% boost

            // Multi-pattern confirmation bonus
            const multiPatternBonus = Math.min((patterns.length - 1) * 5, 10); // Max 10% bonus

            baseConfidence += alignmentBoost + multiPatternBonus;
        }

        // Indicator confirmation bonus
        if (indicatorAnalysis) {
            const indicatorConfidence = indicatorAnalysis.aggregate.confidence;

            // If indicators agree with pattern direction, boost confidence
            if (analysis.indicatorConfirmation) {
                baseConfidence += 10; // Agreement bonus
            }

            // Add indicator-based confidence (weighted)
            baseConfidence = (baseConfidence * 0.7) + (indicatorConfidence * 0.3);

            // Strong indicator agreement bonus
            if (indicatorAnalysis.aggregate.bullishCount >= 5 || indicatorAnalysis.aggregate.bearishCount >= 5) {
                baseConfidence += 8;
            }
        }

        // Clamp between 20 and 95
        return Math.round(Math.min(95, Math.max(20, baseConfidence)));
    }

    /**
     * Calculate stop-loss and take-profit levels
     */
    async calculateRiskLevels(action, confidence) {
        // Get user's risk preference
        const settings = await StorageService.getSettings();
        const riskLevel = settings?.riskLevel || 'MODERATE';
        const riskConfig = RISK_LEVELS[riskLevel];

        // Adjust levels based on confidence
        const confidenceMultiplier = confidence >= 70 ? 1 :
            confidence >= 50 ? 1.2 : 1.5;

        const stopLoss = (riskConfig.stopLossPercent * confidenceMultiplier).toFixed(1);
        const takeProfit = (riskConfig.takeProfitPercent / confidenceMultiplier).toFixed(1);

        const riskRewardRatio = (parseFloat(takeProfit) / parseFloat(stopLoss)).toFixed(1);

        return {
            stopLoss,
            takeProfit,
            riskRewardRatio,
            riskLevel: riskConfig.label,
        };
    }

    /**
     * Generate human-readable reasoning for the signal
     */
    generateReasoning(patterns, analysis, indicatorAnalysis) {
        let reasoning = '';

        // Pattern reasoning
        if (patterns.length > 0) {
            const patternNames = patterns.map(p => p.name).join(', ');
            reasoning += `Patterns: ${patternNames}. `;
        } else {
            reasoning += 'No candlestick patterns detected. ';
        }

        // Indicator reasoning
        if (indicatorAnalysis) {
            const { aggregate, indicators } = indicatorAnalysis;

            reasoning += `Indicators: ${aggregate.bullishCount} bullish, ${aggregate.bearishCount} bearish. `;

            // Add specific indicator highlights
            const highlights = [];

            if (indicators.rsi.zone === 'overbought') {
                highlights.push('RSI overbought');
            } else if (indicators.rsi.zone === 'oversold') {
                highlights.push('RSI oversold');
            }

            if (indicators.macd.signal === 'bullish' && indicators.macd.description.includes('crossover')) {
                highlights.push('MACD bullish crossover');
            } else if (indicators.macd.signal === 'bearish' && indicators.macd.description.includes('crossover')) {
                highlights.push('MACD bearish crossover');
            }

            if (indicators.bollingerBands.position === 'upper') {
                highlights.push('Price at upper Bollinger Band');
            } else if (indicators.bollingerBands.position === 'lower') {
                highlights.push('Price at lower Bollinger Band');
            }

            if (highlights.length > 0) {
                reasoning += `Key signals: ${highlights.join(', ')}. `;
            }
        }

        // Direction summary
        const direction = analysis.dominantDirection;
        if (direction === 'bullish') {
            reasoning += `Overall bullish bias (${analysis.bullishPercent.toFixed(0)}%).`;
        } else if (direction === 'bearish') {
            reasoning += `Overall bearish bias (${analysis.bearishPercent.toFixed(0)}%).`;
        } else {
            reasoning += 'Mixed signals - consider waiting for confirmation.';
        }

        // Confirmation note
        if (analysis.indicatorConfirmation) {
            reasoning += ' ✓ Pattern-indicator agreement.';
        }

        return reasoning;
    }

    /**
     * Create a hold signal with given confidence
     */
    createHoldSignal(confidence) {
        return {
            action: SIGNAL_TYPES.HOLD,
            confidence,
            stopLoss: '-',
            takeProfit: '-',
            riskRewardRatio: '-',
            riskLevel: 'N/A',
            reasoning: 'Insufficient pattern data. Hold position and wait for clearer signals.',
            indicators: null,
            indicatorAggregate: null,
        };
    }
}

export default new SignalEngine();
