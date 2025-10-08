// Email Service for Scandish
// Sends weekly analytics reports and notifications to restaurant owners

const { supabase } = require('./supabase');

class EmailService {
    constructor() {
        // In production, you'd use services like:
        // - SendGrid, Mailgun, AWS SES, Resend, etc.
        this.apiKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY;
        this.fromEmail = process.env.FROM_EMAIL || 'insights@scandish.ca';
    }

    /**
     * Generate and send weekly analytics report
     * @param {string} userId - User to send report to
     * @param {Object} analyticsData - Processed analytics data
     */
    async sendWeeklyReport(userId, analyticsData) {
        try {
            // Get user details
            const { data: user } = await supabase
                .from('users')
                .select('email, restaurant_name')
                .eq('id', userId)
                .single();

            if (!user) {
                throw new Error('User not found');
            }

            // Generate email content
            const emailContent = this.generateWeeklyReportHTML(user, analyticsData);

            // Send email (simplified for demo)
            await this.sendEmail({
                to: user.email,
                subject: `📊 Weekly Menu Insights - ${user.restaurant_name}`,
                html: emailContent,
                text: this.generateWeeklyReportText(user, analyticsData)
            });

            console.log(`[Email] Weekly report sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('[Email] Failed to send weekly report:', error);
            return false;
        }
    }

    /**
     * Send menu performance alert
     * @param {string} userId - User to notify
     * @param {Object} alertData - Alert details
     */
    async sendPerformanceAlert(userId, alertData) {
        try {
            const { data: user } = await supabase
                .from('users')
                .select('email, restaurant_name')
                .eq('id', userId)
                .single();

            if (!user) return false;

            const emailContent = this.generateAlertHTML(user, alertData);

            await this.sendEmail({
                to: user.email,
                subject: `🚨 Menu Performance Alert - ${user.restaurant_name}`,
                html: emailContent
            });

            console.log(`[Email] Performance alert sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('[Email] Failed to send alert:', error);
            return false;
        }
    }

    /**
     * Send AI insights summary
     * @param {string} userId - User to notify
     * @param {Array} insights - AI-generated insights
     */
    async sendAIInsights(userId, insights) {
        try {
            const { data: user } = await supabase
                .from('users')
                .select('email, restaurant_name')
                .eq('id', userId)
                .single();

            if (!user) return false;

            const emailContent = this.generateAIInsightsHTML(user, insights);

            await this.sendEmail({
                to: user.email,
                subject: `🤖 AI Menu Insights - ${user.restaurant_name}`,
                html: emailContent
            });

            console.log(`[Email] AI insights sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('[Email] Failed to send AI insights:', error);
            return false;
        }
    }

    /**
     * Send email using configured service
     * @param {Object} emailData - Email details
     */
    async sendEmail({ to, subject, html, text }) {
        // For demo purposes, we'll log the email content
        // In production, replace with actual email service

        console.log('\n=== EMAIL REPORT ===');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${text || 'HTML content generated'}`);
        console.log('==================\n');

        // Simulate email sending
        return new Promise(resolve => {
            setTimeout(() => resolve(true), 100);
        });

        /* Production email sending example:
        
        if (this.apiKey) {
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(this.apiKey);
          
          await sgMail.send({
            to,
            from: this.fromEmail,
            subject,
            html,
            text
          });
        }
        */
    }

    /**
     * Generate weekly report HTML
     */
    generateWeeklyReportHTML(user, analytics) {
        const topItem = analytics.topItems[0];
        const totalScans = analytics.summary.totalScans;
        const growth = analytics.summary.growthRate;

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Menu Report</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #F3C77E, #d6a856); padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; color: #080705; font-size: 24px; font-weight: bold;">
              📊 Weekly Menu Insights
            </h1>
            <p style="margin: 8px 0 0 0; color: #080705; opacity: 0.8;">
              ${user.restaurant_name} Performance Report
            </p>
          </div>

          <!-- Stats -->
          <div style="padding: 30px 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; margin-bottom: 30px;">
              
              <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                <div style="font-size: 28px; font-weight: bold; color: #F3C77E; margin-bottom: 5px;">
                  ${totalScans}
                </div>
                <div style="font-size: 14px; color: #666;">Menu Scans</div>
              </div>

              <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                <div style="font-size: 28px; font-weight: bold; color: #4CAF50; margin-bottom: 5px;">
                  ${growth}
                </div>
                <div style="font-size: 14px; color: #666;">Growth</div>
              </div>

            </div>

            <!-- Top Performer -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🏆 Top Performing Item</h3>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${topItem?.name || 'No data'}</div>
                  <div style="font-size: 14px; color: #666;">${topItem?.clicks || 0} clicks this week</div>
                </div>
                <div style="font-size: 24px;">${topItem?.ctr || 0}%</div>
              </div>
            </div>

            <!-- Recommendations -->
            <div style="background: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #2E7D32; font-size: 18px;">💡 This Week's Recommendation</h3>
              <p style="margin: 0; color: #2E7D32; line-height: 1.5;">
                Your ${topItem?.name || 'top item'} is performing exceptionally well! Consider featuring it more prominently or creating similar items.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; padding: 20px 0;">
              <a href="https://scandish.ca/dashboard" 
                 style="background: linear-gradient(135deg, #F3C77E, #d6a856); color: #080705; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                View Full Analytics →
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #080705; padding: 20px; text-align: center;">
            <p style="margin: 0; color: #F3C77E; font-size: 14px;">
              Powered by <strong>Scandish</strong> • Restaurant Menu Platform
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
    }

    /**
     * Generate weekly report text version
     */
    generateWeeklyReportText(user, analytics) {
        return `
Weekly Menu Insights - ${user.restaurant_name}

📊 This Week's Performance:
• Menu Scans: ${analytics.summary.totalScans}
• Growth: ${analytics.summary.growthRate}
• Top Item: ${analytics.topItems[0]?.name} (${analytics.topItems[0]?.clicks} clicks)

💡 Recommendation:
Your ${analytics.topItems[0]?.name} is performing exceptionally well! Consider featuring it more prominently.

View full analytics: https://scandish.ca/dashboard

---
Powered by Scandish
    `.trim();
    }

    /**
     * Generate AI insights HTML
     */
    generateAIInsightsHTML(user, insights) {
        return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #702632, #912F40); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🤖 AI Menu Insights</h1>
            <p style="margin: 8px 0 0 0; color: white; opacity: 0.9;">${user.restaurant_name}</p>
          </div>
          
          <div style="padding: 30px;">
            ${insights.map(insight => `
              <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${insight.title}</h3>
                <p style="margin: 0; color: #666; line-height: 1.5;">${insight.description}</p>
                <div style="margin-top: 10px; font-size: 12px; color: #F3C77E; font-weight: bold;">
                  ${insight.action}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
    }

    /**
     * Generate alert HTML
     */
    generateAlertHTML(user, alertData) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>🚨 Menu Performance Alert</h2>
        <p>Hi ${user.restaurant_name},</p>
        <p>${alertData.message}</p>
        <p>Check your dashboard for detailed insights.</p>
      </div>
    `;
    }
}

module.exports = { EmailService: new EmailService() };

