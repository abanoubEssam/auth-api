import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DefaultValidationPipe } from './common/pipes/default-validation.pipe';
import { Swagger } from './common/utils/swagger';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const port = process.env.PORT || 3500

  const reflector = app.get(Reflector);
  app.useGlobalPipes(new DefaultValidationPipe());

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads', maxAge: '7d' });
  app.useStaticAssets(join(process.cwd(), 'assets/default-images'), {
    prefix: '/assets/default-images',
    maxAge: '7d',
  });

  Swagger.setup(app)


  await app.listen(port, () => {

    console.log(`listening on port ${port}`)
    console.log(`Environment ${process.env.NODE_ENV}`)
  });
}
bootstrap();
