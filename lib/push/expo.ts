/**
 * Expo Push Notification Service Helper
 * Sends push notifications via Expo's push notification service
 * Uses native fetch (no external dependencies)
 */

export interface ExpoPushMessage {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
}

export interface ExpoPushResponse {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100; // Expo recommends batching up to 100 notifications

/**
 * Chunks an array into batches of specified size
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sends push notifications to Expo push tokens
 * 
 * @param tokens - Array of Expo push tokens (ExponentPushToken format)
 * @param message - Notification message with title, body, and optional data
 * @returns Promise resolving to success status and list of invalid tokens
 */
export async function sendExpoPush(
  tokens: string[],
  message: ExpoPushMessage
): Promise<{ success: boolean; errors: string[]; invalidTokens: string[] }> {
  if (tokens.length === 0) {
    return { success: true, errors: [], invalidTokens: [] };
  }

  const errors: string[] = [];
  const invalidTokens: string[] = [];
  
  // Chunk tokens into batches
  const tokenBatches = chunkArray(tokens, BATCH_SIZE);

  // Process each batch
  for (const batch of tokenBatches) {
    try {
      // Build request payload - Expo expects array of messages
      const messages = batch.map(token => ({
        to: token,
        title: message.title,
        body: message.body,
        data: message.data || {},
        sound: message.sound || 'default',
        priority: message.priority || 'default',
      }));

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const errorMsg = `Expo push API error: ${response.status} ${errorText}`;
        console.error('[expo-push]', errorMsg);
        errors.push(errorMsg);
        continue;
      }

      const result = await response.json();
      
      // Expo returns an object with a 'data' array containing results for each message
      if (result.data) {
        for (let i = 0; i < result.data.length; i++) {
          const item = result.data[i];
          const token = batch[i];
          
          if (item.status === 'error') {
            const errorMsg = `Token error: ${item.message || 'Unknown error'}`;
            console.error('[expo-push]', errorMsg);
            errors.push(errorMsg);
            
            // Check if this is a DeviceNotRegistered error
            if (item.details?.error === 'DeviceNotRegistered') {
              invalidTokens.push(token);
            }
          }
        }
      }
    } catch (error: any) {
      const errorMsg = `Failed to send push batch: ${error.message || 'Unknown error'}`;
      console.error('[expo-push]', errorMsg, error);
      errors.push(errorMsg);
    }
  }

  // Return success if at least some notifications were sent
  // (Some tokens might be invalid, but that's okay)
  return {
    success: errors.length < tokens.length,
    errors,
    invalidTokens,
  };
}

