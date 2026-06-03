export function getOrderProtocol(orderId: string) {
  const readableId = orderId.replaceAll('-', '').slice(0, 8).toUpperCase();
  return `MDC-${readableId}`;
}
