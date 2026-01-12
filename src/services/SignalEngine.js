import { SIGNAL_TYPES, RISK_LEVELS } from '../constants';
import StorageService from './StorageService';

/**
 * Signal Generation Engine
 * 
 * Generates trading signals based on detected patterns
 * Includes risk management calculations
 */
class SignalEngine {

    /**
     * Generate a trading signal based on detected patterns
     * @param {Array} patterns - Array of detected patterns
     * @returns {Object} Trading signal with action, confidence, and risk levels
     */
    generateSignal(patterns) {
        if (!patterns || patterns.length === 0) {
            return this.createHoldSignal(30);
        }

        // Calculate bullish vs bearish score
        const analysis = this.analyzePatterns(patterns);

        // Determine signal action
        const action = this.determineAction(analysis);

        // Calculate overall confidence
        const confidence = this.calculateConfidence(patterns, analysis);

        // Get risk management levels
        const riskManagement = this.calculateRiskLevels(action, confidence);

        return {
            action,
            confidence,
            ...riskManagement,
            reasoning: this.generateReasoning(patterns, analysis),
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
            bullishPercent: total > 0 ? (bullishScore / total) * 100 : 0,
            bearishPercent: total > 0 ? (bearishScore / total) * 100 : 0,
            neutralPercent: total > 0 ? (neutralScore / total) * 100 : 0,
            dominantDirection: bullishScore > bearishScore ? 'bullish' :
                bearishScore > bullishScore ? 'bearish' : 'neutral',
        };
    }

    /**
     * Determine trading action based on analysis
     */
    determineAction(analysis) {
        const threshold = 60; // Minimum percentage to generate a directional signal

        if (analysis.bullishPercent >= threshold && analysis.bullishScore > analysis.bearishScore) {
            return SIGNAL_TYPES.BUY;
        }

        if (analysis.bearishPercent >= threshold && analysis.bearishScore > analysis.bullishScore) {
            return SIGNAL_TYPES.SELL;
        }

        return SIGNAL_TYPES.HOLD;
    }

    /**
     * Calculate overall signal confidence
     */
    calculateConfidence(patterns, analysis) {
        if (patterns.length === 0) return 30;

        // Base confidence on pattern confidences
        const avgPatternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;

        // Boost confidence for pattern alignment
        const dominantPercent = Math.max(analysis.bullishPercent, analysis.bearishPercent, analysis.neutralPercent);
        const alignmentBoost = (dominantPercent - 33.33) / 66.67 * 20; // Max 20% boost

        // Multi-pattern confirmation bonus
        const multiPatternBonus = Math.min((patterns.length - 1) * 5, 15); // Max 15% bonus

        let confidence = avgPatternConfidence + alignmentBoost + multiPatternBonus;

        // Clamp between 20 and 95
        return Math.round(Math.min(95, Math.max(20, confidence)));
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
    generateReasoning(patterns, analysis) {
        if (patterns.length === 0) {
            return 'No clear patterns detected. Consider waiting for stronger signals.';
        }

        const patternNames = patterns.map(p => p.name).join(', ');
        const direction = analysis.dominantDirection;

        let reasoning = `Detected ${patternNames}. `;

        if (direction === 'bullish') {
            reasoning += `Bullish signals dominate (${analysis.bullishPercent.toFixed(0)}%). Potential upward movement expected.`;
        } else if (direction === 'bearish') {
            reasoning += `Bearish signals dominate (${analysis.bearishPercent.toFixed(0)}%). Potential downward movement expected.`;
        } else {
            reasoning += 'Mixed signals suggest market indecision. Consider waiting for clearer direction.';
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
        };
    }
}

export default new SignalEngine();
