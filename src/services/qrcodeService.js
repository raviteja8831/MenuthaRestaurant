import api from "../api/api"
export async function fetchQRCodes(restaurantId) {
  const res = await api.get(`/qrcodes?restaurantId=${restaurantId}`);
  return res.data;
}



export async function createQRCode({ name, restaurantId }) {
  // Only send name and restaurantId; backend will generate imageUrl
  const res = await api.post('/qrcodes', { name, restaurantId });
  return res.data;
}

export async function fetchQRCodeOrders(qrcodeId, period) {
  const res = await api.get(`/qrcodes/${qrcodeId}/orders?period=${period}`);
  return res.data;
}
