"use client";
import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useToast } from "@/components/ui/toast";

interface QRScannerProps {
  onScanSuccess?: (result: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<any>(null);
  const { addToast } = useToast();

  // Function to play success beep sound
  const playSuccessBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Success tone
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error("Error playing success sound:", error);
    }
  };

  // Function to play error beep sound
  const playErrorBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 300; // Error tone (lower frequency)
      oscillator.type = 'square'; // Harsher sound for error
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error("Error playing error sound:", error);
    }
  };

  // Function to validate if QR code is system-generated UUID
  const validateSystemQR = (decodedText: string) => {
    try {
      // Check if it's a UUID (our system format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(decodedText.trim());
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Prevent multiple scanner instances
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        verbose: false 
      },
      false
    );

    scanner.render(
      (decodedText: any) => {
        console.log("Scan Success:", decodedText);
        
        // Validate if this is a system-generated UUID
        if (validateSystemQR(decodedText)) {
          // Valid system UUID - look up user
          fetch('/api/users/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid: decodedText.trim() })
          })
          .then(response => response.json())
          .then(user => {
            if (user.id) {
              // Valid user found - proceed with attendance
              playSuccessBeep(); // Play success sound immediately
              
              addToast({
                title: "مرحباً بك!",
                description: `أهلاً ${user.name}، جاري تسجيل الحضور...`,
                type: "success",
              });
              
              if (onScanSuccess) {
                onScanSuccess(decodedText); // Pass the UUID to parent
              }
            } else {
              // User not found
              playErrorBeep();
              addToast({
                title: "عذراً، هذا الباركود غير صالح",
                description: "لم يتم العثور على الموظف",
                type: "error",
              });
            }
          })
          .catch(error => {
            playErrorBeep();
            
            // Check if it's the specific attendance completion error
            if (error.message && error.message.includes("لقد قمت بتسجيل حضورك وانصرافك بالفعل لهذا اليوم")) {
              addToast({
                title: "لقد سجلت حضورك بالفعل!",
                description: "لقد أكملت يومك بالفعل، لا يمكن تسجيل حضور مرة أخرى",
                type: "success",
              });
            } else {
              addToast({
                title: "خطأ في تسجيل الحضور",
                description: error.message || "فشل في تسجيل الحضور، يرجى المحاولة مرة أخرى",
                type: "error",
              });
            }
          });
        } else {
          // Invalid QR code
          playErrorBeep();
          
          addToast({
            title: "عذراً، هذا الباركود غير صالح",
            description: "يرجى استخدام بطاقة الهوية الرسمية للنظام",
            type: "error",
          });
        }
      },
      (error: any) => {
        // Normal scanning errors don't need user notification
      }
    );

    scannerRef.current = scanner;

    // Cleanup function to prevent memory leaks
    return () => {
      if (scannerRef.current && scannerRef.current.getState && scannerRef.current.getState() !== 1) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch((err: any) => console.error("Scanner cleanup failed", err));
      }
    };
  }, [addToast, onScanSuccess]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          ماسح حضور الموظفين
        </h2>
        <div className="relative">
          <div id="reader" className="w-full max-w-md border-2 border-dashed border-emerald-500 rounded-lg overflow-hidden"></div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-emerald-400 rounded-lg opacity-50"></div>
          </div>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
          امسح بطاقة هوية الموظف الرسمية
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>جاهز للمسح</span>
        </div>
      </div>
    </div>
  );
}