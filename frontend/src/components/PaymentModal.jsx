import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { CheckCircle } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, policyName, premiumAmount, userId, policyId, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const payBtnRef = useRef(null);
  const successTextRef = useRef(null);

  const handlePay = async () => {
    // Basic GSAP Button click animation
    if (payBtnRef.current) {
        gsap.to(payBtnRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, policyId, amount: premiumAmount }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentSuccess(true);
        
        // GSAP Success text animation
        setTimeout(() => {
          if (successTextRef.current) {
            gsap.fromTo(successTextRef.current, 
              { opacity: 0, scale: 0.5, y: 20 }, 
              { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
            );
          }
        }, 100);

        setTimeout(() => {
          onPaymentSuccess();
          onClose(); // Close modal
          
          // Reset internal state safely after closing
          setTimeout(() => setPaymentSuccess(false), 300);
        }, 2500);
      } else {
        console.error("Payment failed:", data);
      }
    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Ensure modal unmounts cleanly
  if (!isOpen && !paymentSuccess) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 350 }}
              className="bg-gray-900 border border-gray-700/50 shadow-2xl rounded-3xl w-full max-w-sm p-8 relative overflow-hidden ring-1 ring-white/10"
            >
              {/* Optional dynamic glowing background effect */}
              <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {!paymentSuccess ? (
                <div className="relative z-10 flex flex-col h-full">
                  <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">Checkout</h2>
                  
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 mb-8 border border-gray-700/50 shadow-inner">
                    <div className="flex flex-col gap-1 mb-4 pb-4 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Policy</span>
                      <span className="text-white font-semibold text-lg">{policyName || "Parametric Protection"}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-gray-400 font-medium">Total Premium</span>
                      <span className="text-emerald-400 font-black text-3xl">
                        ${premiumAmount || "0.00"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3">
                    <button
                      onClick={onClose}
                      disabled={isProcessing}
                      className="w-1/3 py-3.5 px-4 rounded-xl font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 ring-1 ring-inset ring-gray-700 hover:ring-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      ref={payBtnRef}
                      onClick={handlePay}
                      disabled={isProcessing}
                      className="w-2/3 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        "Pay Now"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
                  >
                    <CheckCircle className="w-24 h-24 text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                  </motion.div>
                  <h3 
                    ref={successTextRef}
                    className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-center leading-tight"
                  >
                    Payment Successful<br/>
                    <span className="text-emerald-400 text-[1.1rem] mt-2 block tracking-wide uppercase">Policy Activated</span>
                  </h3>
                </div>
              )}
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
