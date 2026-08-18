import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TasksService } from '../src/tasks/tasks.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const tasksService = app.get(TasksService);
  const results = await tasksService.processTasks();

  const output = [
    `Processed: ${results.processed}`,
    `Failed: ${results.failed}`,
    `Skipped: ${results.skipped}`,
  ].join('\n');

  console.log(output + '\n');
  await app.close();
}

run().catch((err) => {
  console.error(err.message + '\n');
  process.exit(1);
});
