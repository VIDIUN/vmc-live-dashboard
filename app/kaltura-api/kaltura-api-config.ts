import { Injectable } from '@angular/core';

@Injectable()
export class KalturaAPIConfig {
    ks : string = "djJ8MTgwMjM4MXyxrZt-jJdDm4lPrbqcRw9EkkW58t4O2i2J3hA8CDFk6-j0dtgvanzHd27lKeuyJEe0WYZswYzkuvRvKq98TxXc6zz7wFt6z_D5Gls4K43urat_XnxjpNFCE8ixbmKevQizNff6wHsLkGLipIgpZrdc";
    apiUrl : string = "https://www.kaltura.com/api_v3/index.php";
    apiVersion : string;

    clientTag = 'kaltura/kaltura-api_v1';
    headers = {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
    };
    format = 1;

}