import { OrderStatus, TrackingEvent } from '../types';

export interface SmartTrackingResult {
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  suggestedStatus: OrderStatus;
  statusHeadline: string;
  currentLocation: string;
  estimatedDelivery: string;
  lastUpdate: string;
  events: TrackingEvent[];
  pushNotificationTitle: string;
  pushNotificationMessage: string;
}

export type TrackingScenario = 'in_transit' | 'customs_algeria' | 'local_post_delivery';

/**
 * Extracts clean tracking number and carrier info from URL or raw tracking code
 */
export function parseTrackingInput(rawInput: string): { trackingNumber: string; detectedCarrier: string; cleanUrl: string } {
  const trimmed = rawInput.trim();
  let trackingNumber = trimmed;
  let detectedCarrier = 'AliExpress Direct / Algérie Poste';
  let cleanUrl = '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    cleanUrl = trimmed;

    // Detect from 17TRACK
    if (trimmed.includes('17track.net')) {
      const match = trimmed.match(/nums=([a-zA-Z0-9_-]+)/i);
      if (match) trackingNumber = match[1];
    }
    // Detect from ParcelsApp
    else if (trimmed.includes('parcelsapp.com')) {
      const match = trimmed.match(/tracking\/([a-zA-Z0-9_-]+)/i);
      if (match) trackingNumber = match[1];
    }
    // Detect from Cainiao
    else if (trimmed.includes('cainiao.com')) {
      const match = trimmed.match(/mailNoList=([a-zA-Z0-9_-]+)/i);
      if (match) trackingNumber = match[1];
      detectedCarrier = 'Cainiao Global Express';
    }
    // Detect from Yanwen
    else if (trimmed.includes('yw56') || trimmed.includes('yanwen')) {
      const match = trimmed.match(/code=([a-zA-Z0-9_-]+)/i);
      if (match) trackingNumber = match[1];
      detectedCarrier = 'Yanwen Economic Air Mail';
    }
    // Generic URL fallback
    else {
      const urlSegments = trimmed.split(/[/&=?#]/);
      const possibleCode = urlSegments.reverse().find((seg) => /^[a-zA-Z0-9]{8,25}$/.test(seg));
      if (possibleCode) trackingNumber = possibleCode;
    }
  } else {
    cleanUrl = `https://t.17track.net/en#nums=${encodeURIComponent(trackingNumber)}`;
  }

  // Carrier inference based on tracking code structure
  const upper = trackingNumber.toUpperCase();
  if (upper.startsWith('LP') || upper.startsWith('CN') || upper.startsWith('CAINIAO')) {
    detectedCarrier = 'Cainiao Super Economy Global';
  } else if (upper.startsWith('YW') || upper.startsWith('UG') || upper.startsWith('UR')) {
    detectedCarrier = 'Yanwen Economic Air Mail';
  } else if (upper.startsWith('EE') || upper.startsWith('EM') || upper.includes('EMS')) {
    detectedCarrier = 'EMS Algérie Poste (خدمة سريعة)';
  } else if (upper.startsWith('DHL') || upper.length === 10 && /^\d+$/.test(upper)) {
    detectedCarrier = 'DHL Express Algeria';
  } else if (upper.startsWith('DZ') || upper.endsWith('DZ')) {
    detectedCarrier = 'Algérie Poste International Direct';
  }

  return { trackingNumber, detectedCarrier, cleanUrl };
}

/**
 * Simulates intelligent real-time fetching from international tracking services
 */
export async function fetchSmartTrackingMock(
  input: string,
  scenario: TrackingScenario = 'customs_algeria',
  wilaya: string = 'الجزائر العاصمة',
  customCarrier?: string
): Promise<SmartTrackingResult> {
  // Realistic simulated network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const parsed = parseTrackingInput(input);
  const carrier = customCarrier && customCarrier !== 'auto' ? customCarrier : parsed.detectedCarrier;
  const trackingNumber = parsed.trackingNumber || `DZ-LP${Math.floor(100000000 + Math.random() * 900000000)}CN`;
  const trackingUrl = parsed.cleanUrl || `https://t.17track.net/en#nums=${encodeURIComponent(trackingNumber)}`;

  const now = new Date();
  const formatTime = (d: Date) =>
    d.toLocaleDateString('ar-DZ') + ' ' + d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

  const d1 = new Date(now.getTime() - 4 * 86400000);
  const d2 = new Date(now.getTime() - 3 * 86400000);
  const d3 = new Date(now.getTime() - 2 * 86400000);
  const d4 = new Date(now.getTime() - 1 * 86400000);
  const d5 = now;

  let suggestedStatus: OrderStatus = 'shipped';
  let statusHeadline = '';
  let currentLocation = '';
  let estimatedDelivery = '';
  let pushNotificationTitle = '';
  let pushNotificationMessage = '';
  let events: TrackingEvent[] = [];

  const estDate = new Date(now.getTime() + 5 * 86400000);
  estimatedDelivery = estDate.toISOString().split('T')[0];

  switch (scenario) {
    case 'in_transit': {
      suggestedStatus = 'shipped';
      statusHeadline = 'الشحنة غادرت مركز التوزيع الدولي وفي طريقها جواً للجزائر ✈️';
      currentLocation = 'مطار جوانزو الدولي (Guangzhou Air Cargo Hub) / رحلة الشحن الجوي';
      pushNotificationTitle = 'شحنتك في الطريق الجوي إلى الجزائر! ✈️';
      pushNotificationMessage = `طردك برقم التتبع ${trackingNumber} غادر مركز الفرز الدولي على متن رحلة الشحن الجوي باتجاه الجزائر.`;

      events = [
        {
          id: `ev-${Date.now()}-1`,
          status: 'مغادرة رحلة الشحن الجوي الدولي',
          location: 'Guangzhou / Transit International Hub',
          timestamp: formatTime(d4),
          description: 'الشحنة غادرت بلد المصدر وهي في طريقها إلى مطار هواري بومدين بالجزائر العاصمة.',
        },
        {
          id: `ev-${Date.now()}-2`,
          status: 'اكتمال الفحص الجمركي للتصدير',
          location: 'Shenzhen Customs Clearance Facility',
          timestamp: formatTime(d3),
          description: 'تمت معالجة الوثائق الجمركية وتسليم الطرد لشركة الطيران.',
        },
        {
          id: `ev-${Date.now()}-3`,
          status: 'استلام الطرد وتوليد رقم التتبع',
          location: 'Carrier Sorting Facility, China',
          timestamp: formatTime(d2),
          description: `تم استلام الطرد من التاجر وتوليد الباركود الدولي ${trackingNumber}.`,
        },
      ];
      break;
    }

    case 'customs_algeria': {
      suggestedStatus = 'arrived_algeria';
      statusHeadline = 'وصلت الشحنة إلى أرض الوطن (مطار هواري بومدين / مركز الجمارك) 🛬🇩🇿';
      currentLocation = 'مركز فرز الطرود البريدية مطار هواري بومدين / الجمارك الجزائرية';
      pushNotificationTitle = 'شحنتك وصلت إلى الجزائر! 🇩🇿📦';
      pushNotificationMessage = `وصل طردك رقم ${trackingNumber} إلى مطار هواري بومدين وهو قيد المعالجة الجمركية السريعة قبل إرساله إلى ولاية ${wilaya}.`;

      events = [
        {
          id: `ev-${Date.now()}-1`,
          status: 'معالجة جمركية سريعة للطرود البريدية',
          location: 'مطار هواري بومدين الدولي، الجزائر العاصمة',
          timestamp: formatTime(d5),
          description: 'الشحنة وصلت إلى أرض الوطن وقيد المعالجة السريعة للتوزيع الإقليمي عبر بريد الجزائر.',
        },
        {
          id: `ev-${Date.now()}-2`,
          status: 'هبوط طائرة الشحن واستلام الشحنات',
          location: 'Alger Port / Algiers Airport Cargo Depot',
          timestamp: formatTime(d4),
          description: 'تم تفريغ حاوية الطرود البريدية وتسليمها لمصلحة التخليص البريدي الجزائري.',
        },
        {
          id: `ev-${Date.now()}-3`,
          status: 'مغادرة مركز الترانزيت الدولي',
          location: 'International Transit Hub (Dubai/Paris)',
          timestamp: formatTime(d3),
          description: 'الشحنة في رحلتها المباشرة نحو الجزائر العاصمة.',
        },
        {
          id: `ev-${Date.now()}-4`,
          status: 'تم الشحن من المصنع',
          location: 'Shenzhen Hub, China',
          timestamp: formatTime(d1),
          description: 'انطلاق الشحنة الدولية.',
        },
      ];
      break;
    }

    case 'local_post_delivery': {
      suggestedStatus = 'delivered';
      statusHeadline = `الشحنة وصلت إلى مركز بريد ولاية ${wilaya} وهي جاهزة للاستلام أو تم التسليم ✅`;
      currentLocation = `مكتب بريد الجزائر الرئيسي (Bureau de Poste) - ولاية ${wilaya}`;
      pushNotificationTitle = 'طردك جاهز للاستلام بمكتب البريد! 📬';
      pushNotificationMessage = `وصلت طلبيتك إلى مكتب بريد الجزائر بولايتك (${wilaya}). يمكنك الآن التوجه للاستلام مصحوباً ببطاقة التعريف الوطنية.`;

      events = [
        {
          id: `ev-${Date.now()}-1`,
          status: 'جاهز للاستلام أو تم التسليم للزبون',
          location: `مكتب بريد الجزائر - ولاية ${wilaya}`,
          timestamp: formatTime(d5),
          description: `وصل الإشعار لمكتب البريد المحلي بولايتك (${wilaya}). الطرد جاهز للتسليم.`,
        },
        {
          id: `ev-${Date.now()}-2`,
          status: 'مغادرة مركز الفرز الوطني باتجاه الولاية',
          location: 'مركز الفرز البريدي لبور سعيد / بئر توتة، الجزائر العاصمة',
          timestamp: formatTime(d4),
          description: `تم إرسال الإرسالية البريدية عبر شاحنة نقل البريد المتجهة نحو ولاية ${wilaya}.`,
        },
        {
          id: `ev-${Date.now()}-3`,
          status: 'اكتمال التخليص الجمركي بمطار هواري بومدين',
          location: 'مطار هواري بومدين الدولي، الجزائر',
          timestamp: formatTime(d3),
          description: 'تم استلام وتوثيق الطرد في منظومة بريد الجزائر.',
        },
      ];
      break;
    }
  }

  return {
    trackingNumber,
    trackingUrl,
    carrier,
    suggestedStatus,
    statusHeadline,
    currentLocation,
    estimatedDelivery,
    lastUpdate: formatTime(now),
    events,
    pushNotificationTitle,
    pushNotificationMessage,
  };
}
