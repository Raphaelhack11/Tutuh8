import React from "react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">About ProfitBliss</h1>
      <p className="mb-3">
        ProfitBliss is a trusted fintech and crypto investment platform dedicated to helping individuals grow their wealth securely.
        Our mission is to make digital investing simple, transparent, and rewarding.
      </p>

      <h3 className="text-xl font-semibold mt-4">What we offer</h3>
      <ul className="list-disc ml-6 mt-2">
        <li>Secure deposits in Bitcoin, Ethereum, Litecoin and USDT (TRC20)</li>
        <li>Fixed investment plans with automated ROI credits</li>
        <li>Fast withdrawal processing and admin oversight</li>
        <li>Responsive customer support</li>
      </ul>

      <div className="mt-6">
        <h4 className="font-semibold">Head office</h4>
        <p>ProfitBliss LLC</p>
        <p>1357 Horizon Parkway, Dallas, TX 75201, USA</p>
        <p className="mt-2">Support: +1 (703) 940-2611</p>
      </div>
    </div>
  );
    }
