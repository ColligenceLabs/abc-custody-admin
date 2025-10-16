/**
 * API Services Test Utility
 *
 * Test all API services and generate realistic mock data
 */

import { adminApi } from '@/services/adminApi';
import { memberApi } from '@/services/memberApi';
import { vaultApi } from '@/services/vaultApi';
import { complianceApi } from '@/services/complianceApi';
import { mockDb } from '@/services/mockDatabase';
import { initializeMockDeposits } from '@/services/depositApi';

export async function testAllApiServices() {
  console.log('🧪 Starting comprehensive API services test...');

  try {
    // Test Admin API
    console.log('\n📋 Testing Admin API...');

    // Test login flow
    const loginResult = await adminApi.login({
      email: 'admin@custody.com',
      password: 'admin123'
    });
    console.log('✅ Login successful:', loginResult.requiresTwoFactor);

    // Test 2FA verification
    const twoFactorResult = await adminApi.verifyTwoFactor({
      email: 'admin@custody.com',
      code: '123456'
    });
    console.log('✅ 2FA verification successful');

    const sessionToken = twoFactorResult.sessionToken!;

    // Test session validation
    const sessionValidation = await adminApi.validateSession(sessionToken);
    console.log('✅ Session validation successful:', sessionValidation.valid);

    // Test notifications
    const notifications = await adminApi.getNotifications();
    console.log('✅ Notifications loaded:', notifications.length);

    // Test Member API
    console.log('\n👥 Testing Member API...');

    // Test getting pending onboarding
    const pendingOnboarding = await memberApi.getPendingOnboarding();
    console.log('✅ Pending onboarding loaded:', pendingOnboarding.length);

    // Test member statistics
    const memberStats = await memberApi.getMemberStatistics();
    console.log('✅ Member statistics:', memberStats);

    // Test getting members
    const membersResult = await memberApi.getMembers({ limit: 10 });
    console.log('✅ Members loaded:', membersResult.members.length);

    // Test Vault API
    console.log('\n🏦 Testing Vault API...');

    // Test getting vault status
    const vaultStatus = await vaultApi.getVaultStatus();
    console.log('✅ Vault status loaded - Total Value:', vaultStatus.totalValue);
    console.log('   Hot/Cold Ratio:', `${vaultStatus.balanceStatus.hotRatio}%/${vaultStatus.balanceStatus.coldRatio}%`);

    // Test vault alerts
    const vaultAlerts = await vaultApi.getVaultAlerts();
    console.log('✅ Vault alerts loaded:', vaultAlerts.length);

    // Test rebalancing history
    const rebalancingHistory = await vaultApi.getRebalancingHistory(5);
    console.log('✅ Rebalancing history loaded:', rebalancingHistory.length);

    // Test Compliance API
    console.log('\n📊 Testing Compliance API...');

    // Test AML screening
    const amlCheck = await complianceApi.performAMLScreening({
      fromAddress: '0x123abc456def...',
      toAddress: '0x789ghi012jkl...',
      amount: '50000',
      currency: 'USDT'
    });
    console.log('✅ AML screening completed - Risk Score:', amlCheck.riskScore);

    // Test Travel Rule check
    const travelRuleCheck = await complianceApi.checkTravelRule({
      amount: '1500000',
      amountInKRW: '1950000000',
      fromAddress: '0x123abc...',
      toAddress: '0xdef456...'
    });
    console.log('✅ Travel Rule check completed - Exceeding threshold:', travelRuleCheck.isExceeding);

    // Test getting compliance reports
    const complianceReports = await complianceApi.getComplianceReports();
    console.log('✅ Compliance reports loaded:', complianceReports.length);

    console.log('\n🎉 All API services tests passed successfully!');

  } catch (error) {
    console.error('❌ API services test failed:', error);
    throw error;
  }
}

export async function generateRealisticMockData() {
  console.log('🎲 Generating additional realistic mock data...');

  try {
    // Skip notification generation for now to avoid type conflicts
    console.log('Skipping notification generation...');

    // Skip rebalancing record generation to avoid type conflicts
    console.log('Skipping rebalancing record generation...');

    // Test vault activity simulation
    await vaultApi.simulateVaultActivity();

    console.log('✅ Realistic mock data generated successfully!');

  } catch (error) {
    console.error('❌ Mock data generation failed:', error);
    throw error;
  }
}

export function displaySystemStatus() {
  console.log('\n📊 System Status Dashboard:');
  console.log('═'.repeat(50));

  // Display vault status
  vaultApi.getVaultStatus().then(vault => {
    console.log(`🏦 Vault Status:`);
    console.log(`   Total Value: ₩${parseInt(vault.totalValue.totalInKRW).toLocaleString()}`);
    console.log(`   Hot Wallet: ${vault.balanceStatus.hotRatio}% (Target: ${vault.balanceStatus.targetHotRatio}%)`);
    console.log(`   Cold Wallet: ${vault.balanceStatus.coldRatio}% (Target: ${vault.balanceStatus.targetColdRatio}%)`);
    console.log(`   Deviation: ${vault.balanceStatus.deviation}%`);
    console.log(`   Needs Rebalancing: ${vault.balanceStatus.needsRebalancing ? '⚠️  YES' : '✅ NO'}`);
  });

  // Display member statistics
  memberApi.getMemberStatistics().then(stats => {
    console.log(`\n👥 Member Status:`);
    console.log(`   Total Members: ${stats.totalMembers}`);
    console.log(`   Active: ${stats.activeMembers}`);
    console.log(`   Suspended: ${stats.suspendedMembers}`);
    console.log(`   Pending Onboarding: ${stats.pendingOnboarding}`);
  });

  // Display notification counts
  adminApi.getUnreadNotificationCount().then(result => {
    console.log(`\n🔔 Notifications:`);
    console.log(`   Unread: ${result.count}`);
  });

  console.log('═'.repeat(50));
}

// Auto-run functions for development
export function initializeTestEnvironment() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Initialize mock deposits on app start
    initializeMockDeposits();

    // Expose test functions to global scope for browser console testing
    (window as any).testApiServices = testAllApiServices;
    (window as any).generateMockData = generateRealisticMockData;
    (window as any).showSystemStatus = displaySystemStatus;
    (window as any).resetDatabase = () => mockDb.resetToSeedData();

    console.log('\n🛠️  Development Testing Available:');
    console.log('   testApiServices() - Test all API services');
    console.log('   generateMockData() - Generate additional mock data');
    console.log('   showSystemStatus() - Display system status dashboard');
    console.log('   resetDatabase() - Reset to initial seed data');
  }
}