import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification } from '../api/greenApi';
import type { ChatMessage, Credentials } from '../types';

interface Params {
  credentials: Credentials | null;
  onMessage: (msg: ChatMessage) => void;
  onStatus: (idMessage: string, status: ChatMessage['status']) => void;
  enabled: boolean;
}

export function useChatPolling({
  credentials,
  onMessage,
  onStatus,
  enabled,
}: Params) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

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

          // Входящее текстовое сообщение
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

          // Статус отправленного нами сообщения
          if (
            body.typeWebhook === 'outgoingMessageStatus' &&
            body.idMessage &&
            body.status
          ) {
            onStatusRef.current(
              body.idMessage,
              mapStatus(body.status),
            );
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

function mapStatus(raw: string): ChatMessage['status'] {
  switch (raw) {
    case 'sent':
    case 'delivered':
    case 'read':
      return raw;
    case 'noAccount':
    case 'notInGroup':
      return 'failed';
    case 'pending':
      return 'pending';
    default:
      return 'failed';
  }
}