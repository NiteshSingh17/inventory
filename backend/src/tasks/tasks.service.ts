import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

const STALE_THRESHOLD_MS = 5 * 60 * 1000;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async processTasks() {
    await this.recoverStaleTasks();

    const pendingTasks = await this.prisma.backgroundTask.findMany({
      where: { status: TaskStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });

    const results = { processed: 0, failed: 0, skipped: 0 };

    for (const task of pendingTasks) {
      const claimed = await this.claimTask(task.id);
      if (!claimed) {
        results.skipped++;
        continue;
      }

      try {
        await this.prisma.order.update({
          where: { id: task.orderId },
          data: { status: 'COMPLETED' },
        });

        await this.prisma.backgroundTask.update({
          where: { id: task.id },
          data: { status: TaskStatus.COMPLETED },
        });

        results.processed++;
      } catch {
        await this.prisma.backgroundTask.update({
          where: { id: task.id },
          data: { status: TaskStatus.FAILED },
        });

        results.failed++;
      }
    }

    return results;
  }

  async retryTask(taskId: string) {
    const task = await this.prisma.backgroundTask.findUnique({
      where: { id: taskId },
      include: { order: true },
    });

    if (!task) {
      return { status: 'not_found' as const };
    }

    if (task.order.status === 'COMPLETED') {
      return { status: 'already_completed' as const };
    }

    if (task.status === TaskStatus.COMPLETED) {
      return { status: 'already_completed' as const };
    }

    if (task.status === TaskStatus.PROCESSING) {
      return { status: 'already_processing' as const };
    }

    const claimed = await this.claimTask(task.id);
    if (!claimed) {
      return { status: 'already_processing' as const };
    }

    try {
      await this.prisma.order.update({
        where: { id: task.orderId },
        data: { status: 'COMPLETED' },
      });

      await this.prisma.backgroundTask.update({
        where: { id: task.id },
        data: { status: TaskStatus.COMPLETED },
      });

      return { status: 'completed' as const };
    } catch {
      await this.prisma.backgroundTask.update({
        where: { id: task.id },
        data: { status: TaskStatus.FAILED },
      });

      return { status: 'failed' as const };
    }
  }

  private async claimTask(taskId: string): Promise<boolean> {
    const result = await this.prisma.backgroundTask.updateMany({
      where: {
        id: taskId,
        status: TaskStatus.PENDING,
      },
      data: {
        status: TaskStatus.PROCESSING,
      },
    });

    return result.count > 0;
  }

  private async recoverStaleTasks() {
    const threshold = new Date(Date.now() - STALE_THRESHOLD_MS);

    await this.prisma.backgroundTask.updateMany({
      where: {
        status: TaskStatus.PROCESSING,
        updatedAt: { lt: threshold },
      },
      data: {
        status: TaskStatus.PENDING,
      },
    });
  }
}
