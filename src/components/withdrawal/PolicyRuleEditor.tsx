import React, { useState } from 'react';
import { Currency } from "@/types/withdrawal";
import { PolicyRule, PolicyCondition, PolicyAction } from "@/utils/policyEngine";

interface PolicyRuleEditorProps {
  rule?: PolicyRule;
  onSave: (rule: Omit<PolicyRule, 'id' | 'createdAt' | 'lastModified'>) => void;
  onCancel: () => void;
}

export function PolicyRuleEditor({ rule, onSave, onCancel }: PolicyRuleEditorProps) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    enabled: rule?.enabled ?? true,
    priority: rule?.priority || 100,
    conditions: rule?.conditions || [],
    actions: rule?.actions || [],
    createdBy: rule?.createdBy || 'admin',
    modifiedBy: 'admin'
  });

  const [newCondition, setNewCondition] = useState<PolicyCondition>({
    type: 'amount',
    operator: 'greater_than',
    value: ''
  });

  const [newAction, setNewAction] = useState<PolicyAction>({
    type: 'require_approvers',
    parameters: {}
  });

  const conditionTypes = [
    { value: 'amount', label: '거래 금액' },
    { value: 'currency', label: '통화' },
    { value: 'transaction_type', label: '거래 유형' },
    { value: 'time', label: '시간' },
    { value: 'user_role', label: '사용자 역할' },
    { value: 'custom', label: '커스텀' }
  ];

  const operators = [
    { value: 'equals', label: '같음' },
    { value: 'greater_than', label: '초과' },
    { value: 'less_than', label: '미만' },
    { value: 'in', label: '포함됨' },
    { value: 'not_in', label: '포함되지 않음' },
    { value: 'contains', label: '포함' }
  ];

  const actionTypes = [
    { value: 'require_approvers', label: '결재자 필수 지정' },
    { value: 'add_approvers', label: '결재자 추가' },
    { value: 'set_priority', label: '우선순위 설정' },
    { value: 'send_notification', label: '알림 발송' },
    { value: 'block_transaction', label: '거래 차단' }
  ];

  const currencies: Currency[] = ['KRW', 'KRW'];
  const approvers = ['박CFO', '이CISO', '김CTO', '정법무이사', '최CEO', '한비즈데브이사'];

  const handleAddCondition = () => {
    if (newCondition.type && newCondition.operator && newCondition.value) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition]
      }));
      setNewCondition({
        type: 'amount',
        operator: 'greater_than',
        value: ''
      });
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleAddAction = () => {
    if (newAction.type) {
      setFormData(prev => ({
        ...prev,
        actions: [...prev.actions, newAction]
      }));
      setNewAction({
        type: 'require_approvers',
        parameters: {}
      });
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderConditionValue = (condition: PolicyCondition, index: number) => {
    const updateCondition = (value: any) => {
      const updated = [...formData.conditions];
      updated[index] = { ...updated[index], value };
      setFormData(prev => ({ ...prev, conditions: updated }));
    };

    switch (condition.type) {
      case 'amount':
        return (
          <input
            type="number"
            value={condition.value}
            onChange={(e) => updateCondition(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
            placeholder="금액 입력"
          />
        );
      case 'currency':
        return (
          <select
            value={condition.value}
            onChange={(e) => updateCondition(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">통화 선택</option>
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        );
      case 'transaction_type':
        return (
          <select
            value={condition.value}
            onChange={(e) => updateCondition(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">거래 유형 선택</option>
            <option value="cross_border">국경간 거래</option>
            <option value="institutional">기관 거래</option>
            <option value="emergency">긴급 거래</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={condition.value}
            onChange={(e) => updateCondition(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
            placeholder="값 입력"
          />
        );
    }
  };

  const renderActionParameters = (action: PolicyAction, index: number) => {
    const updateAction = (parameters: any) => {
      const updated = [...formData.actions];
      updated[index] = { ...updated[index], parameters };
      setFormData(prev => ({ ...prev, actions: updated }));
    };

    switch (action.type) {
      case 'require_approvers':
      case 'add_approvers':
        return (
          <div className="space-y-2">
            <label className="text-xs text-gray-600">결재자 선택:</label>
            <div className="flex flex-wrap gap-2">
              {approvers.map(approver => (
                <label key={approver} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={action.parameters.approvers?.includes(approver) || false}
                    onChange={(e) => {
                      const current = action.parameters.approvers || [];
                      const updated = e.target.checked 
                        ? [...current, approver]
                        : current.filter((a: string) => a !== approver);
                      updateAction({ ...action.parameters, approvers: updated });
                    }}
                    className="text-xs"
                  />
                  <span className="text-xs">{approver}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'set_priority':
        return (
          <select
            value={action.parameters.priority || ''}
            onChange={(e) => updateAction({ ...action.parameters, priority: e.target.value })}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">우선순위 선택</option>
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
            <option value="critical">긴급</option>
          </select>
        );
      case 'send_notification':
        return (
          <input
            type="text"
            value={action.parameters.message || ''}
            onChange={(e) => updateAction({ ...action.parameters, message: e.target.value })}
            className="px-2 py-1 border rounded text-sm w-full"
            placeholder="알림 메시지 입력"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {rule ? '정책 규칙 수정' : '새 정책 규칙 생성'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              규칙 이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              우선순위
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="1000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={formData.enabled}
            onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
            규칙 활성화
          </label>
        </div>

        {/* 조건 설정 */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">조건 설정</h4>
          
          {/* 기존 조건 목록 */}
          {formData.conditions.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.conditions.map((condition, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    {conditionTypes.find(t => t.value === condition.type)?.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {operators.find(o => o.value === condition.operator)?.label}
                  </span>
                  {renderConditionValue(condition, index)}
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    제거
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 새 조건 추가 */}
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <select
              value={newCondition.type}
              onChange={(e) => setNewCondition(prev => ({ ...prev, type: e.target.value as any }))}
              className="px-2 py-1 border rounded text-sm"
            >
              {conditionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={newCondition.operator}
              onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.target.value as any }))}
              className="px-2 py-1 border rounded text-sm"
            >
              {operators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            
            <input
              type="text"
              value={newCondition.value}
              onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
              className="px-2 py-1 border rounded text-sm flex-1"
              placeholder="값 입력"
            />
            
            <button
              type="button"
              onClick={handleAddCondition}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>

        {/* 액션 설정 */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">액션 설정</h4>
          
          {/* 기존 액션 목록 */}
          {formData.actions.length > 0 && (
            <div className="space-y-3 mb-4">
              {formData.actions.map((action, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {actionTypes.find(t => t.value === action.type)?.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      제거
                    </button>
                  </div>
                  {renderActionParameters(action, index)}
                </div>
              ))}
            </div>
          )}

          {/* 새 액션 추가 */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <select
                value={newAction.type}
                onChange={(e) => setNewAction(prev => ({ ...prev, type: e.target.value as any, parameters: {} }))}
                className="px-2 py-1 border rounded text-sm"
              >
                {actionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={handleAddAction}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                액션 추가
              </button>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {rule ? '수정' : '생성'}
          </button>
        </div>
      </form>
    </div>
  );
}