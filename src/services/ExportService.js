import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Export Service
 * 
 * Handles CSV and PDF export of trading signals and history
 */
class ExportService {
    /**
     * Export history as CSV
     * @param {Array} history - Analysis history array
     */
    async exportHistoryToCSV(history) {
        if (!history || history.length === 0) return false;

        try {
            // Create CSV header
            const header = 'Date,Signal,Confidence,Patterns,Risk Level,Stop Loss,Take Profit,Reasoning\n';

            // Create rows
            const rows = history.map(item => {
                const date = new Date(item.timestamp).toLocaleString().replace(',', ' ');
                const patterns = item.patterns.map(p => p.name).join('; ');
                const reasoning = `"${item.signal.reasoning.replace(/"/g, '""')}"`;

                return `${date},${item.signal.action},${item.signal.confidence}%,${patterns},${item.signal.riskLevel},${item.signal.stopLoss}%,${item.signal.takeProfit}%,${reasoning}`;
            }).join('\n');

            const csvContent = header + rows;
            const fileName = `ChartBot_History_${Date.now()}.csv`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            await this.shareFile(fileUri, 'Export History CSV');
            return true;
        } catch (error) {
            console.error('CSV Export Error:', error);
            return false;
        }
    }

    /**
     * Export a single analysis as a basic PDF (HTML representation shared as text/html for simplicity in expo)
     * In a real app with react-native-html-to-pdf, this would generate a real PDF.
     */
    async exportAnalysisToPDF(analysis) {
        try {
            const { signal, patterns, timestamp } = analysis;
            const date = new Date(timestamp).toLocaleString();

            const htmlContent = `
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #6366F1;">Chart Bot Analysis Report</h1>
                    <p style="color: #666;">Generated on: ${date}</p>
                    <hr/>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin-top: 0;">Trading Signal: 
                            <span style="color: ${signal.action === 'BUY' ? '#22C55E' : signal.action === 'SELL' ? '#EF4444' : '#F59E0B'}">
                                ${signal.action}
                            </span>
                        </h2>
                        <p><strong>Confidence:</strong> ${signal.confidence}%</p>
                        <p><strong>Reasoning:</strong> ${signal.reasoning}</p>
                    </div>
                    
                    <h3>Detected Patterns</h3>
                    <ul>
                        ${patterns.map(p => `<li><strong>${p.name}</strong> (${p.type}) - Confidence: ${p.confidence}%</li>`).join('')}
                    </ul>

                    <h3>Risk Management</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #eee;">
                            <th style="padding: 10px; border: 1px solid #ccc;">Stop Loss</th>
                            <th style="padding: 10px; border: 1px solid #ccc;">Take Profit</th>
                            <th style="padding: 10px; border: 1px solid #ccc;">Risk/Reward</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${signal.stopLoss}%</td>
                            <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${signal.takeProfit}%</td>
                            <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">1:${signal.riskRewardRatio}</td>
                        </tr>
                    </table>

                    <p style="margin-top: 40px; font-size: 10px; color: #999;">
                        Disclaimer: This report is for educational purposes only. Past performance is not indicative of future results.
                    </p>
                </body>
                </html>
            `;

            const fileName = `Analysis_${analysis.id}.html`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            await this.shareFile(fileUri, 'Export Analysis Report');
            return true;
        } catch (error) {
            console.error('Report Export Error:', error);
            return false;
        }
    }

    /**
     * Share the generated file
     */
    async shareFile(fileUri, title) {
        if (!(await Sharing.isAvailableAsync())) {
            alert('Sharing is not available on this platform');
            return;
        }

        await Sharing.shareAsync(fileUri, {
            mimeType: fileUri.endsWith('.csv') ? 'text/csv' : 'text/html',
            dialogTitle: title,
            UTI: fileUri.endsWith('.csv') ? 'public.comma-separated-values-text' : 'public.html',
        });
    }
}

export default new ExportService();
