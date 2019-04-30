import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {VidiunAPIClient} from "./vidiun-api-client";
import {VidiunAPIException} from "./vidiun-api-exception";



export  class VidiunRequest<T> {

    public vsValueGenerator = false;

    constructor(public service : string, public action : string, public parameters : Object, options? : { vsValueGenerator? : boolean} ) {
        if (options && typeof options.vsValueGenerator === 'boolean')
        {
            this.vsValueGenerator = options.vsValueGenerator;
        }
    }

    execute(client : VidiunAPIClient) : Observable<any>{
        const vsValue = { assignAutomatically : !this.vsValueGenerator };
        const requestParameters = Object.assign({
            service : this.service,
            action : this.action
        },this.parameters);

        return client.transmit({ parameters : requestParameters, vsValue}).flatMap(response =>
        {
            if (VidiunAPIException.isMatch(response))
            {
                const errorResponse = VidiunAPIException.create(response);
                return Observable.throw(errorResponse);

            }

            return Observable.of(response);
        });
    }
}
