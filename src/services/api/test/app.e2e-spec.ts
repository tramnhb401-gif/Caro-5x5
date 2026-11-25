import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/v1/health/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/live')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
          service: 'caro-api',
        });
        expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
      });
  });

  it('/api/v1/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ready',
          service: 'caro-api',
          checks: { application: 'up' },
        });
        expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
