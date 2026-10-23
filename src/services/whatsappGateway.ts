import QRCode from 'qrcode';
import {
  WhatsAppSession,
  Message,
  ChatConversation,
  AutoResponseRule,
} from '../types';

export class WhatsAppGatewayService {
  /**
   * Generates a high quality QR Code data URL for WhatsApp Web device linking
   */
  static async generateSessionQR(sessionId: string, phoneNumber: string): Promise<string> {
    const payload = `2@${Date.now()}_WA_SECURE_AUTH_${sessionId}_${phoneNumber.replace(/\D/g, '')}_SERVER_NODE`;
    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#111827',
          light: '#FFFFFF',
        },
      });
      return dataUrl;
    } catch {
      // Fallback to online QR service if browser canvas is constrained
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
    }
  }

  /**
   * Generates authentic 8-character pairing code formatted like WhatsApp Mobile Link: XXXX-XXXX
   */
  static generatePairingCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code1 = '';
    let code2 = '';
    for (let i = 0; i < 4; i++) {
      code1 += chars.charAt(Math.floor(Math.random() * chars.length));
      code2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${code1}-${code2}`;
  }

  /**
   * Evaluates if an incoming customer message triggers an auto-responder rule
   */
  static evaluateAutoResponse(
    messageText: string,
    rules: AutoResponseRule[],
    channelId: string,
    customerName: string
  ): { matched: boolean; rule?: AutoResponseRule; replyText?: string } {
    const cleanedText = messageText.toLowerCase().trim();

    // Check keyword rules first
    for (const rule of rules) {
      if (!rule.isActive) continue;
      if (rule.channelIds[0] !== 'all' && !rule.channelIds.includes(channelId)) continue;

      let matches = false;
      if (rule.triggerType === 'keyword') {
        if (rule.matchType === 'exact') {
          matches = rule.keywords.some((kw) => kw.toLowerCase().trim() === cleanedText);
        } else if (rule.matchType === 'starts_with') {
          matches = rule.keywords.some((kw) => cleanedText.startsWith(kw.toLowerCase().trim()));
        } else {
          // contains
          matches = rule.keywords.some((kw) => cleanedText.includes(kw.toLowerCase().trim()));
        }
      } else if (rule.triggerType === 'greeting') {
        matches = rule.keywords.some((kw) => cleanedText.includes(kw.toLowerCase().trim()));
      }

      if (matches) {
        let reply = rule.responseText
          .replace(/{{customer_name}}/g, customerName)
          .replace(/{{business_name}}/g, 'OmniWatsApp Surveillance')
          .replace(/{{assigned_agent}}/g, 'Tim Call Center');

        return { matched: true, rule, replyText: reply };
      }
    }

    return { matched: false };
  }

  /**
   * Simulates random incoming realistic customer message for live testing
   */
  static getSampleCustomerScenarios() {
    return [
      {
        senderName: 'Bambang Soedirgo',
        senderPhone: '+62 813-7722-4411',
        text: 'Halo kak, apakah barang saya ready stock dan bisa kirim hari ini via Grab / Gojek Instant?',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        tag: 'Instant Delivery',
      },
      {
        senderName: 'Clara Salsabila',
        senderPhone: '+62 819-2233-8899',
        text: 'Tolong tanya pricelist paket langganan tahunan dan potongan diskon untuk kantor kami ya 🙏',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        tag: 'Sales Inquiry',
      },
      {
        senderName: 'Hendra Gunawan',
        senderPhone: '+62 877-5500-1122',
        text: 'Selamat siang agen, saya mau konfirmasi pembayaran tagihan bulan ini sudah di-transfer.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        tag: 'Billing',
      },
      {
        senderName: 'Fiona Amelia',
        senderPhone: '+62 823-1122-3344',
        text: 'Halo CS, aplikasi saya ada kendala tidak bisa login setelah update versi terbaru.',
        avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=120&auto=format&fit=crop&q=80',
        tag: 'Technical Issue',
      },
    ];
  }
}
