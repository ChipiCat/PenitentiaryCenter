import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as fs from 'node:fs';
import * as path from 'node:path';

function isTransporter(x: unknown): x is Transporter {
  return typeof (x as any)?.sendMail === 'function';
}

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    const tMaybe = createTransport({
      service: 'gmail',
      auth: {
        user: 'echosoft.developers@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD!,
      },
    });

    if (!isTransporter(tMaybe)) {
      throw new Error(
        'Nodemailer: createTransport no devolvió un Transporter válido',
      );
    }
    this.transporter = tMaybe;
  }

  async sendUserCredentials(to: string, password: string, name: string) {
    const htmlPath = path.resolve(
      process.cwd(),
      'src/common/services/notification_access.html',
    );
    const html = fs.readFileSync(htmlPath, 'utf8');
    const htmlStr = html
      .replace('[Nombre del Usuario]', name)
      .replace('[email.del.usuario@dominio.com]', to)
      .replace('[ContraseñaTemporal123]', password)
      .replace(/\[URL_DEL_SISTEMA_SIGEPEN\]/g, 'https://tusistema.com')
      .replace('[Año Actual]', new Date().getFullYear().toString())
      .replace(
        '[URL_DE_POLITICA_DE_PRIVACIDAD]',
        'https://tusistema.com/privacidad',
      )
      .replace('[URL_DE_CONTACTO_SOPORTE]', 'mailto:soporte@tusistema.com');

    await this.transporter.sendMail({
      from: 'echosoft.developers@gmail.com',
      to,
      subject: 'Bienvenido a SIGEPEN',
      html: htmlStr,
    });
  }
}
