import React, { useState } from "react";

export default function PaymentModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState("card"); // card | upi | qr | net
  const [stage, setStage] = useState("methods"); // methods | success

  const handlePay = () => {
    setStage("success");
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1800);
  };

  return (
    <div className="rzp-backdrop" onClick={onClose}>
      <style>{`
        .rzp-backdrop{
          position:fixed;inset:0;background:rgba(0,0,0,.55);
          display:flex;align-items:center;justify-content:center;z-index:9999;
        }
        .rzp-box{
          width:420px;background:#fff;border-radius:18px;
          overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.25);
          animation:fadeIn .25s ease;
        }
        .rzp-header{
          background:linear-gradient(135deg,#0b5fff,#4f46e5);
          color:#fff;padding:14px 18px;font-weight:700;font-size:1.1rem;
        }
        .rzp-tabs{display:flex;border-bottom:1px solid #e2e8f0;}
        .rzp-tab{
          flex:1;padding:10px;font-weight:600;font-size:14px;
          text-align:center;cursor:pointer;transition:.2s;
        }
        .rzp-tab.active{color:#0b5fff;border-bottom:3px solid #0b5fff;}
        .rzp-body{padding:20px;}
        .rzp-field{margin-bottom:10px;}
        .rzp-field label{font-size:13px;font-weight:600;display:block;margin-bottom:4px;}
        .rzp-field input{
          width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:10px;font:inherit;
        }
        .rzp-paybtn{
          width:100%;background:linear-gradient(135deg,#0b5fff,#4f46e5);
          border:none;border-radius:10px;color:#fff;padding:12px;font-weight:700;
          cursor:pointer;margin-top:12px;
        }
        .rzp-success{
          text-align:center;padding:40px 20px;
        }
        .rzp-success h2{color:#0b5fff;margin-bottom:8px;}
        .rzp-success p{color:#475569;}
        @keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
      `}</style>

      <div className="rzp-box" onClick={(e) => e.stopPropagation()}>
        <div className="rzp-header">Secure Payment</div>

        {stage === "methods" ? (
          <>
            <div className="rzp-tabs">
              {["card","upi","qr","net"].map((t)=>(
                <div
                  key={t}
                  className={`rzp-tab ${tab===t?"active":""}`}
                  onClick={()=>setTab(t)}
                >
                  {t==="card"?"Card":t==="upi"?"UPI":t==="qr"?"QR": "Netbanking"}
                </div>
              ))}
            </div>

            <div className="rzp-body">
              {tab === "card" && (
                <>
                  <div className="rzp-field">
                    <label>Card Number</label>
                    <input placeholder="XXXX XXXX XXXX 1234" />
                  </div>
                  <div style={{display:"flex",gap:"8px"}}>
                    <div className="rzp-field" style={{flex:1}}>
                      <label>Expiry</label>
                      <input placeholder="MM/YY" />
                    </div>
                    <div className="rzp-field" style={{flex:1}}>
                      <label>CVV</label>
                      <input placeholder="123" />
                    </div>
                  </div>
                </>
              )}

              {tab === "upi" && (
                <div className="rzp-field">
                  <label>UPI ID</label>
                  <input placeholder="yourname@upi" />
                </div>
              )}

              {tab === "qr" && (
                <div style={{textAlign:"center"}}>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=demo@upi"
                    alt="QR Code"
                    style={{margin:"12px auto"}}
                  />
                  <p style={{fontSize:13,color:"#475569"}}>
                    Scan this QR with any UPI app
                  </p>
                </div>
              )}

              {tab === "net" && (
                <div className="rzp-field">
                  <label>Select Bank</label>
                  <select style={{width:"100%",padding:"10px",border:"1px solid #e5e7eb",borderRadius:"10px"}}>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>SBI</option>
                  </select>
                </div>
              )}

              <button className="rzp-paybtn" onClick={handlePay}>
                Pay ₹5
              </button>
            </div>
          </>
        ) : (
          <div className="rzp-success">
            <h2>✅ Payment Successful</h2>
            <p>Generating your resume PDF...</p>
          </div>
        )}
      </div>
    </div>
  );
}
