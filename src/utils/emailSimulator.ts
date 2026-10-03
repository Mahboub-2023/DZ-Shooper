import { OrderItem, OrderStatus, SentEmailLog, SystemConfig } from '../types';
import { formatDZD } from './currency';

interface EmailGenerationOptions {
  customNote?: string;
  systemConfig?: SystemConfig;
  carrier?: string;
  trackingNumber?: string;
}

export function generateOrderEmail(
  order: OrderItem,
  templateType: OrderStatus | 'quote_ready' | 'manual',
  options?: EmailGenerationOptions
): SentEmailLog {
  const recipientName = order.customerFirstName && order.customerLastName
    ? `${order.customerFirstName} ${order.customerLastName}`
    : order.customerName || 'الزبون المحترم';

  const recipientEmail = order.customerEmail || 'abdessamad.dz@gmail.com';
  const orderNumber = order.orderNumber;
  const now = new Date();
  const sentAt = now.toLocaleString('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let subject = '';
  let previewSnippet = '';
  let statusBadgeTitle = '';
  let statusBadgeColor = '#047857'; // emerald-700
  let mainBodyContent = '';
  let ctaText = 'متابعة الطلب في التطبيق';

  const totalDZDFormatted = order.pricing?.totalDZD ? formatDZD(order.pricing.totalDZD) : 'قيد التحديد';

  switch (templateType) {
    case 'submitted':
      subject = `[DZ Shopper] تم استلام طلبك رقم ${orderNumber} بنجاح وهو قيد المراجعة`;
      previewSnippet = `مرحباً ${recipientName}، تم استلام طلبك لشراء ${order.productTitle.slice(0, 40)}... ويقوم فريقنا بتسعيره بالدينار الآن.`;
      statusBadgeTitle = 'طلب جديد قيد التسعير';
      statusBadgeColor = '#2563eb';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          نشكرك على استخدام منصة <strong>DZ Shopper</strong>. تم استلام طلبك بنجاح من متجر <strong>${order.platform.toUpperCase()}</strong>.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
          <h4 style="margin: 0 0 8px; font-size: 13px; color: #0f172a;">تفاصيل السلعة المطلوبة:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>المنتج:</strong> ${order.productTitle}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>الكمية:</strong> ${order.productVariants.quantity}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>ولاية التوصيل:</strong> ${order.customerWilaya} (${order.customerCommune || ''})</p>
        </div>
        <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #475569;">
          يقوم فريقنا الآن بالتأكد من توفر السلعة وسعر الصرف الموازي (سوق السكوار) لتسعيرها بالدينار بدقة، وستصلك رسالة وإشعار فوري بمجرد جهوزية التسعيرة.
        </p>
      `;
      break;

    case 'waiting_payment':
    case 'quote_ready':
      subject = `[DZ Shopper] تسعيرة طلبك رقم ${orderNumber} جاهزة: ${totalDZDFormatted} عبر بريدي موب`;
      previewSnippet = `تم الانتهاء من تسعير طلبك بمبلغ إجمالي ${totalDZDFormatted}. يرجى التحويل عبر بريدي موب لتنفيذ الشراء بالفيزا.`;
      statusBadgeTitle = 'بانتظار التحويل عبر BaridiMob';
      statusBadgeColor = '#d97706';
      ctaText = 'فتح التطبيق ورفع وصل الدفع';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          يسعدنا إعلامك بأن تسعيرة طلبك رقم <strong>${orderNumber}</strong> قد اكتملت بنجاح بالدينار الجزائري الشامل لكافة الرسوم.
        </p>
        <div style="background-color: #ecfdf5; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #a7f3d0; text-align: center;">
          <span style="font-size: 12px; color: #065f46; display: block; margin-bottom: 4px;">المبلغ الإجمالي النهائي المطلوب للدفع:</span>
          <span style="font-size: 24px; font-weight: 800; color: #047857; font-family: monospace;">${totalDZDFormatted}</span>
        </div>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.6; color: #334155;">
          <strong style="color: #0f172a; display: block; margin-bottom: 6px;">بيانات حساب بريدي موب للتحويل:</strong>
          <span>RIP: <strong>${options?.systemConfig?.baridiMobDetails.rip || '00799999002345678912'}</strong></span><br/>
          <span>الاسم: <strong>${options?.systemConfig?.baridiMobDetails.accountName || 'DZ Shopper Concierge'}</strong></span>
        </div>
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          * بعد التحويل يرجى التقاط صورة لوصل الدفع ورفعها مباشرة داخل التطبيق ليتم شراء سلعتك فوراً.
        </p>
      `;
      break;

    case 'receipt_uploaded':
      subject = `[DZ Shopper] تم استلام وصل الدفع لطلبك رقم ${orderNumber} - قيد المراجعة`;
      previewSnippet = `استلمنا إشعار تحويل بريدي موب الخاص بك، ويجري حالياً تدقيق الوصل لتأكيد الشراء بالبطاقة الدولية.`;
      statusBadgeTitle = 'وصل الدفع قيد التدقيق المالي';
      statusBadgeColor = '#7c3aed';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          تم استلام وصل تحويل بريدي موب المرفق بنجاح للطلب رقم <strong>${orderNumber}</strong>.
        </p>
        <div style="background-color: #fdf4ff; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #f0abfc;">
          <p style="margin: 0; font-size: 13px; color: #86198f;">
            يقوم المشرف المالي بتدقيق الحوالة ومطابقة رقم المعاملة مع حساب بريدي موب. فور التأكيد سيتم شراء سلعتك مباشرة بالبطاقة الدولية (Visa).
          </p>
        </div>
      `;
      break;

    case 'payment_verified':
      subject = `[DZ Shopper] مبروك! تم تأكيد الدفع وشراء سلعتك بالبطاقة الدولية للطلب ${orderNumber}`;
      previewSnippet = `تم التحقق من حوالة بريدي موب وشراء سلعتك بنجاح بالفيزا كارد إلى عنوانك في الجزائر.`;
      statusBadgeTitle = 'تم الدفع والشراء بالفيزا بنجاح';
      statusBadgeColor = '#059669';
      ctaText = 'متابعة مسار الشحنة';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          يسعدنا إعلامك بأنه تم تأكيد استلام الحوالة وشراء السلعة رسمياً بواسطة بطاقتنا الدولية <strong>Visa</strong>.
        </p>
        <div style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #86efac;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #166534; font-weight: bold;">
            ✓ تم إرسال اسمك وعنوانك بدقة لمنصة الشحن الدولي:
          </p>
          <p style="margin: 4px 0; font-size: 12px; color: #15803d;">
            ${order.customerAddress} - ${order.customerWilaya}
          </p>
          <p style="margin: 4px 0; font-size: 12px; color: #15803d;">
            الهاتف: ${order.customerPhone}
          </p>
        </div>
        <p style="margin: 0; font-size: 13px; color: #475569;">
          السلعة الآن في مرحلة التجهيز والتغليف لدى البائع، وسنرسل لك رقم التتبع الدولي فور توفره.
        </p>
      `;
      break;

    case 'shipped': {
      const trackingCode = options?.trackingNumber || order.tracking?.trackingNumber || 'DZ-POST-TRACKING';
      const carrierName = options?.carrier || order.tracking?.carrier || 'AliExpress Direct / Algérie Poste';
      subject = `[DZ Shopper] شحنتك للطلب ${orderNumber} في الطريق! رقم التتبع: ${trackingCode}`;
      previewSnippet = `تم شحن طردك دولياً عبر ${carrierName} برقم تتبع ${trackingCode}.`;
      statusBadgeTitle = 'تم الشحن دولياً (يوجد رقم تتبع)';
      statusBadgeColor = '#4338ca';
      ctaText = 'تتبع الطرد في الوقت الفعلي';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          تم شحن سلعتك دولياً بنجاح وهي في طريقها إلى الجزائر!
        </p>
        <div style="background-color: #eef2ff; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #c7d2fe; text-align: center;">
          <span style="font-size: 12px; color: #3730a3; display: block; margin-bottom: 6px;">شركة الشحن: <strong>${carrierName}</strong></span>
          <span style="font-size: 18px; font-weight: 800; color: #312e81; font-family: monospace; letter-spacing: 1px; display: inline-block; background: #ffffff; padding: 6px 14px; border-radius: 8px; border: 1px dashed #6366f1;">
            ${trackingCode}
          </span>
        </div>
        <p style="margin: 0; font-size: 13px; color: #475569;">
          يمكنك متابعة خط سير الشحنة خطوة بخطوة حتى وصولها لمكتب بريد الجزائر في ولايتك (${order.customerWilaya}).
        </p>
      `;
      break;
    }

    case 'arrived_algeria':
      subject = `[DZ Shopper] شحنتك رقم ${orderNumber} وصلت إلى الجزائر!`;
      previewSnippet = `وصلت الشحنة إلى مركز الفرز بالجزائر العاصمة وهي قيد المعالجة للتحويل لمركز بريد ولايتك.`;
      statusBadgeTitle = 'وصلت الجزائر (قيد المعالجة البريدية)';
      statusBadgeColor = '#065f46';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          وصلت شحنتك إلى أرض الوطن (مطار هواري بومدين / مركز التوزيع الوطني لبريد الجزائر).
        </p>
        <div style="background-color: #ecfdf5; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #6ee7b7;">
          <p style="margin: 0; font-size: 13px; color: #065f46;">
            الطرد الآن في مرحلة المعالجة الجمركية السريعة وسيتم إرساله في غضون 24-48 ساعة إلى مكتب البريد التابع لبلديتك <strong>${order.customerCommune || order.customerWilaya}</strong>.
          </p>
        </div>
      `;
      break;

    case 'delivered':
      subject = `[DZ Shopper] تم تسليم طلبك رقم ${orderNumber} بنجاح - شكراً لثقتكم!`;
      previewSnippet = `تم تأكيد استلام الطرد بنجاح. يسعدنا دائماً خدمتكم في تسوقكم العالمي بالدينار الجزائري.`;
      statusBadgeTitle = 'تم الاستلام بنجاح';
      statusBadgeColor = '#0f172a';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          تم تسجيل استلام طلبك رقم <strong>${orderNumber}</strong> بنجاح.
        </p>
        <p style="margin: 0 0 12px; font-size: 13px; color: #475569;">
          نتمنى أن تنال السلعة إعجابكم، ويسعدنا دائماً خدمتكم في أي طلبات مستقبلية من AliExpress و Shein و Temu.
        </p>
      `;
      break;

    case 'rejected':
      subject = `[DZ Shopper] تنبيه بخصوص طلبك رقم ${orderNumber}`;
      previewSnippet = `يرجى مراجعة تفاصيل طلبك، تم تسجيل ملاحظة من قبل فريق الإدارة.`;
      statusBadgeTitle = 'ملاحظة حول الطلب';
      statusBadgeColor = '#dc2626';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          نود إعلامك بخصوص طلبك رقم <strong>${orderNumber}</strong>:
        </p>
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #fecaca; color: #991b1b; font-size: 13px;">
          ${options?.customNote || 'تعذر استكمال الطلب أو أن وصل الدفع غير متطابق. يرجى التواصل مع الدعم الفني أو إعادة المحاولة.'}
        </div>
      `;
      break;

    case 'manual':
    default:
      subject = `[DZ Shopper] إشعار إداري بخصوص طلبك رقم ${orderNumber}`;
      previewSnippet = options?.customNote || `رسالة إدارية موجهة من فريق الدعم لطلبك رقم ${orderNumber}.`;
      statusBadgeTitle = 'إشعار من خدمة العملاء';
      statusBadgeColor = '#047857';
      mainBodyContent = `
        <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          مرحباً <strong>${recipientName}</strong>،
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; line-height: 1.6;">
          ${options?.customNote || 'نحن سعداء بمتابعة طلبكم، يرجى مراجعة التطبيق لأي مستجدات.'}
        </div>
      `;
      break;
  }

  // Construct complete responsive HTML email template
  const bodyHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #065f46 0%, #047857 50%, #064e3b 100%); padding: 24px 28px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-weight: 900; font-size: 16px; padding: 8px 14px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255, 255, 255, 0.3);">
                      DZ SHOPPER
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">
                      وسيط الشراء الجزائري بالدينار
                    </h1>
                    <p style="margin: 4px 0 0; color: #a7f3d0; font-size: 12px;">
                      تسوق من AliExpress · Shein · Temu · الدفع بـ BaridiMob
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Indicator Ribbon -->
          <tr>
            <td style="padding: 18px 28px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="right">
                    <span style="display: inline-block; background-color: ${statusBadgeColor}15; color: ${statusBadgeColor}; border: 1px solid ${statusBadgeColor}40; font-weight: 700; font-size: 11px; padding: 4px 12px; border-radius: 9999px;">
                      ${statusBadgeTitle}
                    </span>
                  </td>
                  <td align="left">
                    <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #64748b;">
                      ${orderNumber}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 12px 28px 24px;">
              ${mainBodyContent}

              <!-- Call To Action Button -->
              <div style="text-align: center; margin-top: 24px; margin-bottom: 8px;">
                <a href="https://dz-shopper.dz/track?order=${orderNumber}" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 12px; box-shadow: 0 2px 6px rgba(4, 120, 87, 0.3);">
                  ${ctaText}
                </a>
              </div>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="56" valign="top">
                    <img src="${order.productImageUrl}" alt="${order.productTitle}" width="50" height="50" style="border-radius: 8px; object-fit: cover; background: #e2e8f0; display: block;" />
                  </td>
                  <td style="padding-right: 12px;">
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.4;">
                      ${order.productTitle.slice(0, 60)}...
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                      المنصة: <span style="text-transform: uppercase; font-weight: 700; color: #047857;">${order.platform}</span> · الكمية: ${order.productVariants.quantity}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 6px;">
                هذه الرسالة تم إرسالها تلقائياً إلى <strong>${recipientEmail}</strong> لمتابعة حالة طلبك لدى DZ Shopper.
              </p>
              <p style="margin: 0; color: #64748b;">
                خدمة العملاء: contact@dz-shopper.dz · الجزائر 🇩🇿
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId: order.id,
    recipientEmail,
    recipientName,
    subject,
    templateType,
    status: 'delivered',
    sentAt,
    previewSnippet,
    bodyHtml,
    metadata: {
      orderNumber,
      totalDZD: order.pricing?.totalDZD,
      trackingNumber: options?.trackingNumber || order.tracking?.trackingNumber,
      carrier: options?.carrier || order.tracking?.carrier,
    },
  };
}
