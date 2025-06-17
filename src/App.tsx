import { useEffect, useState } from 'react';
import './App.css';
import Bolt12Offer from './components/Bolt12Offer';
import PaymentStatus, { Payment } from './components/PaymentStatus';
import BreezService from './services/BreezService';
import { SdkEvent } from '@breeztech/breez-sdk-liquid';
import BIP353Registration from './components/BIP353Registration';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<string | null>(null);
  const [paymentReceived, setPaymentReceived] = useState<Payment | null>(null);

  useEffect(() => {
    const initializeBreez = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = import.meta.env.VITE_BREEZ_API_KEY;
        const mnemonic = import.meta.env.VITE_MNEMONIC;

        if (!apiKey || !mnemonic) {
          throw new Error('API key or mnemonic not found in environment variables');
        }

        const breezService = BreezService.getInstance();
        await breezService.initialize(apiKey, mnemonic);

        // Generate BOLT12 offer
        const bolt12Offer = await breezService.createBolt12Offer(
          'BOLT12 Payment Demo'
        );
        setOffer(bolt12Offer);

        // Add event listener for payments
        await breezService.addEventListener(handleBreezEvent);

        setIsLoading(false);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize Breez SDK');
        setIsLoading(false);
      }
    };

    initializeBreez();

    // Cleanup on component unmount
    return () => {
      const breezService = BreezService.getInstance();
      breezService.removeAllEventListeners().catch(console.error);
      breezService.disconnect().catch(console.error);
    };
  }, []);

  const handleBreezEvent = (event: SdkEvent) => {
    console.log('Received event:', event);

    // Check if this is a payment received event
    if (event.type === 'paymentWaitingConfirmation' || event.type === 'paymentSucceeded') {
      // For received payments
      setPaymentReceived({
        id: event.details?.txId || 'unknown',
        amount: (event.details?.amountSat || 0),
        timestamp: event.details?.timestamp || Math.floor(Date.now() / 1000),
        destination: event.details?.destination
      });
    }
  };

  const handleRegistrationSuccess = (address: string) => {
    console.log('BIP353 address registered:', address);
    // Here you can handle the registered BIP353 address, e.g., display it or store it
  };

  return (
    <div className="app-container">
      <h1>BOLT12 Payment Receiver</h1>
      
      {error && (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing Breez SDK and generating BOLT12 offer...</p>
        </div>
      ) : (
        <>
          {offer && (
            <div className="content-container">
              <div className="left-column">
                <Bolt12Offer offer={offer} />
              </div>
              <div className="right-column">
                <BIP353Registration bolt12Offer={offer} onRegistrationSuccess={handleRegistrationSuccess} />
                <PaymentStatus payment={paymentReceived} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
