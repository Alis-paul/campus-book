import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { QrCode, ScanLine, CheckCircle2, ArrowRight, XCircle, Camera } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { Html5Qrcode } from "html5-qrcode"

export default function QRCheckIn() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)
  const { token } = useAuthStore()
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'scan' | 'show'>('scan')
  
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // On scan success
          await handleCheckIn(decodedText);
          stopScanner();
        },
        () => {
          // Error callback
        }
      ).catch((err) => {
        console.error("Camera start error", err);
        setScanning(false);
        setResult('error');
        setMessage('Could not access camera');
      });
    }

    return () => {
      if (scannerRef.current && scanning) {
        stopScanner();
      }
    };
  }, [scanning]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.error(e);
      }
    }
    setScanning(false);
  }

  const handleCheckIn = async (qrToken: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/checkin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ token: qrToken })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult('success');
        setMessage(data.message);
      } else {
        setResult('error');
        setMessage(data.message || 'Check-in failed');
      }
    } catch (err) {
      setResult('error');
      setMessage('Network error during check-in');
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase italic">QR Check-in</h1>
          <p className="text-muted-foreground">Scan the entrance QR or present your code to the tablet.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Scan Tab */}
          <motion.div 
            whileHover={{ y: -5 }}
            className={`glass-card p-6 rounded-3xl border ${activeTab === 'scan' ? 'border-primary shadow-[0_0_30px_rgba(56,189,248,0.1)]' : 'border-border opacity-60'}`}
            onClick={() => setActiveTab('scan')}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">Scanner Mode</h2>
            <p className="text-xs text-muted-foreground mb-6">Scan the QR code displayed outside the room to unlock.</p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setScanning(true); setResult(null); }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              disabled={scanning}
            >
              <ScanLine className="w-4 h-4" /> Start Scanning
            </button>
          </motion.div>

          {/* Show Tab */}
          <motion.div 
            whileHover={{ y: -5 }}
            className={`glass-card p-6 rounded-3xl border ${activeTab === 'show' ? 'border-accent shadow-[0_0_30px_rgba(192,132,252,0.1)]' : 'border-border opacity-60'}`}
            onClick={() => setActiveTab('show')}
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold mb-1">Display Mode</h2>
            <p className="text-xs text-muted-foreground mb-6">Present your booking code to the room's tablet scanner.</p>
            
            <Link to="/dashboard" className="w-full bg-secondary border border-border text-foreground py-3 rounded-2xl font-bold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
              View Your Codes <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Scanner Overlay */}
        <AnimatePresence>
          {scanning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            >
              <div className="w-full max-w-md">
                <div className="relative aspect-square overflow-hidden rounded-3xl border-2 border-primary/50 bg-card/20 shadow-[0_0_50px_rgba(56,189,248,0.3)]">
                  <div id="qr-reader" className="w-full h-full"></div>
                  
                  {/* Scanning Overlay UI */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/20 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                      
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-primary/50 shadow-[0_0_15px_#38BDF8]"
                      />
                    </div>
                    <p className="mt-8 text-white font-bold tracking-widest text-sm animate-pulse">CENTER QR CODE IN FRAME</p>
                  </div>
                </div>
                
                <button 
                  onClick={stopScanner}
                  className="mt-8 w-full py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Feedback */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            >
              <div className="glass-card max-w-sm w-full p-8 rounded-3xl border border-border text-center shadow-2xl relative">
                {result === 'success' ? (
                  <>
                    <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <CheckCircle2 className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="text-3xl font-black mb-2">ACCESS GRANTED</h3>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{message}</p>
                    <button 
                      onClick={() => setResult(null)}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black tracking-wider hover:scale-[1.02] transition-all"
                    >
                      CONTINUE
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <XCircle className="w-10 h-10 text-danger" />
                    </div>
                    <h3 className="text-3xl font-black mb-2 text-danger">ACCESS DENIED</h3>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{message}</p>
                    <button 
                      onClick={() => setResult(null)}
                      className="w-full bg-secondary py-4 rounded-2xl font-black tracking-wider hover:bg-secondary/80 transition-all"
                    >
                      TRY AGAIN
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
