// whatsapp client
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import QRCode from 'qrcode-terminal';

import { CustomModel } from '../models/CustomModel';

// utilities
import { Util } from '../util/Util';

// hooks
import { useSpinner } from '../hooks/useSpinner';
import { projectName } from '../utils';

class WhatsAppClient {
  public constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: projectName,
      }),
      puppeteer: {
        args: ['--no-sandbox']
      }
    });

    this.customModel = new CustomModel();
  }

  public initializeClient() {
    this.subscribeEvents();
    this.client.initialize();
  }

  private subscribeEvents() {
    const spinner = useSpinner('Whats App Client | generating QR Code... \n');
    spinner.start();
    this.client
      .on('qr', (qr) => {
        WhatsAppClient.generateQrCode(qr);
        spinner.succeed(`QR has been generated! | Scan QR Code with you're mobile.`);
      })
      .on('auth_failure', (message) => spinner.fail(`Authentication fail ${message}`))
      .on('authenticated', () => spinner.succeed('User Authenticated!'))
      .on('loading_screen', () => spinner.start('loading chat... \n'))
      .on('ready', () => spinner.succeed('Client is ready | All set!'))
      // arrow function to prevent this binding
      .on('message', async (msg) => this.onMessage(msg))
      .on('message_create', async (msg) => this.onSelfMessage(msg));
  }

  private static generateQrCode(qr: string) {
    QRCode.generate(qr, { small: true });
  }

  private async onMessage(message: Message) {
    if (message.fromMe) return;
    console.log({ message: message.body })
  }

  private async onSelfMessage(message: Message) {
    if (!message.fromMe) return;
    if (message.hasQuotedMsg && !Util.getModelByPrefix (message.body)) return;
    this.onMessage(message);
  }

  public async sendMessage(msgStr: string, message: Message, modelName: string) {
    this.customModel.sendMessage({ prompt: msgStr, modelName }, message);
  }

  private client;

  private customModel: CustomModel;

}

export { WhatsAppClient };

// DOCS:
// https://wwebjs.dev/guide/#qr-code-generation
