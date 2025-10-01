/**
 * 결재 정책 엔진
 * 동적으로 결재 정책을 관리하고 적용하는 시스템
 */

import { Currency } from "@/types/withdrawal";
import { ApprovalPolicy, TransactionTypePolicy } from "./approverAssignment";

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  createdAt: string;
  createdBy: string;
  lastModified: string;
  modifiedBy: string;
}

export interface PolicyCondition {
  type: "amount" | "currency" | "transaction_type" | "time" | "user_role" | "custom";
  operator: "equals" | "greater_than" | "less_than" | "in" | "not_in" | "contains";
  value: any;
  field?: string;
}

export interface PolicyAction {
  type: "require_approvers" | "add_approvers" | "set_priority" | "send_notification" | "block_transaction";
  parameters: Record<string, any>;
}

export interface PolicyEvaluationContext {
  amount: number;
  currency: Currency;
  transactionType?: string;
  initiator: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class PolicyEngine {
  private rules: PolicyRule[] = [];
  private defaultPolicies: ApprovalPolicy[];
  private transactionTypePolicies: TransactionTypePolicy[];

  constructor(
    defaultPolicies: ApprovalPolicy[], 
    transactionTypePolicies: TransactionTypePolicy[]
  ) {
    this.defaultPolicies = defaultPolicies;
    this.transactionTypePolicies = transactionTypePolicies;
    this.initializeDefaultRules();
  }

  /**
   * 기본 정책 규칙들을 초기화
   */
  private initializeDefaultRules() {
    // 금액별 기본 정책을 규칙으로 변환
    this.defaultPolicies.forEach((policy, index) => {
      const rule: PolicyRule = {
        id: `default-${policy.currency}-${index}`,
        name: `${policy.currency} ${policy.description}`,
        description: `${policy.currency} 거래에 대한 기본 결재 정책`,
        enabled: true,
        priority: 100 + index,
        conditions: [
          {
            type: "currency",
            operator: "equals",
            value: policy.currency
          },
          {
            type: "amount",
            operator: "greater_than",
            value: policy.minAmount
          },
          {
            type: "amount",
            operator: "less_than",
            value: policy.maxAmount
          }
        ],
        actions: [
          {
            type: "require_approvers",
            parameters: {
              approvers: policy.requiredApprovers
            }
          }
        ],
        createdAt: new Date().toISOString(),
        createdBy: "system",
        lastModified: new Date().toISOString(),
        modifiedBy: "system"
      };
      this.rules.push(rule);
    });

    // 거래 유형별 정책을 규칙으로 변환
    this.transactionTypePolicies.forEach((policy, index) => {
      const rule: PolicyRule = {
        id: `transaction-type-${policy.type}`,
        name: `${policy.type} 거래 추가 결재`,
        description: policy.description,
        enabled: true,
        priority: 200 + index,
        conditions: [
          {
            type: "transaction_type",
            operator: "equals",
            value: policy.type
          }
        ],
        actions: [
          {
            type: "add_approvers",
            parameters: {
              approvers: policy.additionalApprovers
            }
          }
        ],
        createdAt: new Date().toISOString(),
        createdBy: "system",
        lastModified: new Date().toISOString(),
        modifiedBy: "system"
      };
      this.rules.push(rule);
    });
  }

  /**
   * 새로운 정책 규칙 추가
   */
  addRule(rule: Omit<PolicyRule, 'id' | 'createdAt' | 'lastModified'>): string {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRule: PolicyRule = {
      ...rule,
      id,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.rules.push(newRule);
    this.sortRulesByPriority();
    
    return id;
  }

  /**
   * 정책 규칙 수정
   */
  updateRule(id: string, updates: Partial<PolicyRule>): boolean {
    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) return false;

    this.rules[ruleIndex] = {
      ...this.rules[ruleIndex],
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    this.sortRulesByPriority();
    return true;
  }

  /**
   * 정책 규칙 삭제
   */
  removeRule(id: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.id !== id);
    return this.rules.length < initialLength;
  }

  /**
   * 정책 규칙 활성화/비활성화
   */
  toggleRule(id: string, enabled: boolean): boolean {
    return this.updateRule(id, { enabled });
  }

  /**
   * 우선순위별로 규칙 정렬
   */
  private sortRulesByPriority() {
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 조건 평가
   */
  private evaluateCondition(condition: PolicyCondition, context: PolicyEvaluationContext): boolean {
    const { type, operator, value } = condition;
    
    let contextValue: any;
    switch (type) {
      case "amount":
        contextValue = context.amount;
        break;
      case "currency":
        contextValue = context.currency;
        break;
      case "transaction_type":
        contextValue = context.transactionType;
        break;
      case "time":
        contextValue = new Date(context.timestamp);
        break;
      case "user_role":
        contextValue = context.initiator;
        break;
      case "custom":
        contextValue = condition.field ? context.metadata?.[condition.field] : null;
        break;
      default:
        return false;
    }

    switch (operator) {
      case "equals":
        return contextValue === value;
      case "greater_than":
        return contextValue > value;
      case "less_than":
        return contextValue < value;
      case "in":
        return Array.isArray(value) && value.includes(contextValue);
      case "not_in":
        return Array.isArray(value) && !value.includes(contextValue);
      case "contains":
        return typeof contextValue === 'string' && contextValue.includes(value);
      default:
        return false;
    }
  }

  /**
   * 정책 규칙 평가
   */
  private evaluateRule(rule: PolicyRule, context: PolicyEvaluationContext): boolean {
    if (!rule.enabled) return false;
    
    return rule.conditions.every(condition => 
      this.evaluateCondition(condition, context)
    );
  }

  /**
   * 정책 평가 및 결재자 결정
   */
  evaluatePolicy(context: PolicyEvaluationContext): {
    requiredApprovers: string[];
    appliedRules: PolicyRule[];
    priority?: string;
    notifications?: string[];
    blocked: boolean;
  } {
    const matchedRules = this.rules.filter(rule => 
      this.evaluateRule(rule, context)
    );

    let requiredApprovers: string[] = [];
    let priority: string | undefined;
    let notifications: string[] = [];
    let blocked = false;

    for (const rule of matchedRules) {
      for (const action of rule.actions) {
        switch (action.type) {
          case "require_approvers":
            requiredApprovers = action.parameters.approvers || [];
            break;
          case "add_approvers":
            const additionalApprovers = action.parameters.approvers || [];
            additionalApprovers.forEach((approver: string) => {
              if (!requiredApprovers.includes(approver)) {
                requiredApprovers.push(approver);
              }
            });
            break;
          case "set_priority":
            priority = action.parameters.priority;
            break;
          case "send_notification":
            notifications.push(action.parameters.message);
            break;
          case "block_transaction":
            blocked = true;
            break;
        }
      }
    }

    return {
      requiredApprovers,
      appliedRules: matchedRules,
      priority,
      notifications,
      blocked
    };
  }

  /**
   * 모든 규칙 조회
   */
  getRules(): PolicyRule[] {
    return [...this.rules];
  }

  /**
   * 특정 규칙 조회
   */
  getRule(id: string): PolicyRule | null {
    return this.rules.find(rule => rule.id === id) || null;
  }

  /**
   * 활성화된 규칙만 조회
   */
  getEnabledRules(): PolicyRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  /**
   * 정책 시뮬레이션
   */
  simulatePolicy(context: PolicyEvaluationContext): {
    result: ReturnType<PolicyEngine['evaluatePolicy']>;
    explanation: string[];
  } {
    const result = this.evaluatePolicy(context);
    const explanation: string[] = [];

    explanation.push(`거래 정보: ${context.amount} ${context.currency}`);
    if (context.transactionType) {
      explanation.push(`거래 유형: ${context.transactionType}`);
    }
    
    explanation.push(`매칭된 규칙 ${result.appliedRules.length}개:`);
    result.appliedRules.forEach(rule => {
      explanation.push(`- ${rule.name}: ${rule.description}`);
    });

    explanation.push(`최종 결재자: ${result.requiredApprovers.length}명`);
    result.requiredApprovers.forEach((approver, index) => {
      explanation.push(`  ${index + 1}. ${approver}`);
    });

    if (result.blocked) {
      explanation.push(`⚠️ 거래가 정책에 의해 차단되었습니다.`);
    }

    return { result, explanation };
  }

  /**
   * 정책 엔진 상태 내보내기
   */
  export(): {
    rules: PolicyRule[];
    exportedAt: string;
    version: string;
  } {
    return {
      rules: this.rules,
      exportedAt: new Date().toISOString(),
      version: "1.0.0"
    };
  }

  /**
   * 정책 엔진 상태 가져오기
   */
  import(data: { rules: PolicyRule[] }): boolean {
    try {
      this.rules = [...data.rules];
      this.sortRulesByPriority();
      return true;
    } catch (error) {
      console.error('Policy import failed:', error);
      return false;
    }
  }
}