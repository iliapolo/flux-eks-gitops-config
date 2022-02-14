import { Construct } from 'constructs';
import * as flagger from '../../../imports/flagger.app';
import * as coreos from '../../../imports/monitoring.coreos.com';

export interface CanaryProps {
  readonly interval: number;
}

export class Canary extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new flagger.Canary(this, 'Canary', {
      metadata: {
        name: 'podinfo-canary',
        namespace: 'podinfo'
      },
      spec: {
        provider: 'nginx',
        service: { port: 80, targetPort: 9898 },
        targetRef: { apiVersion: 'apps/v1', kind: flagger.CanarySpecTargetRefKind.DEPLOYMENT, name: 'podinfo' },
        ingressRef: { apiVersion: 'networking.k8s.io/v1', kind: flagger.CanarySpecIngressRefKind.INGRESS, name: 'podinfo' },
        autoscalerRef: { apiVersion: 'autoscaling/v2beta2', kind: flagger.CanarySpecAutoscalerRefKind.HORIZONTAL_POD_AUTOSCALER, name: 'podinfo' },
        progressDeadlineSeconds: 60,
        analysis: {
          interval: '10s',
          threshold: 10,
          maxWeight: 50,
        }
      }
    });

    new coreos.ServiceMonitor(this, 'ServiceMonitor', {});
  }
}