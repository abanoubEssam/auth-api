import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class Swagger {
  static setup(app: NestExpressApplication) {
    const options = new DocumentBuilder()
      .setTitle('Auth API')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer('/api/v1')
      .build();


    const document = SwaggerModule.createDocument(app, options, {
      ignoreGlobalPrefix: true
    });
    SwaggerModule.setup('docs', app, document);
  }
}
