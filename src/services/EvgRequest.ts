/*

Copyright 2022, Equinox Open Library Initiative
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public 
License along with this program; if not, write to the Free 
Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
Boston, MA 02110-1301 USA
*/

// declare globals taken from opensrf.js and friends
// to keep the TypeScript compiler happy
declare global {
    var OpenSRF: any;
    var OSRF_HTTP_TRANSLATOR: any;
    var OSRF_TRANSPORT_TYPE_XHR: any;
}
export class EvgRequest {
    service: string;
    method: string;
    params: any[];
    session?: any;
    static baseUrl = '';

    constructor(service: string, method: string, params: any[]) {
        this.service = service;
        this.method = method;
        this.params = params;
        this.session = new OpenSRF.ClientSession(service);
    }

    static setBaseUrl(url: string) {
        this.baseUrl = url;
    }

    send(): Promise<any> {
        OpenSRF.Session.transport = OSRF_TRANSPORT_TYPE_XHR;
        OSRF_HTTP_TRANSLATOR = EvgRequest.baseUrl + 'osrf-http-translator';

        const responses: any[] = [];
        return new Promise((resolve, reject) => {
            this.session.request({
                async: true,
                method: this.method,
                params: this.params,
                onresponse: (r: any) => {
                    // just slurping up any streamed responses
                    responses.push(r.recv().content());
                },
                oncomplete: () => {
                    return resolve(responses)
                },
                onerror: (err: any) => {
                    return reject(err);
                },
                onmethoderror: (err: any) => {
                    return reject(err);
                }
            }).send();
        });
    }
}
