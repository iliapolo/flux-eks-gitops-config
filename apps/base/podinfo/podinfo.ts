import { Construct } from "constructs";
import { Canary } from "../../../imports/flagger.app";

export class PodInfo extends Construct {

  constructor() {
    super();
    const canary: Canary = new Canary();
  }

}