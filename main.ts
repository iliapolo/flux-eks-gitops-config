// import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { Construct } from 'constructs';
import { BaseHelmApp, BaseHelmAppProps, initBaseFluxHelmAppProps } from './apps/base/base-app/base-app';
import { BaseAppNS as BaseNSApp, BaseAppNSProps } from './apps/base/base-app/base-app-ns';

export class PodinfoChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    var nsProps: BaseAppNSProps = {
      componentName: "component"
    }

    const ns = new BaseNSApp(this, nsProps);
    var fluxAppProps: BaseHelmAppProps = initBaseFluxHelmAppProps({ componentName: ns.name })
    new BaseHelmApp(this, fluxAppProps
    );

  }
}
const app = new App();
new PodinfoChart(app, 'hello');
// new chartPodinfoProd
// new chartPodinfoTes

app.synth();
