import { App } from 'cdk8s';
import { BaseAppNS, BaseAppNSProps } from './base-app-ns';


const app = new App();
var nsProps: BaseAppNSProps = {
    componentName: "comp"
}
new BaseAppNS(app, nsProps);
app.synth();