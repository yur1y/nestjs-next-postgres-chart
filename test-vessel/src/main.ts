import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as _cluster from 'cluster';
const cluster = _cluster as unknown as _cluster.Cluster; // typings fix
import * as os from 'os';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(
        `Worker ${worker.process.pid} , code: ${code} , signal: ${signal} died. Starting a new one...`,
      );
      cluster.fork();
    });
  } else {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors();

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Product Importer API')
      .setDescription('API for importing and managing products')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 3000);
  }
}
bootstrap();
