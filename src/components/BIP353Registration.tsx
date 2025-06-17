import { useState } from "react";
import BreezService from "./../services/BreezService";
import styles from "./BIP353Registration.module.css";

interface BIP353RegistrationProps {
  bolt12Offer: string | null;
  onRegistrationSuccess: (bip353Address: string) => void;
}

interface RegistrationStatus {
  type: "success" | "error" | "info" | "idle";
  message: string;
}

interface RegistrationResponse {
  bip353_address: string;
}

const BIP353Registration: React.FC<BIP353RegistrationProps> = ({
  bolt12Offer,
  onRegistrationSuccess,
}) => {
  const [username, setUsername] = useState<string>("");
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus>({
      type: "idle",
      message: "",
    });
  const [registeredAddress, setRegisteredAddress] = useState<string | null>(
    null
  );
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!bolt12Offer) {
      setRegistrationStatus({
        type: "error",
        message: "No BOLT12 offer available for registration",
      });
      return;
    }

    if (!username.trim()) {
      setRegistrationStatus({
        type: "error",
        message: "Please enter a username",
      });
      return;
    }

    try {
      setIsRegistering(true);
      setRegistrationStatus({
        type: "info",
        message: "Registering BIP353 address...",
      });

      const breezService = BreezService.getInstance();
      const getInfo = await breezService.getInfo();

      // Get current timestamp
      const timestamp = Math.floor(Date.now() / 1000);

      // Create the message to sign: [time]-[username]-[offer]
      const messageToSign = `${timestamp}-${username}-${bolt12Offer}`;

      // Use BreezService to sign the message with the node's private key
      const signature = breezService.signMessage(messageToSign);

      // Prepare the registration payload
      const payload = {
        time: timestamp,
        username,
        offer: bolt12Offer,
        signature,
      };

      // Get the node's public key from the info
      const pubkey = getInfo.walletInfo.pubkey;

      // Make an HTTP request to the service endpoint
      const response = await fetch(`https://breez.fun/bolt12offer/${pubkey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response
      const registrationResponse: RegistrationResponse = await response.json();

      // Handle the successful registration
      setRegistrationStatus({
        type: "success",
        message: `Successfully registered BIP353 address!`,
      });
      setRegisteredAddress(registrationResponse.bip353_address);
      onRegistrationSuccess(registrationResponse.bip353_address);
    } catch (error) {
      console.error("Failed to register BIP353 address:", error);
      setRegistrationStatus({
        type: "error",
        message: `Registration failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Register BIP353 Username</h2>
      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className={styles.input}
            disabled={isRegistering}
          />
          <button
            onClick={handleRegister}
            className={styles.button}
            disabled={isRegistering || !bolt12Offer || !username.trim()}
          >
            {isRegistering ? "Registering..." : "Register"}
          </button>
        </div>

        {registrationStatus.type !== "idle" && (
          <div
            className={`${styles.status} ${styles[registrationStatus.type]}`}
          >
            {registrationStatus.message}
          </div>
        )}

        {registeredAddress && (
          <div className={styles.registrationInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>BIP353 Address:</span>
              <span>{registeredAddress}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BIP353Registration;
