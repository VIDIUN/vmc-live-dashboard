import { Injectable,ReflectiveInjector } from '@angular/core';
import { Http, URLSearchParams, Headers } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import {VidiunMultiRequest} from "./vidiun-multi-request";
import {VidiunRequest} from "./vidiun-request";
import {VidiunAPIConfig} from "./vidiun-api-config";


@Injectable()
export class VidiunAPIClient {

    constructor(private http:Http, public config:VidiunAPIConfig) {
        if (!config) {
            throw new Error("missing configuration argument");
        }
    }


    transmit(args : {parameters : any, vsValue : {assignAutomatically : boolean}}):Observable<any> {

        // We use the actual args parameters to optimize performance, it should affect the api since the arguments are created inside the library elements.

        if (args.parameters) {

            args.parameters['clientTag']  = this.config.clientTag;
            args.parameters['format'] = this.config.format;
            args.parameters['apiVersion'] = this.config.apiVersion;

            if (args.vsValue && args.vsValue.assignAutomatically) {
                if (this.config.vs) {
                    args.parameters['vs'] = this.config.vs;
                } else {
                    return Observable.throw({errorCode: 'cannot_invoke_request_without_vs'});
                }
            }

            return this.http.request(this.config.apiUrl,
                {
                    method: 'post',
                    body: JSON.stringify(args.parameters),
                    headers : new Headers(this.config.headers)
                }
            )
            .map(result => result.json());

        }else {
            return Observable.throw({ errorCode : 'missing_request_parameters'});
        }
    }
}
