import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Bolt12Offer.module.css';

interface Bolt12OfferProps {
  offer: string;
}

const Bolt12Offer: React.FC<Bolt12OfferProps> = ({ offer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>BOLT12 Offer</h2>
      <div className={styles.qrContainer}>
        <QRCodeSVG value={offer} size={256} />
      </div>
      <div className={styles.offerText}>
        {offer}
      </div>
      <button 
        className={styles.copyButton} 
        onClick={handleCopy} 
        disabled={copied}
      >
        {copied ? 'Copied!' : 'Copy Offer'}
      </button>
    </div>
  );
};

export default Bolt12Offer;