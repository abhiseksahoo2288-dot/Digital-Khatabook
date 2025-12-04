import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateCustomerQRCode = async (customerId: string, customerName: string): Promise<string> => {
  const qrData = JSON.stringify({
    type: 'customer',
    id: customerId,
    name: customerName,
    timestamp: Date.now(),
  });
  
  return generateQRCode(qrData);
};