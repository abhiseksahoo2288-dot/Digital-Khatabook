'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateCustomerQRCode } from '@/utils/qrcode';
import { Download, X } from 'lucide-react';

interface QRCodeGeneratorProps {
  customerId: string;
  customerName: string;
  onClose: () => void;
}

export function QRCodeGenerator({ customerId, customerName, onClose }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrUrl = await generateCustomerQRCode(customerId, customerName);
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [customerId, customerName]);

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-${customerName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>QR Code - {customerName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : qrCodeUrl ? (
            <>
              <div className="flex justify-center">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${customerName}`}
                  className="border rounded-lg"
                />
              </div>
              
              <p className="text-sm text-gray-600">
                Scan this QR code to quickly access {customerName}'s profile
              </p>
              
              <Button onClick={downloadQRCode} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </>
          ) : (
            <div className="text-red-500">
              Failed to generate QR code. Please try again.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}