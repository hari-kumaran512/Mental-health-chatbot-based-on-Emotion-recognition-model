
import axios from 'axios';

// Define the base URL for your RASA server
// This should be updated to point to your actual RASA server
const RASA_API_URL = 'http://localhost:5005';

export interface RasaMessage {
  recipient_id: string;
  text?: string;
  image?: string;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
}

export interface SendMessageParams {
  message: string;
  sender: string;
}

/**
 * Sends a message to the RASA server and returns the response
 */
export const sendMessageToRasa = async ({ message, sender }: SendMessageParams): Promise<RasaMessage[]> => {
  try {
    const response = await axios.post(`${RASA_API_URL}/webhooks/rest/webhook`, {
      message,
      sender
    });
    
    return response.data as RasaMessage[];
  } catch (error) {
    console.error('Error communicating with RASA server:', error);
    return [{ 
      recipient_id: sender,
      text: "I'm having trouble connecting to my brain right now. Please try again later."
    }];
  }
};

/**
 * Checks if the RASA server is available
 */
export const checkRasaStatus = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${RASA_API_URL}/status`);
    return response.status === 200;
  } catch (error) {
    console.error('RASA server is not available:', error);
    return false;
  }
};
