'use client';

import { useState, useCallback } from 'react';
import { StepSidebar } from '@/components/step-sidebar';
import { ApiLogPanel } from '@/components/api-log-panel';
import { TenantSwitcher } from '@/components/tenant-switcher';
import {
  WelcomeStep,
  ApiKeyStep,
  InitSdkStep,
  AssignmentStep,
  ExperimentUiStep,
  MarkOutcomeStep,
  ResultsStep,
  IsolationDemoStep,
} from '@/components/steps';
import type { DemoStep, ApiLogEntry, TenantContext, ExperimentAssignment, DemoState } from '@/lib/types';
import { DEMO_TENANTS, DEMO_EXPERIMENTS } from '@/lib/types';

function generateUserId() {
  return `user-${Math.random().toString(36).slice(2, 8)}`;
}

function generateLogId() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function DemoPage() {
  const [state, setState] = useState<DemoState>({
    currentStep: 'welcome',
    currentTenant: DEMO_TENANTS[0],
    tenants: DEMO_TENANTS,
    apiLogs: [],
    isInitialized: false,
    assignment: null,
    outcomeMarked: false,
    splitView: false,
    userId: generateUserId(),
  });

  const [completedSteps, setCompletedSteps] = useState<Set<DemoStep>>(new Set());

  const addApiLog = useCallback((
    method: 'GET' | 'POST',
    endpoint: string,
    status: number,
    duration: number,
    request?: object,
    response?: object
  ) => {
    const log: ApiLogEntry = {
      id: generateLogId(),
      timestamp: new Date(),
      method,
      endpoint,
      status,
      duration,
      request,
      response,
      tenant: state.currentTenant.id,
    };
    setState((prev) => ({
      ...prev,
      apiLogs: [...prev.apiLogs, log],
    }));
  }, [state.currentTenant.id]);

  const goToStep = (step: DemoStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const completeStepAndContinue = (currentStep: DemoStep, nextStep: DemoStep) => {
    setCompletedSteps((prev) => new Set([...Array.from(prev), currentStep]));
    setState((prev) => ({ ...prev, currentStep: nextStep }));
  };

  const handleInit = async () => {
    addApiLog(
      'POST',
      '/v1/init',
      200,
      145,
      { userId: state.userId, group: { schoolId: 'demo-school' } },
      { status: 'success', userId: state.userId }
    );
    setState((prev) => ({ ...prev, isInitialized: true }));
  };

  const handleGetAssignment = async () => {
    const tenantExperiments = DEMO_EXPERIMENTS[state.currentTenant.id] || [];
    const assignment = tenantExperiments[0] || null;

    addApiLog(
      'POST',
      '/v1/assign',
      200,
      89,
      { site: assignment?.site, target: assignment?.target },
      assignment
    );

    setState((prev) => ({ ...prev, assignment }));
  };

  const handleMarkOutcome = async () => {
    addApiLog(
      'POST',
      '/v1/mark',
      200,
      67,
      { site: state.assignment?.site, target: state.assignment?.target, condition: 'clicked' },
      { status: 'marked' }
    );

    addApiLog(
      'POST',
      '/v1/log',
      200,
      42,
      { metrics: { name: 'conversion', value: 1 } },
      { status: 'logged' }
    );

    setState((prev) => ({ ...prev, outcomeMarked: true }));
  };

  const handleTenantSwitch = (tenant: TenantContext) => {
    // Reset state for new tenant
    setState((prev) => ({
      ...prev,
      currentTenant: tenant,
      isInitialized: false,
      assignment: null,
      outcomeMarked: false,
      userId: generateUserId(),
      currentStep: 'get-key',
    }));
    setCompletedSteps(new Set<DemoStep>(['welcome']));
  };

  const toggleSplitView = () => {
    setState((prev) => ({ ...prev, splitView: !prev.splitView }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            onContinue={() => completeStepAndContinue('welcome', 'get-key')}
            tenantColor={state.currentTenant.color}
          />
        );

      case 'get-key':
        return (
          <ApiKeyStep
            tenant={state.currentTenant}
            onContinue={() => completeStepAndContinue('get-key', 'init-sdk')}
          />
        );

      case 'init-sdk':
        return (
          <InitSdkStep
            tenant={state.currentTenant}
            userId={state.userId}
            onInit={handleInit}
            onContinue={() => completeStepAndContinue('init-sdk', 'get-assignment')}
            isInitialized={state.isInitialized}
          />
        );

      case 'get-assignment':
        return (
          <AssignmentStep
            tenant={state.currentTenant}
            assignment={state.assignment}
            onGetAssignment={handleGetAssignment}
            onContinue={() => completeStepAndContinue('get-assignment', 'show-experiment')}
          />
        );

      case 'show-experiment':
        return (
          <ExperimentUiStep
            tenant={state.currentTenant}
            assignment={state.assignment}
            onContinue={() => completeStepAndContinue('show-experiment', 'mark-outcome')}
          />
        );

      case 'mark-outcome':
        return (
          <MarkOutcomeStep
            tenant={state.currentTenant}
            assignment={state.assignment}
            onMarkOutcome={handleMarkOutcome}
            onContinue={() => completeStepAndContinue('mark-outcome', 'view-results')}
            isMarked={state.outcomeMarked}
          />
        );

      case 'view-results':
        return (
          <ResultsStep
            tenant={state.currentTenant}
            assignment={state.assignment}
            onContinue={() => completeStepAndContinue('view-results', 'isolation-demo')}
          />
        );

      case 'isolation-demo':
        return (
          <IsolationDemoStep
            tenants={state.tenants}
            experiments={DEMO_EXPERIMENTS}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: state.currentTenant.color }}
          >
            K
          </div>
          <span className="font-semibold text-gray-900">Kiddom A/B Testing Demo</span>
        </div>

        <TenantSwitcher
          currentTenant={state.currentTenant}
          tenants={state.tenants}
          onSwitch={handleTenantSwitch}
          splitView={state.splitView}
          onToggleSplitView={toggleSplitView}
        />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <StepSidebar
          currentStep={state.currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
          apiCallCount={state.apiLogs.filter((l) => l.tenant === state.currentTenant.id).length}
          currentTenantColor={state.currentTenant.color}
        />

        {/* Step Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            {renderStep()}
          </div>

          {/* API Log */}
          <div className="h-48 border-t border-gray-200 bg-gray-900">
            <ApiLogPanel
              logs={state.apiLogs.filter((l) => l.tenant === state.currentTenant.id)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
