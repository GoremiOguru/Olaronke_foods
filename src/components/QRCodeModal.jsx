import React, { useRef } from 'react';
import { X, QrCode, Printer, Download, Copy, Check, Sparkles, Smartphone } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, restaurantName = "B'feastas Topfaith Cafeteria" }) {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://b-feastas.vercel.app';
  // Use high resolution Google Charts QR API or QRServer API for printable QR code
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}&color=0f172a&bgcolor=ffffff&margin=2`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>B'feastas Printable Cafeteria Table QR Code</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding: 40px;
              background-color: #f8fafc;
              color: #0f172a;
            }
            .card {
              max-w: 420px;
              margin: 0 auto;
              border: 3px solid #0f172a;
              border-radius: 24px;
              padding: 32px;
              background: #ffffff;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .header {
              font-size: 28px;
              font-weight: 900;
              margin-bottom: 4px;
              color: #ea580c;
            }
            .subtitle {
              font-size: 14px;
              font-weight: 700;
              color: #64748b;
              margin-bottom: 24px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .qr-img {
              width: 240px;
              height: 240px;
              margin: 0 auto 20px auto;
              border-radius: 16px;
              border: 2px solid #e2e8f0;
              padding: 8px;
            }
            .instructions {
              font-size: 16px;
              font-weight: 800;
              margin-bottom: 8px;
            }
            .subtext {
              font-size: 13px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">B'feastas</div>
            <div class="subtitle">Topfaith University Campus Dining</div>
            <img src="${qrImageUrl}" class="qr-img" alt="Scan to order B'feastas food" />
            <div class="instructions">📱 SCAN TO VIEW MENU & ORDER</div>
            <div class="subtext">Scan with your Phone Camera to order Jollof, Fried Rice, Chicken & Drinks instantly!</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center mx-auto text-brand-orange">
            <QrCode className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Counter & Table QR Cards</h2>
            <p className="text-xs text-slate-400 mt-1">Print tent cards for cafeteria tables so students scan and order instantly on their phones!</p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-6 rounded-2xl border-4 border-slate-800 inline-block shadow-inner">
            <img
              src={qrImageUrl}
              alt="Scan to order B'feastas"
              className="w-48 h-48 mx-auto rounded-lg object-contain"
            />
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest mt-2">Scan with Phone Camera</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 truncate pr-2">{currentUrl}</span>
            <button
              onClick={handleCopyLink}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Print Button */}
          <div className="pt-2">
            <button
              onClick={handlePrint}
              className="w-full bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-black py-3.5 rounded-2xl shadow-orange-glow flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-5 h-5" />
              <span>Print Table Tent Cards ➔</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
