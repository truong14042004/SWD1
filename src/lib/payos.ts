import { PayOS } from '@payos/node';

// PayOS Credentials from Environment Variables
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';

// Check if official PayOS credentials are present
export const isPayOSConfigured = (): boolean => {
  return Boolean(
    PAYOS_CLIENT_ID.trim() &&
    PAYOS_API_KEY.trim() &&
    PAYOS_CHECKSUM_KEY.trim() &&
    PAYOS_CLIENT_ID !== 'your_client_id_here'
  );
};

// Initialize PayOS instance if credentials exist
let payOSClient: PayOS | null = null;
if (isPayOSConfigured()) {
  try {
    payOSClient = new PayOS({
      clientId: PAYOS_CLIENT_ID,
      apiKey: PAYOS_API_KEY,
      checksumKey: PAYOS_CHECKSUM_KEY,
    });
  } catch (error) {
    console.warn('[PayOS] Failed to initialize official PayOS client, fallback to sandbox mode:', error);
    payOSClient = null;
  }
}

export interface CreatePaymentLinkParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  description: string;
  stage?: 'DEPOSIT' | 'FINAL_SETTLEMENT';
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentLinkResult {
  isConfigured: boolean;
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  accountName: string;
  bin: string;
  bankName: string;
  currency: string;
  paymentLinkId: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  checkoutUrl: string;
  qrCode: string; // Image URL or QR string
  expiredAt?: number;
}

/**
 * Generate a safe unique numeric orderCode for PayOS (integer <= 9007199254740991)
 */
export function generatePayOSOrderCode(orderNumber: string): number {
  const digits = orderNumber.replace(/\D/g, '');
  const baseNum = parseInt(digits || '1', 10);
  const timeSuffix = Number(Date.now().toString().slice(-5));
  return Number(`${baseNum}${timeSuffix}`) % 9007199254740;
}

/**
 * Create a payment link via official PayOS API if configured,
 * or generate a realistic VietQR sandbox payload if awaiting config.
 */
export async function createPayOSPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResult> {
  const {
    orderNumber,
    amount,
    description,
    buyerName = 'Khách Hàng DenimLab',
    buyerEmail = 'customer@denimflow.com',
    buyerPhone = '0901234567',
    returnUrl,
    cancelUrl,
  } = params;

  // PayOS limit: description max 25 characters, alphanumeric & spaces only
  const cleanDesc = description
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .slice(0, 25)
    .trim();

  const orderCode = generatePayOSOrderCode(orderNumber);
  const fallbackReturnUrl = returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=success&orderCode=${orderCode}`;
  const fallbackCancelUrl = cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=cancelled&orderCode=${orderCode}`;

  // If live PayOS client is ready, create payment link on PayOS Gateway
  if (isPayOSConfigured() && payOSClient) {
    try {
      const response = await payOSClient.paymentRequests.create({
        orderCode,
        amount: Math.round(amount),
        description: cleanDesc,
        cancelUrl: fallbackCancelUrl,
        returnUrl: fallbackReturnUrl,
        buyerName,
        buyerEmail,
        buyerPhone,
        items: [
          {
            name: `${cleanDesc}`,
            quantity: 1,
            price: Math.round(amount),
          },
        ],
      });

      return {
        isConfigured: true,
        orderCode: response.orderCode,
        amount: response.amount,
        description: response.description,
        accountNumber: response.accountNumber,
        accountName: response.accountName,
        bin: response.bin,
        bankName: response.bin === '970422' ? 'MBBank' : 'VietinBank',
        currency: response.currency || 'VND',
        paymentLinkId: response.paymentLinkId,
        status: response.status === 'PAID' ? 'PAID' : 'PENDING',
        checkoutUrl: response.checkoutUrl,
        qrCode: response.qrCode, // Standard VietQR payload or string
        expiredAt: response.expiredAt,
      };
    } catch (err: any) {
      console.warn('[PayOS] Live API call failed, falling back to realistic simulation mode:', err.message);
    }
  }

  // Realistic Sandbox / Simulation Fallback (VietQR Standard Format)
  // MBBank (BIN: 970422) - STK: 03456789999
  const defaultBin = '970422';
  const defaultBankName = 'MBBank (Ngân hàng Quân Đội)';
  const defaultAccountNumber = '03456789999';
  const defaultAccountName = 'CONG TY CP MAY XUAT KHAU DENIMFLOW';

  // VietQR QuickLink image service
  const qrImageUrl = `https://img.vietqr.io/image/${defaultBin}-${defaultAccountNumber}-compact2.png?amount=${Math.round(
    amount
  )}&addInfo=${encodeURIComponent(cleanDesc)}&accountName=${encodeURIComponent(defaultAccountName)}`;

  const mockPaymentLinkId = `sim_link_${orderCode}`;

  return {
    isConfigured: false,
    orderCode,
    amount: Math.round(amount),
    description: cleanDesc,
    accountNumber: defaultAccountNumber,
    accountName: defaultAccountName,
    bin: defaultBin,
    bankName: defaultBankName,
    currency: 'VND',
    paymentLinkId: mockPaymentLinkId,
    status: 'PENDING',
    checkoutUrl: `https://pay.payos.vn/web/${mockPaymentLinkId}`,
    qrCode: qrImageUrl,
    expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 mins
  };
}

/**
 * Verify incoming webhook from PayOS
 */
export async function verifyPayOSWebhook(webhookBody: any): Promise<{
  isValid: boolean;
  data?: any;
  error?: string;
}> {
  // If in live mode with valid keys, verify using PayOS official signature
  if (isPayOSConfigured() && payOSClient) {
    try {
      const verifiedData = await payOSClient.webhooks.verify(webhookBody);
      return { isValid: true, data: verifiedData };
    } catch (err: any) {
      return { isValid: false, error: err.message };
    }
  }

  // In Sandbox / Fallback mode:
  // Accept if it contains standard orderCode and amount or simulation flag
  if (webhookBody?.data?.orderCode || webhookBody?.orderCode) {
    const data = webhookBody.data || webhookBody;
    return {
      isValid: true,
      data: {
        orderCode: data.orderCode,
        amount: data.amount,
        description: data.description,
        accountNumber: data.accountNumber || '03456789999',
        reference: data.reference || `REF-${Date.now().toString().slice(-6)}`,
        transactionDateTime: new Date().toISOString(),
        paymentLinkId: data.paymentLinkId || `sim_link_${data.orderCode}`,
        code: '00',
        desc: 'Thanh toán thành công (Sandbox/Live)',
      },
    };
  }

  return { isValid: false, error: 'Dữ liệu Webhook không đúng định dạng PayOS' };
}
