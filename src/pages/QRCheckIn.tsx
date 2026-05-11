import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { QrCode, ScanLine, CheckCircle2, ArrowRight, XCircle, Camera } from "lucide-react"
import { apiFetch } from "../utils/api"
import { Html5Qrcode } from "html5-qrcode"

export default function QRCheckIn() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'scan' | 'show'>('scan')
  
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.error("Scanner stop error", e);
      }
    }
    setScanning(false);
  }, []);

  const handleCheckIn = async (qrToken: string) => {
    const data = await apiFetch('/api/bookings/checkin', {
      method: "POST",
      body: { token: qrToken }
    });

    if (data.status === 'success') {
      setResult('success');
      setMessage(data.message || "Session activated successfully.");
    } else {
      setResult('error');
      setMessage(data.message || 'Check-in failed');
    }
  }

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
          await handleCheckIn(decodedText);
          stopScanner();
        },
        () => {
          // Silent frame errors
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
  }, [scanning, stopScanner]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <ScanLine className="w-3 h-3" /> Zero-Touch Verification
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase italic">QR Check-in</h1>
          <p className="text-muted-foreground text-sm font-medium">Scan the entrance QR or present your code to the tablet.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className={`glass-card p-6 rounded-3xl border cursor-pointer transition-all ${activeTab === 'scan' ? 'border-primary shadow-[0_0_30px_rgba(56,189,248,0.1)]' : 'border-border/50 opacity-60'}`}
            onClick={() => setActiveTab('scan')}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">Scanner Mode</h2>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Scan the QR code displayed outside the room to unlock your session.</p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setScanning(true); setResult(null); }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              disabled={scanning}
            >
              <ScanLine className="w-4 h-4" /> Open Camera
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className={`glass-card p-6 rounded-3xl border cursor-pointer transition-all ${activeTab === 'show' ? 'border-accent shadow-[0_0_30px_rgba(192,132,252,0.1)]' : 'border-border/50 opacity-60'}`}
            onClick={() => setActiveTab('show')}
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 border border-accent/30">
              <QrCode className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold mb-1">Display Mode</h2>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Present your booking code to the room's tablet scanner.</p>
            
            <Link to="/dashboard" className="w-full bg-secondary border border-border/50 text-foreground py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
              View My Codes <ArrowRight className="w-4 h-4" />
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-2xl p-4"
            >
              <div className="w-full max-w-md">
                <div className="relative aspect-square overflow-hidden rounded-3xl border-2 border-primary/30 bg-card/20 shadow-[0_0_50px_rgba(56,189,248,0.2)]">
                  <div id="qr-reader" className="w-full h-full"></div>
                  
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/10 rounded-2xl relative">
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
                    <p className="mt-8 text-white font-black tracking-[0.2em] text-[10px] animate-pulse">LOCKING FOCUS...</p>
                  </div>
                </div>
                
                <button 
                  onClick={stopScanner}
                  className="mt-8 w-full py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5"
                >
                  Terminate Scan
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
              <div className="glass-card max-w-sm w-full p-8 rounded-3xl border border-border shadow-2xl text-center relative">
                {result === 'success' ? (
                  <>
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                      <CheckCircle2 className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Access Granted</h3>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed font-medium">{message}</p>
                    <button 
                      onClick={() => setResult(null)}
                      className="w-full bg-success text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg shadow-success/20"
                    >
                      Enter Room
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-danger/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                      <XCircle className="w-10 h-10 text-danger" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 text-danger uppercase tracking-tight">Access Denied</h3>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed font-medium">{message}</p>
                    <button 
                      onClick={() => setResult(null)}
                      className="w-full bg-secondary py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-secondary/80 transition-all"
                    >
                      Retry Verification
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
