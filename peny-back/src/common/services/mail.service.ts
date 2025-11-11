import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as fs from 'node:fs';
import * as path from 'node:path';

function isTransporter(x: unknown): x is Transporter {
  return (
    typeof x === 'object' &&
    x !== null &&
    'sendMail' in x &&
    typeof (x as Transporter).sendMail === 'function'
  );
}

@Injectable()
export class MailService {
  private transporter: Transporter;
  private mailUser: string;

  constructor() {
    const mailUser = process.env.MAIL_USER;
    const mailPassword = process.env.MAIL_PASSWORD;

    if (!mailUser || !mailPassword) {
      throw new Error(
        'Variables de entorno MAIL_USER y MAIL_PASSWORD no configuradas',
      );
    }

    this.mailUser = mailUser;

    const tMaybe = createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPassword,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 1,
      connectionTimeout: 5000,
      socketTimeout: 5000,
      logger: false,
      debug: false,
    });

    if (!isTransporter(tMaybe)) {
      throw new Error(
        'Nodemailer: createTransport no devolvió un Transporter válido',
      );
    }
    this.transporter = tMaybe;
  }

  async sendUserCredentials(
    to: string,
    password: string,
    name: string,
  ): Promise<void> {
    const htmlPath = path.resolve(
      process.cwd(),
      'src/common/services/notification_access.html',
    );

    let html: string;
    try {
      html = fs.readFileSync(htmlPath, 'utf8');
    } catch (err) {
      throw new Error(
        'No se pudo leer la plantilla HTML: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }

    const systemUrl = process.env.SYSTEM_URL || 'https://www.policia.bo/';
    const privacyUrl = process.env.PRIVACY_URL || `https://www.policia.bo/`;
    const supportEmail =
      process.env.SUPPORT_EMAIL || 'comando.general@policia.bo';

    const htmlStr = html
      .replace('[Nombre del Usuario]', name)
      .replace('[email.del.usuario@dominio.com]', to)
      .replace('[ContraseñaTemporal123]', password)
      .replace(/\[URL_DEL_SISTEMA_SIGEPEN\]/g, systemUrl)
      .replace('[Año Actual]', new Date().getFullYear().toString())
      .replace('[URL_DE_POLITICA_DE_PRIVACIDAD]', privacyUrl)
      .replace('[URL_DE_CONTACTO_SOPORTE]', `mailto:${supportEmail}`);

    try {
      await this.transporter.sendMail({
        from: this.mailUser,
        to,
        subject: 'Bienvenido a SIGEPEN',
        html: htmlStr,
      });
    } catch (err) {
      throw new Error(
        'No se pudo enviar el correo: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }
}
