import React from 'react';
import styles from './PaymentStatus.module.css';

interface Payment {
  id: string;
  amount: number;
  timestamp: number;
  destination?: string;
}

interface PaymentStatusProps {
  payment: Payment | null;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ payment }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Payment Status</h2>
      
      {payment ? (
        <>
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Amount:</span>
              <span className={styles.info}>{payment.amount} sats</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Timestamp:</span>
              <span className={styles.info}>{new Date(payment.timestamp * 1000).toLocaleString()}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>TxId:</span>
              <span className={styles.info}>{payment.id}</span>
            </div>
            {payment.destination && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Destination:</span>
                <span className={styles.info}>{payment.destination}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={`${styles.status} ${styles.waiting}`}>
          Waiting for payment...
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
export type { Payment };