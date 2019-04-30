import { Observable } from 'rxjs/Observable'

import { URLSearchParams } from '@angular/http';

import { VidiunRequest } from "./vidiun-request";
import {VidiunAPIClient} from "./vidiun-api-client";

import * as R from 'ramda';
import {VidiunAPIException} from "./vidiun-api-exception";

export  class VidiunMultiRequest {

    private vidiunRequests : VidiunRequest<any>[];

    constructor(){
        this.vidiunRequests = [];
    }

    public addRequest(request : VidiunRequest<any>) : void{
        this.vidiunRequests.push(request);
    }

    public execute(client : VidiunAPIClient, ignoreAPIExceptions = false) : Observable<any>{

        if (this.vidiunRequests.length) {

            const vsValue = { assignAutomatically : true};

            const parameters : any = {
                'service' : 'multirequest'
            };

            var vsValueGeneratorIndex = R.findIndex(R.propEq('vsValueGenerator',true))(this.vidiunRequests);

            if (vsValueGeneratorIndex > -1)
            {
                vsValue.assignAutomatically = false;
            }

            this.vidiunRequests.forEach((request,index) => {

                const requestIdentifier = index + 1;

                const requestParameters : any = Object.assign({
                    service : request.service,
                    action : request.action
                },request.parameters);

                if (vsValueGeneratorIndex > -1 && vsValueGeneratorIndex !== index){
                    requestParameters['vs'] = `{${vsValueGeneratorIndex+1}:result}`;
                }

                parameters[requestIdentifier] = requestParameters;
            });

            return client.transmit({ parameters,vsValue }).flatMap(responses =>
            {
                const errorResponses : any[] = [];
                const parsedResponses  = responses.map((response : any) =>
                {
                    if (VidiunAPIException.isMatch(response))
                    {
                        const errorResponse = VidiunAPIException.create(response);
                        errorResponses.push(errorResponse);
                        return errorResponse;
                    }

                    return response;
                });

                if (errorResponses.length > 0 && !ignoreAPIExceptions)
                {
                    return Observable.throw(errorResponses[0]);
                }else
                {
                    return Observable.of(parsedResponses);
                }
            });


        }else {
            return Observable.throw({errorCode : 'no_requests_provided'});
        }
    }
}