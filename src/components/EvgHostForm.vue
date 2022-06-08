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

<script setup lang="ts">
import { ref } from 'vue';
import { EvgRequest } from '../services/EvgRequest';

const OPENSRF_JS_PATH = 'js/dojo/opensrf/opensrf.js';

const evgHost = ref('');
const connectionOK = ref(false);
const evgVersion = ref('');
const selectedService = ref('open-ils.actor');
const searchFilter = ref('');
const numResults = ref(0);
const methods = ref(new Array<any>());

let _baseUrl = '';

function checkConnection(): void {
    _baseUrl = evgHost.value;
    if (!_baseUrl.match(/^https*:\/\//)) {
        _baseUrl = 'https://' + _baseUrl;
    }
    if (!_baseUrl.match(/\/$/)) {
        _baseUrl += '/';
    }
    fetch(_baseUrl + OPENSRF_JS_PATH).then(async reponse => {
        connectionOK.value = true;
        EvgRequest.setBaseUrl(_baseUrl);
        const req = new EvgRequest('open-ils.actor', 'opensrf.open-ils.system.ils_version', []);
        req.send().then(resp => evgVersion.value = resp[0]);
    })
        .catch(error => {
            connectionOK.value = false;
        });

}

function fetchApiInfo() {
    const req = new EvgRequest(selectedService.value, 'opensrf.system.method', [searchFilter.value]);
    req.send().then(resp => {
        numResults.value = resp.length;
        const mungedInfo: any[] = [];
        resp.forEach((element: any) => {
            if ("__p" in element) {
                // we're a Perl method
                mungedInfo.push(element.__p);
            } else {
                // we're a C method
                mungedInfo.push(element);
            }
        });
        mungedInfo.forEach((element: any) => {
            // make a valid ID for DOM purposes
            element._domId = element.api_name.replace(/[.-]/g, '_');
        });
        methods.value = mungedInfo;
    });
}

function isArray(val: any): boolean {
    return Array.isArray(val);
}
</script>

<template>
    <nav class="navbar navbar-dark sticky-top" style="background-color: #007a54">
        <div class="container-md">
            <a class="navbar-brand">Evergreen API Explorer</a>
            <form class="d-flex">
                <input v-model="evgHost" placeholder="Evergreen host" aria-label="Evergreen host"
                    class="form-control me-1">
                <button @click="checkConnection" class="btn btn-sm btn-primary" type="button">Connect to
                    Evergreen</button>
            </form>
            <form class="d-flex">
                <select v-model="selectedService" class="form-control me-1" aria-label="Evergreen service"
                    :disabled="!connectionOK">
                    <option value="open-ils.acq">open-ils.acq</option>
                    <option value="open-ils.actor">open-ils.actor</option>
                    <option value="open-ils.auth">open-ils.auth</option>
                    <option value="open-ils.auth_proxy">open-ils.auth_proxy</option>
                    <option value="open-ils.booking">open-ils.booking</option>
                    <option value="open-ils.cat">open-ils.cat</option>
                    <option value="open-ils.circ">open-ils.circ</option>
                    <option value="open-ils.collections">open-ils.collections</option>
                    <option value="open-ils.courses">open-ils.courses</option>
                    <option value="open-ils.curbside">open-ils.curbside</option>
                    <option value="open-ils.ebook_api">open-ils.ebook_api</option>
                    <option value="open-ils.fielder">open-ils.fielder</option>
                    <option value="open-ils.pcrud">open-ils.pcrud</option>
                    <option value="open-ils.reporter">open-ils.reporter</option>
                    <option value="open-ils.search">open-ils.search</option>
                    <option value="open-ils.serial">open-ils.serial</option>
                    <option value="open-ils.supercat">open-ils.supercat</option>
                    <option value="open-ils.url_verify">open-ils.url_verify</option>
                    <option value="open-ils.vandelay">open-ils.vandelay</option>
                    <option value="opensrf.math">opensrf.math</option>
                </select>
                <input v-model="searchFilter" class="form-control me-1" placeholder="Method filter"
                    aria-label="Method filter" :disabled="!connectionOK">
                <button @click="fetchApiInfo" class="btn btn-sm btn-info" :disabled="!connectionOK" type="button">Fetch
                    API
                    information</button>
            </form>
        </div>
    </nav>

    <div v-if="numResults > 0" class="container">
        <div class="accordion accordion-flush" id="methodAccordion">
            <div class="accordion-item" v-for="(method, index) in methods" :key="method.api_name">
                <h2 class="accordion-header" :id="method._domId">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                        :aria-expanded="index === 0" :data-bs-target="'#collapse' + method._domId"
                        :aria-controls="'collapse' + method._domId">
                        {{ method.api_name }}
                    </button>
                </h2>
                <div :id="'collapse' + method._domId" class="accordion-collapse collapse"
                    :class="{ 'show': index === 0 }" :aria-labelledby="method._domId" data-bs-parent="#methodAccordion">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title">API name: {{ method.api_name }}</h3>
                            <ul class="list-group list-group-flush">
                                <li v-if="method.package" class="list-group-item">Found in Perl package {{
                                        method.package
                                }}</li>
                                <li v-if="method.method" class="list-group-item">Implemented in routine {{ method.method
                                }}</li>
                                <li v-if="method.notes" class="list-group-item">Notes: {{ method.notes }}</li>
                                <li v-if="method.NOTES" class="list-group-item">Notes: {{ method.NOTES }}</li>
                                <li v-if="method.stream" class="list-group-item">API streams its responses</li>
                                <li v-if="method.signature" class="list-group-item">
                                    Description: {{ method.signature.desc }}<br>
                                    <span v-if="method.signature.params">
                                        Parameters
                                        <span
                                            v-if="isArray(method.signature.params) && method.signature.params.length > 0">
                                            <ol>
                                                <li v-for="param in method.signature.params">
                                                    {{ param.name }} <span v-if="param.desc">{{ param.desc }}</span>
                                                </li>
                                            </ol>
                                        </span>
                                        <span v-if="!isArray(method.signature.params)">
                                            <pre>{{ method.signature.params }}</pre>
                                        </span>
                                    </span>
                                    <span v-if="method.signature.return && method.signature.return.desc">
                                        Return value: {{ method.signature.return.desc }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
</style>