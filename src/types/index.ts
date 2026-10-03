export type OrderStatus =
  | 'submitted'          // تم إرسال الطلب (بانتظار التسعير)
  | 'waiting_payment'    // تم التسعير (بانتظار تحويل بريدي موب)
  | 'receipt_uploaded'   // تم رفع وصل الدفع (قيد مراجعة الإدارة)
  | 'payment_verified'   // تم تأكيد الدفع وشراء السلعة بالفيزا
  | 'shipped'            // تم الشحن من الصين/أوروبا (يوجد رقم تتبع)
  | 'arrived_algeria'    // وصلت للجزائر (في الجمارك/البريد)
  | 'delivered'          // تم الاستلام من قبل الزبون
  | 'rejected';          // طلب ملغى أو مرفوض

export type PlatformSource = 'aliexpress' | 'shein' | 'temu' | 'amazon' | 'other';

export interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface PaymentReceipt {
  receiptUrl: string;
  transactionNumber: string;
  amountDZD: number;
  submittedAt: string;
  isApproved?: boolean;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone: string;
  customerWilaya: string;
  customerCommune?: string;
  customerAddress: string;
  customerPostalCode?: string;
  platform: PlatformSource;
  productTitle: string;
  productUrl?: string;
  productImageUrl: string;
  productVariants: {
    color?: string;
    size?: string;
    quantity: number;
    notes?: string;
  };
  pricing?: {
    originalCurrency: 'EUR' | 'USD';
    originalPrice: number;
    exchangeRateSquare: number; // سعر الصرف الموازي (السكوار)
    subtotalDZD: number;
    internationalShippingDZD: number;
    serviceFeeDZD: number; // هامش الربح
    totalDZD: number;
    quotedAt: string;
  };
  paymentReceipt?: PaymentReceipt;
  tracking?: {
    trackingNumber: string;
    trackingUrl?: string;
    carrier: string; // Cainiao, AliExpress Direct, Yanwen, EMS Algérie Poste
    lastUpdate: string;
    estimatedDelivery: string;
    events: TrackingEvent[];
  };
  autoFulfillStatus?: {
    isDispatched: boolean;
    dispatchedToPlatform?: string;
    buyerAccountName?: string;
    dispatchedAt?: string;
    purchasedAt?: string;
    purchasedBy?: string;
    visaCardLast4?: string;
    platformOrderNumber?: string;
    latinAddressFormatted?: string;
  };
  customerEmail?: string;
  emailLogs?: SentEmailLog[];
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SentEmailLog {
  id: string;
  orderId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  templateType: OrderStatus | 'quote_ready' | 'manual';
  status: 'sent' | 'delivered' | 'opened';
  sentAt: string;
  previewSnippet: string;
  bodyHtml: string;
  metadata?: {
    orderNumber: string;
    totalDZD?: number;
    trackingNumber?: string;
    carrier?: string;
  };
}

export interface SystemConfig {
  usdToDzdRate: number;      // e.g. 235 DZD
  eurToDzdRate: number;      // e.g. 255 DZD
  minimumServiceFeeDZD: number; // e.g. 500 DZD
  profitMarginPercent: number;  // e.g. 12%
  baridiMobDetails: {
    accountName: string;
    rip: string;
    ccp: string;
    cle: string;
    phoneNumber: string;
    instructions: string;
  };
  connectedBuyerAccount?: {
    accountName: string; // e.g. "عبد الصمد بلحاج (AliExpress VIP Drop-Agent)"
    agentEmail: string;
    platform: string;    // "AliExpress Business / Shein VIP"
    visaCardLast4: string; // "4921"
    autoFillEnabled: boolean;
  };
}

export interface AppNotification {
  id: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'pricing' | 'payment_accepted' | 'payment_rejected' | 'shipped' | 'delivered' | 'info';
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  wilaya: string;
  commune: string;
  detailedAddress: string;
  postalCode?: string;
  preferredPaymentMethod?: 'baridimob' | 'ccp';
  avatarInitials?: string;
  createdAt: string;
}

export interface Wilaya {
  code: number;
  nameAr: string;
  nameFr: string;
}
