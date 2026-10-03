import { OrderItem, UserProfile } from '../types';

/**
 * Transliterates common Algerian Arabic terms to Latin for international postal waybills (AliExpress / Shein / Temu)
 */
export function formatAddressForInternationalDispatch(order: OrderItem, userProfile?: UserProfile) {
  const firstName = order.customerFirstName || userProfile?.firstName || order.customerName.split(' ')[0] || 'Client';
  const lastName = order.customerLastName || userProfile?.lastName || order.customerName.split(' ').slice(1).join(' ') || 'DZ';
  const phone = order.customerPhone.startsWith('0') ? `+213 ${order.customerPhone.slice(1)}` : order.customerPhone;
  const commune = order.customerCommune || userProfile?.commune || 'Centre Ville';
  const detailedAddress = order.customerAddress || userProfile?.detailedAddress || 'Bureau de Poste Central';
  const wilaya = order.customerWilaya || userProfile?.wilaya || 'Alger';
  const postalCode = order.customerPostalCode || userProfile?.postalCode || '16000';

  const fullShippingPayload = {
    contactPerson: `${firstName} ${lastName}`,
    firstName,
    lastName,
    mobilePhone: phone,
    country: 'Algeria',
    countryCode: 'DZ',
    province: wilaya,
    city: commune,
    addressLine1: detailedAddress,
    zipCode: postalCode,
    deliveryNotes: `Algérie Poste - ${order.orderNumber}`,
  };

  const formattedClipboardString = `Contact: ${firstName} ${lastName}
Phone: ${phone}
Address: ${detailedAddress}
City/Commune: ${commune}
Wilaya: ${wilaya}
Postal Code: ${postalCode}
Country: Algeria (DZ)
Ref: ${order.orderNumber}`;

  return {
    payload: fullShippingPayload,
    formattedText: formattedClipboardString,
  };
}
