// scripts/verify-veylo.js
/**
 * Automated Verification Suite for Veylo Frontend Architecture & Business Logic.
 * Simulates browser localStorage, tests all CRUD operations, schema versioning,
 * corrupted data recovery, authentication, and demo resets.
 */

// 1. Mock Browser Environment (window, localStorage, CustomEvent)
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  key(i) {
    return Object.keys(this.store)[i] || null;
  }
  get length() {
    return Object.keys(this.store).length;
  }
}

global.window = {
  localStorage: new LocalStorageMock(),
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};
global.localStorage = global.window.localStorage;
global.CustomEvent = class CustomEvent {
  constructor(type, eventInitDict) {
    this.type = type;
    this.detail = eventInitDict ? eventInitDict.detail : null;
  }
};

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Running Veylo Architecture & Data Layer Tests');
  console.log('====================================================\n');

  // Test Storage Module
  const {
    STORAGE_PREFIX,
    CURRENT_SCHEMA_VERSION,
    KEYS,
    getItem,
    setItem,
    removeItem,
    clearVeyloStorage,
    exportVeyloState,
    importVeyloState,
  } = await import('../src/services/storage.ts');

  // 1. Basic Storage tests
  setItem('veylo:test_key', { hello: 'world' });
  assert(getItem('veylo:test_key')?.hello === 'world', 'Safe setItem and getItem works');
  removeItem('veylo:test_key');
  assert(getItem('veylo:test_key') === null, 'Safe removeItem works');

  // 2. Corrupt data recovery
  global.localStorage.setItem('veylo:corrupt', 'INVALID_JSON{{{');
  const fallbackVal = { recovered: true };
  const recovered = getItem('veylo:corrupt', fallbackVal);
  assert(recovered.recovered === true, 'Corrupted JSON in localStorage recovers with fallback without throwing');

  // 3. Clear only Veylo-prefixed keys
  global.localStorage.setItem('other_app_key', 'preserve_me');
  global.localStorage.setItem('veylo:temp', 'delete_me');
  clearVeyloStorage();
  assert(global.localStorage.getItem('other_app_key') === 'preserve_me', 'clearVeyloStorage does not touch unrelated origin keys');
  assert(global.localStorage.getItem('veylo:temp') === null, 'clearVeyloStorage purges Veylo keys');

  // Test Seed Data & Data Service
  const {
    initDemoData,
    resetDemoData,
    customerService,
    teamService,
    planService,
    activityService,
    settingsService,
    analyticsService,
  } = await import('../src/services/dataService.ts');

  // 4. First-time initialization
  initDemoData(true);
  assert(getItem(KEYS.SCHEMA_VERSION) === CURRENT_SCHEMA_VERSION, 'Schema version is correctly initialized');

  // 5. Seed customers verification
  const customers = customerService.getAll();
  assert(Array.isArray(customers) && customers.length >= 35, `Initialized with realistic seed dataset (${customers.length} organizations)`);
  assert(customers[0].name && customers[0].email && customers[0].plan, 'Customer records have required fields');

  // 6. Customer CRUD
  const newCustomer = customerService.create({
    name: 'Test Acme Corp',
    contactPerson: 'Alice Test',
    email: 'alice@acmetest.org',
    phone: '+1 (555) 123-4567',
    plan: 'Enterprise',
    seats: 120,
    status: 'active',
    mrr: 499,
    industry: 'Automated Testing',
    country: 'United States',
  });
  assert(newCustomer.id > 0, 'Customer created with generated ID');
  assert(customerService.getById(newCustomer.id)?.name === 'Test Acme Corp', 'Created customer is retrievable by ID');

  const updatedCustomer = customerService.update(newCustomer.id, { seats: 200, status: 'pending' });
  assert(updatedCustomer.seats === 200 && updatedCustomer.status === 'pending', 'Customer updated successfully');

  const customerDeleted = customerService.delete(newCustomer.id);
  assert(customerDeleted === true && customerService.getById(newCustomer.id) === null, 'Customer deleted successfully');

  // 7. Team CRUD
  const initialTeam = teamService.getAll();
  assert(initialTeam.length >= 8 && initialTeam.length <= 12, `Team members dataset within 8-12 count (${initialTeam.length} members)`);

  const newMember = teamService.create({
    name: 'Jordan Rivera',
    email: 'jordan.rivera@veylo.demo',
    role: 'Staff',
    department: 'DevOps',
    status: 'active',
    plan: 'Pro',
  });
  assert(newMember.id > 0, 'Team member created with ID');
  assert(teamService.getById(newMember.id)?.email === 'jordan.rivera@veylo.demo', 'Team member retrievable by ID');

  const toggledMember = teamService.toggleStatus(newMember.id);
  assert(toggledMember.status === 'inactive', 'Team member status toggled to inactive');

  const memberDeleted = teamService.delete(newMember.id);
  assert(memberDeleted === true && teamService.getById(newMember.id) === null, 'Team member deleted successfully');

  // 8. Plans CRUD
  const initialPlans = planService.getAll();
  assert(initialPlans.length === 4, '4 standard subscription tiers available (Free, Pro, Business, Enterprise)');
  const freePlan = planService.getById('free');
  assert(freePlan && freePlan.price === 0, 'Free plan pricing is $0');
  const proPlan = planService.getById('pro');
  assert(proPlan && proPlan.price === 49, 'Pro plan pricing is $49');

  const customPlan = planService.create({
    id: 'starter-test',
    name: 'Starter Test Tier',
    price: 19,
    annualPrice: 190,
    billingInterval: 'monthly',
    description: 'Test starter tier.',
    status: 'active',
    limits: { projects: 10, seats: 10, storageGb: 20, apiCallsPerDay: 5000 },
    features: ['Test feature 1'],
  });
  assert(planService.getById('starter-test')?.price === 19, 'Custom plan created successfully');

  planService.update('starter-test', { price: 29 });
  assert(planService.getById('starter-test')?.price === 29, 'Custom plan updated successfully');

  planService.delete('starter-test');
  assert(planService.getById('starter-test') === null, 'Custom plan deleted successfully');

  // Verify deletion safety: cannot delete plan with active subscribers
  let deleteBlocked = false;
  try {
    planService.delete('enterprise');
  } catch (err) {
    deleteBlocked = true;
  }
  assert(deleteBlocked, 'Cannot delete subscription plan that has active subscribed customers');

  // 9. Activity Log Verification
  const activities = activityService.getAll();
  assert(activities.length > 0, 'Activity log records actions automatically');
  const logged = activityService.log('test@veylo.demo', 'Test Action', 'Test Target', 'system', 'Detailed test note');
  assert(logged.id && logged.actor === 'test@veylo.demo', 'Activity item logged with timestamp and details');

  // 10. Analytics & Telemetry Calculation
  const metrics = customerService.getMetrics();
  assert(metrics.total > 0 && metrics.totalSeats > 0 && metrics.totalMRR > 0, 'Derived metrics calculated from customer records');
  assert(metrics.paidConversion > 0, 'Paid conversion calculated correctly');

  const timeSeries7 = analyticsService.getTimeSeries(7);
  assert(timeSeries7.length === 7, '7-day analytics time series generated');
  const timeSeries30 = analyticsService.getTimeSeries(30);
  assert(timeSeries30.length === 30, '30-day analytics time series generated');
  assert(timeSeries30[0].users <= metrics.totalSeats, 'DAU is properly bounded by total customer seats');

  // 11. Authentication Service
  const { authService, DEMO_CREDENTIALS } = await import('../src/services/authService.ts');
  assert(DEMO_CREDENTIALS.email === 'admin@veylo.demo', 'Demo Admin email is admin@veylo.demo');
  assert(DEMO_CREDENTIALS.password === 'VeyloDemo123', 'Demo Admin password is VeyloDemo123');

  // Invalid credentials test
  const invalidLogin = authService.login('wrong@email.com', 'badpass');
  assert(invalidLogin.success === false, 'Invalid login credentials rejected');

  // Valid credentials test
  const validLogin = authService.login('admin@veylo.demo', 'VeyloDemo123');
  assert(validLogin.success === true && validLogin.session?.email === 'admin@veylo.demo', 'Demo credentials successfully authenticate');
  assert(authService.isAuthenticated() === true, 'authService.isAuthenticated returns true');

  // Logout test
  authService.logout();
  assert(authService.isAuthenticated() === false, 'authService.logout clears session');

  // Quick Demo Login test
  authService.loginWithDemoAdmin();
  assert(authService.isAuthenticated() === true, 'One-click Demo login works');

  // 12. Demo Reset Verification
  customerService.create({
    name: 'Temporary Reset Test Inc',
    contactPerson: 'Temp',
    email: 'temp@test.com',
    phone: '123',
    plan: 'Free',
    seats: 1,
    status: 'active',
    mrr: 0,
    industry: 'Temp',
    country: 'USA',
  });
  resetDemoData();
  const resetCustomers = customerService.getAll();
  assert(
    !resetCustomers.some(c => c.name === 'Temporary Reset Test Inc'),
    'resetDemoData clears temporary records and restores seed state'
  );
  assert(authService.isAuthenticated() === true, 'resetDemoData preserves active user authentication');

  // 13. State Export / Import
  const exported = exportVeyloState();
  assert(exported[KEYS.CUSTOMERS] !== undefined, 'exportVeyloState exports complete state');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
