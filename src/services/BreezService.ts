import init, {
  BindingLiquidSdk,
  connect,
  defaultConfig,
  GetInfoResponse,
  SdkEvent,
} from "@breeztech/breez-sdk-liquid";

type EventCallback = (event: SdkEvent) => void;

class BreezService {
  private static instance: BreezService;
  private sdk: BindingLiquidSdk | null = null;
  private listenerIds: string[] = [];
  private eventCallbacks: EventCallback[] = [];

  private constructor() {}

  public static getInstance(): BreezService {
    if (!BreezService.instance) {
      BreezService.instance = new BreezService();
    }
    return BreezService.instance;
  }

  public async initialize(apiKey: string, mnemonic: string): Promise<void> {
    try {
      // Initialize the WebAssembly module first
      await init();
      console.log("WebAssembly module initialized");

      // Create the default config
      const config = defaultConfig("mainnet", apiKey);

      // Connect to Breez SDK with mnemonic directly
      this.sdk = await connect({
        config,
        mnemonic,
      });

      console.log("Breez SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Breez SDK:", error);
      throw error;
    }
  }

  public async getInfo(): Promise<GetInfoResponse> {
    if (!this.sdk) {
      throw new Error("Breez SDK not initialized");
    }

    try {
      const getInfo = await this.sdk.getInfo();
      console.log("Get info retrieved successfully");
      return getInfo;
    } catch (error) {
      console.error("Failed to retrieve info:", error);
      throw error;
    }
  }

  public async createBolt12Offer(description: string): Promise<string> {
    if (!this.sdk) {
      throw new Error("Breez SDK not initialized");
    }

    try {
      // Prepare to receive payment
      const prepareResponse = await this.sdk.prepareReceivePayment({
        paymentMethod: "bolt12Offer",
      });

      // Create the BOLT12 offer
      const receiveResponse = await this.sdk.receivePayment({
        prepareResponse,
        description,
      });

      return receiveResponse.destination;
    } catch (error) {
      console.error("Failed to create BOLT12 offer:", error);
      throw error;
    }
  }

  public signMessage(message: string): string {
    if (!this.sdk) {
      throw new Error("Breez SDK not initialized");
    }

    try {
      const signatureResult = this.sdk.signMessage({ message });
      console.log("Message signed successfully");
      return signatureResult.signature;
    } catch (error) {
      console.error("Failed to sign message:", error);
      throw error;
    }
  }

  public async addEventListener(callback: EventCallback): Promise<void> {
    if (!this.sdk) {
      throw new Error("Breez SDK not initialized");
    }

    try {
      // Create an event listener class
      class JsEventListener {
        onEvent = (event: SdkEvent) => {
          callback(event);
        };
      }

      const eventListener = new JsEventListener();
      const listenerId = await this.sdk.addEventListener(eventListener);

      this.listenerIds.push(listenerId);
      this.eventCallbacks.push(callback);

      console.log("Event listener added successfully");
    } catch (error) {
      console.error("Failed to add event listener:", error);
      throw error;
    }
  }

  public async removeAllEventListeners(): Promise<void> {
    if (!this.sdk) {
      return;
    }

    try {
      for (const listenerId of this.listenerIds) {
        await this.sdk.removeEventListener(listenerId);
      }

      this.listenerIds = [];
      this.eventCallbacks = [];

      console.log("All event listeners removed");
    } catch (error) {
      console.error("Failed to remove event listeners:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.sdk) {
      return;
    }

    try {
      await this.removeAllEventListeners();
      await this.sdk.disconnect();
      this.sdk = null;

      console.log("Breez SDK disconnected successfully");
    } catch (error) {
      console.error("Failed to disconnect Breez SDK:", error);
      throw error;
    }
  }
}

export default BreezService;
