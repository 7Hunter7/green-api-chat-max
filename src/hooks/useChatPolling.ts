import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification } from '../api/greenApi';
import type { ChatMessage, Credentials } from '../types';

interface Params {
  credentials: Credentials | null;
  onMessage: (msg: ChatMessage) => void;
  enabled: boolean;
}

export function useChatPolling({ credentials, onMessage, enabled }: Params) {
  const stoppedRef = useRef(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!credentials || !enabled) return;
    stoppedRef.current = false;

    const tick = async () => {
      if (stoppedRef.current) return;
      try {
        const notification = await receiveNotification(credentials);
        if (notification) {
          const { body, receiptId } = notification;

          if (body?.typeWebhook === 'incomingMessageReceived') {
            const msg = body.messageData;
            if (msg?.typeMessage === 'textMessage') {
              onMessageRef.current({
                id: body.idMessage,
                chatId: body.senderData.chatId,
                text: msg.textMessageData.textMessage,
                timestamp: body.timestamp * 1000,
                isOutgoing: false,
              });
            }
          }

          await deleteNotification(credentials, receiptId);
        }
      } catch (e) {
        console.warn('Polling error:', e);
      }
      if (!stoppedRef.current) {
        setTimeout(tick, 1500);
      }
    };

    tick();
    return () => {
      stoppedRef.current = true;
    };
  }, [credentials, enabled]);
}