import { Global, Module } from '@nestjs/common';
import { MailService } from './providers/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailController } from './mail.controller';

// makes importation of mail module to any module
@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          transport: {
            host: config.get('appConfig.mailHost'),
            secure: true,
            port: 465,
            auth: {
              user: config.get('appConfig.smtpUsername'),
              pass: config.get('appConfig.smtpPassword'),
            },
            tls: { rejectUnauthorized: false },
          },
          default: {
            from: `LOG  <${'userx@ashrodax.com'}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new EjsAdapter({
              inlineCssEnabled: true,
            }),
            options: {
              strict: false,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
