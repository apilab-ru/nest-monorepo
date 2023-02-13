import { Injectable } from '@nestjs/common';
import { firstValueFrom, Observable, shareReplay } from 'rxjs';
import { config } from '../../config/config';

const nodemailer = require('nodemailer');

@Injectable()
export class MailService {
  private transport$: Observable<any>;

  constructor() {
    this.transport$ = new Observable<any>(resolve => {
      const transporter = nodemailer.createTransport({
        ...config.email,
      });

      resolve.next(transporter);
    }).pipe(
      shareReplay(1),
    );
  }

  sendEmail(email: string, subject: string, html: string): Promise<void> {
    return firstValueFrom(this.transport$).then(transport => {
      const mailOptions = {
        from: config.email.auth.user,
        to: email,
        subject,
        html,
      };

      return new Promise<void>((resolve, reject) => {
        transport.sendMail(mailOptions, function(error, info) {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    });
  }
}
