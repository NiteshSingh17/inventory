import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { OrdersService } from '../src/orders/orders.service';
import 'dotenv/config';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const userId = "857055ec-e2ad-4e6e-bbc5-0266c218d524";
  const inventoryItemId = "d2930edd-5b6c-4d4b-8805-0f7d685d59ec";
  const idempotencyKey = `56b432ea-2cee-4621-8654-6b0ed39239d3-7e65497e-9aa8-49d5-ac74-0bb7c49ff20b-1787065857839`;

  const orderService = app.get(OrdersService);
  // console.log("orders ", await orderService.allOrder())
  const results = await orderService.create(userId, {
     idempotencyKey,
     inventoryItemId,
  });

  if(results){
    throw new Error("Something went wrong failed tests");
  }
  await app.close();
}

run().catch((err) => {
  console.log(err);
  console.log("test passed")
});
