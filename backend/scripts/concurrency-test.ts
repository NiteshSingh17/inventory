const API = process.env.API_URL || 'http://localhost:3001';
const TOTAL_USERS = 10;

function api(path: string, userId: string, opts: RequestInit = {}) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...(opts.headers as Record<string, string>),
    },
  });
}

async function fetchUsers() {
  const res = await api('/users', '');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

async function createTestItem(adminId: string) {
  const res = await api('/inventory', adminId, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Concurrency Test Item',
      sku: `CONC-TEST-${Date.now()}`,
      totalQuantity: 1,
      remainingQuantity: 1,
      saleStart: new Date().toISOString(),
      saleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    }),
  });

  if (!res.ok) throw new Error(`Failed to create test item: ${res.status}`);
  return res.json();
}

async function fireOrders(itemId: string, userIds: string[]) {
  const promises = userIds.map((userId) =>
    api('/orders', userId, {
      method: 'POST',
      body: JSON.stringify({
        inventoryItemId: itemId,
        idempotencyKey: `conc-${itemId}-${userId}-${Date.now()}`,
      }),
    }).then(async (res) => {
      const body = await res.json().catch(() => ({}));
      return { status: res.status, body };
    }),
  );

  return Promise.all(promises);
}

async function main() {
  let failures = 0;

  try {
    const users = await fetchUsers();
    const admin = users.find((u: { role: string }) => u.role === 'ADMIN');
    const regularUsers = users
      .filter((u: { role: string }) => u.role === 'USER')
      .slice(0, TOTAL_USERS);

    if (!admin) throw new Error('No admin user found');
    if (regularUsers.length < TOTAL_USERS) {
      throw new Error(`Need at least ${TOTAL_USERS} USER accounts`);
    }

    const item = await createTestItem(admin.id);
    const results = await fireOrders(
      item.id,
      regularUsers.map((u: { id: string }) => u.id),
    );

    const succeeded = results.filter((r) => r.status === 200);

    if (succeeded.length !== 1) {
      failures++;
    }

    const inventoryRes = await api(`/inventory/${item.id}`, admin.id);
    const inventory = await inventoryRes.json();

    if (inventory.remainingQuantity !== 0) {
      failures++;
    }

    const reportRes = await api(
      `/admin/reports/inventory/${item.id}`,
      admin.id,
    );
    const report = await reportRes.json();

    if (report.orders.total !== 1) {
      failures++;
    }

    if (failures > 0) {
      process.exit(1);
    }
  } catch {
    process.exit(1);
  }
}

main();
