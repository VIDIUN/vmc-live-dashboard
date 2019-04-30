import { Injectable } from '@angular/core';
import * as _ from "lodash";


@Injectable()
export class VidiunAPIConfig {

    private
    get vmcConfig():any {
        return _.get(window.parent,'vmc',null);
    }
    //noinspection TypeScriptUnresolvedVariable
    get vs():string {
        if (this.vmcConfig) {
            return this.vmcConfig.vars.vs;
        }
        return "djJ8MTgwMjM4MXzsPCZ1oaxPuBvErQZ6viTHqbchAhjjvJuvLYPStbsDWy40DkVQFG5nBILCpfJ3bI52xwR0-WbsrP0ryHr4WucXcp1JvbEcF_rQ5hy0uebgoyFIreIFA8D0Pg1PbyLMHtw="
    }

    get apiUrl():string {
        let baseUrl : string;
        if (this.vmcConfig) {
            baseUrl=this.vmcConfig.vars.api_url;
        } else {
            baseUrl = "https://www.vidiun.com";
        }
        return baseUrl + "/api_v3/index.php";
    }
    apiVersion : string;

    clientTag = 'vidiun/vidiun-api_v1';
    headers = {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
    };
    format = 1;

}
