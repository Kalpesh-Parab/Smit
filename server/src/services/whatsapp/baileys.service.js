import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion,
} from '@whiskeysockets/baileys';
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

export let sock = null;
export let isWhatsappConnected = false;
export let latestQrDataUrl = null;

let isConnecting = false;
const AUTH_DIR = path.join(process.cwd(), 'baileys_auth_info');

export const getWhatsappStatus = () => {
  const credsExist = fs.existsSync(path.join(AUTH_DIR, 'creds.json'));
  const isOnline = isWhatsappConnected || Boolean(sock?.user && credsExist);

  return {
    connected: isOnline,
    qrCode: isOnline ? null : latestQrDataUrl,
  };
};

export const connectToWhatsApp = async () => {
  if (isConnecting) return;
  isConnecting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestWaWebVersion({}).catch(() => ({
      version: [2, 3000, 1015901307],
    }));

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      generateHighQualityLinkPreview: true,
      browser: ['Smit Office Bot', 'Chrome', '120.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 15000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        isWhatsappConnected = false;
        console.log('\n⚡ [WhatsApp] Scan new QR code:');
        qrcodeTerminal.generate(qr, { small: true });

        try {
          latestQrDataUrl = await qrcode.toDataURL(qr);
        } catch (err) {
          console.error('[WhatsApp] Error converting QR to DataURL:', err);
        }
      }

      if (connection === 'close') {
        isConnecting = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`⚠️ [WhatsApp] Connection closed (Code: ${statusCode || 'Unknown'}). Reconnecting: ${shouldReconnect}`);

        if (statusCode === DisconnectReason.loggedOut) {
          isWhatsappConnected = false;
          latestQrDataUrl = null;
          console.log('🧹 [WhatsApp] Explicitly logged out. Wiping auth folder...');
          if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          }
          setTimeout(() => connectToWhatsApp(), 2000);
        } else {
          // Reconnect smoothly without zeroing out state for code 515/network blips
          setTimeout(() => connectToWhatsApp(), 2000);
        }
      } else if (connection === 'open') {
        isConnecting = false;
        isWhatsappConnected = true;
        latestQrDataUrl = null;
        console.log('✅ [WhatsApp] Baileys Socket paired & connected successfully!');
      }
    });
  } catch (error) {
    isConnecting = false;
    console.error('[WhatsApp] Error during socket initialization:', error);
    setTimeout(() => connectToWhatsApp(), 5000);
  }
};

export const sendPDFInvoice = async ({
  phone,
  pdfBuffer,
  fileName,
  caption,
}) => {
  const status = getWhatsappStatus();
  if (!sock || !status.connected) {
    throw new Error('WhatsApp bot is not connected. Please connect via QR code first.');
  }

  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const formattedJid = `${cleanPhone}@s.whatsapp.net`;

  const sendPromise = sock.sendMessage(formattedJid, {
    document: pdfBuffer,
    mimetype: 'application/pdf',
    fileName: fileName || 'Invoice.pdf',
    caption: caption || 'Invoice from Smit Office',
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('WhatsApp message delivery timed out after 15s')),
      15000
    )
  );

  return Promise.race([sendPromise, timeoutPromise]);
};