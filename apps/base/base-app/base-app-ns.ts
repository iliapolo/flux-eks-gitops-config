import { Construct } from "constructs";
import { KubeNamespace, KubeNamespaceProps } from "../../../imports/k8s";

export interface BaseAppNSProps {
    /**
     * The name of the component withing the architecture.
     * (see https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/)
     *
     * @default "component"
     */
    readonly componentName: string;
}

export class BaseAppNS extends Construct {

    public readonly name;
    constructor(scope: Construct, props: BaseAppNSProps) {
        super(scope, "AppNS" + props.componentName);
        var nsProps: KubeNamespaceProps = {
            metadata: {
                name: props.componentName,
                labels: {
                    "app.kubernetes.io/component": props.componentName,
                },
            },
        };

        const ns = new KubeNamespace(this, props.componentName + "Namespace", nsProps
        );
        this.name = ns.name
    }
}