import { Protocol } from "cdk8s-plus-22";
import { Construct } from "constructs";
// import { Canary } from "../../../imports/flagger.app";
import { HelmRelease, HelmReleaseSpecChartSpecSourceRefKind } from "../../../imports/helm.toolkit.fluxcd.io";
import { IntOrString, KubeNetworkPolicy, ServicePort } from "../../../imports/k8s";
// import { KubeNamespace, KubeNamespaceProps, NamespaceSpec } from "../../../imports/k8s";

export interface BaseHelmAppProps {

    /**
     * The name of the Helm chart that the application is being published to 
     *
     * @default "helmChart"
     */
    readonly applicationHelmChart: string;
    /**
     * The version of the helm chart to be deployed
     *
     * @default "helmRepo"
     */
    readonly applicationHelmChartVersion: string;
    /**
     * The name of the Helm repository that the application chart is being published to
     *
     * @default "helmRepo"
     */
    readonly applicationHelmRepo: string;
    /**
     * The time for flux to pull changes from the remote helm repository
     *
     * @default "5m"
     */
    readonly applicationFluxPullInterval: string;
    /**
     * The number of install retries for flux
     *
     * @default 3
     */
    readonly applicationFluxInstallRetries: number;
    /**
     * The name of the application to be deployed.
     * This will configure all relevant Kubernetes objects, such as: Deployment, ConfigMap, Service, etc...
     *
     * @default "app"
     */
    readonly applicationName: string;

    /**
     * The name of the component withing the architecture.
     * (see https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/)
     *
     * @default "component"
     */
    readonly componentName: string;
    /**
     * List of application ports
     * (see https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/)
     *
     * @default [8080]
     */
    readonly applicationPort: ServicePort;
}

export class BaseHelmApp extends Construct {

    constructor(scope: Construct, props: BaseHelmAppProps) {
        super(scope, "FluxHelmApp" + props.applicationName);

        const appLabelsList = {
            "app.kubernetes.io/name": props.applicationName,
            "app.kubernetes.io/component": props.componentName,
        }
        const appMetadata = {
            name: props.applicationName,
            namespace: props.componentName,
            labels: appLabelsList,
        }

        new HelmRelease(this, "HelmRelease" + props.applicationName, {
            metadata: appMetadata,
            spec: {
                releaseName: props.applicationName,
                chart: {
                    spec: {
                        chart: props.applicationName,
                        version: props.applicationHelmChartVersion,
                        sourceRef: {
                            kind: HelmReleaseSpecChartSpecSourceRefKind.HELM_REPOSITORY,
                            name: props.applicationHelmRepo,
                            namespace: props.componentName,
                        }
                    },

                },
                interval: props.applicationFluxPullInterval,
                install: {
                    remediation: {
                        retries: props.applicationFluxInstallRetries
                    }
                }
            },
        })
        new KubeNetworkPolicy(this,
            KubeNetworkPolicy.name + props.applicationName,
            {
                metadata: appMetadata,
                spec: {
                    podSelector: {
                        matchExpressions: [
                            {
                                key: "app.kubernetes.io/name",
                                operator: "In",
                                values: [
                                    props.applicationName,
                                    props.applicationName + "-canary",
                                    props.applicationName + "-primary",
                                ],
                            }
                        ],
                    },
                    ingress: [{
                        ports: [
                            {
                                port: IntOrString.fromNumber(
                                    props.applicationPort.port
                                ),
                                protocol: Protocol.TCP,
                            }
                        ],
                        from: [{
                            podSelector: {
                                matchExpressions: [{
                                    key: "name",
                                    operator: "In",
                                    values: [
                                        "monitoring",
                                        "ingress-nginx",
                                        "flagger-system",
                                    ],
                                }]
                            },
                            namespaceSelector: {
                                matchExpressions: [{
                                    key: "name",
                                    operator: "In",
                                    values: [
                                        "monitoring",
                                        "ingress-nginx",
                                        "flagger-system",
                                    ],
                                }]
                            }
                        }],
                    }],
                    policyTypes: [],

                },

            })

    }

}


export function initBaseFluxHelmAppProps(options?: Partial<BaseHelmAppProps>): BaseHelmAppProps {

    const defaults = {
        applicationHelmChart: "helmChart",
        applicationHelmChartVersion: "helmRepo",
        applicationHelmRepo: "helmRepo",
        applicationFluxPullInterval: "5m",
        applicationFluxInstallRetries: 3,
        applicationName: "app",
        componentName: "component",
        applicationPort: {
            port: 8080,
            protocol: Protocol.TCP,
        },
    }
    return {
        ...defaults,
        ...options,
    };
}