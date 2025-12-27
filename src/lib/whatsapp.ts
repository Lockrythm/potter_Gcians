import { CartItem } from '@/types/book';

const WHATSAPP_NUMBER = '923126203644';

function getItemPrice(item: CartItem): number {
  if (item.purchaseType === 'buy') {
    return item.book.buyPrice;
  }
  switch (item.rentDuration) {
    case 7:
      return item.book.rentPrice7Days;
    case 14:
      return item.book.rentPrice14Days;
    case 30:
      return item.book.rentPrice30Days;
    default:
      return 0;
  }
}

export function generateWhatsAppMessage(items: CartItem[]): string {
  const itemLines = items.map((item, index) => {
    const price = getItemPrice(item);
    const typeLabel =
      item.purchaseType === 'buy'
        ? '[Buy]'
        : `[Rent-${item.rentDuration} Days]`;
    const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
    return `${index + 1}. ${typeLabel} ${item.book.title}${qty} – Rs ${price * item.quantity}`;
  });

  const total = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  const message = `Greetings! I would like to acquire the following from the Potter Book Bank:

${itemLines.join('\n')}

Total Tribute: Rs ${total}
Please confirm my owl. 🦉`;

  return message;
}

export function openWhatsAppCheckout(items: CartItem[]): void {
  const message = generateWhatsAppMessage(items);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(url, '_blank');
}
