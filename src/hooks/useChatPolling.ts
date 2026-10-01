import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification } from '../api/greenApi';
import type { ChatMessage, Credentials } from '../types';

interface Params {
  credentials: Credentials | null;
  onMessage: (msg: ChatMessage) => void;
  enabled: boolean;
}

export function useChatPolling({ credentials, onMessage, enabled }: Params) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!credentials || !enabled) return;
    let stopped = false;
    let timerId: number | undefined;

    const tick = async () => {
      if (stopped) return;
      try {
        const notification = await receiveNotification(credentials);
        if (notification) {
          const { body, receiptId } = notification;

          if (
            body.typeWebhook === 'incomingMessageReceived' &&
            body.messageData?.typeMessage === 'textMessage' &&
            body.senderData &&
            body.messageData.textMessageData
          ) {
            onMessageRef.current({
              id: body.idMessage ?? `in-${Date.now()}`,
              chatId: body.senderData.chatId,
              text: body.messageData.textMessageData.textMessage,
              timestamp: body.timestamp * 1000,
              isOutgoing: false,
            });
          }

          await deleteNotification(credentials, receiptId);
        }
      } catch (e) {
        console.warn('Polling error:', e);
      }
      if (!stopped) {
        timerId = window.setTimeout(tick, 1500);
      }
    };

    tick();
    return () => {
      stopped = true;
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [credentials, enabled]);
}