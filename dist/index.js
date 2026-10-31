"use strict";
/**
 * Copyright 2024-2026 Paul Reeve <preeve@pdjr.eu>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signalk_libpluginstatus_1 = require("signalk-libpluginstatus");
const signalk_libdelta_1 = require("signalk-libdelta");
const DEFAULT_ENUMERATION_OPTIONS = { undefinedValue: "Not available" };
const PLUGIN_ID = 'maintain-enums';
const PLUGIN_NAME = 'maintain-enums';
const PLUGIN_DESCRIPTION = 'Create and maintain paths containing enumerated values.';
const schema_json_1 = __importDefault(require("./schema.json"));
const uischema_json_1 = __importDefault(require("./uischema.json"));
const Enumeration_1 = require("./Enumeration");
module.exports = function (app) {
    var unsubscribes = [];
    var pluginConfiguration;
    var pluginStatus;
    const plugin = {
        id: PLUGIN_ID,
        name: PLUGIN_NAME,
        description: PLUGIN_DESCRIPTION,
        schema: schema_json_1.default,
        uiSchema: uischema_json_1.default,
        start: function (options) {
            var delta = new signalk_libdelta_1.Delta(app, plugin.id);
            pluginStatus = new signalk_libpluginstatus_1.PluginStatus(app, `started`);
            try {
                pluginConfiguration = makePluginConfiguration(options, DEFAULT_ENUMERATION_OPTIONS);
                if (pluginConfiguration.enumerations.length > 0) {
                    unsubscribes = pluginConfiguration.enumerations.map((enumeration) => (app.streambundle.getSelfStream(enumeration.source)
                        .skipDuplicates()
                        .onValue((n) => {
                        var nv = enumeration.map.reduce((a, m) => (n >= m.s) ? m.r : a, enumeration.undefinedValue);
                        app.debug(`mapping ${n} on ${enumeration.source} to '${nv}' on ${enumeration.range}`);
                        delta.addValue(enumeration.range, nv).commit().clear();
                    })));
                    pluginStatus.setDefaultStatus(`Started: maintaining ${pluginConfiguration.enumerations.length} enumerations`);
                }
                else {
                    pluginStatus.setDefaultStatus('Stopped: no configured enumerations');
                }
            }
            catch (e) {
                pluginStatus.setDefaultStatus('Stopped: configuration error');
                app.debug(`${e.lineNumber}: ${e.message}`);
            }
        },
        stop: function () {
            unsubscribes.forEach((f) => f());
            unsubscribes = [];
        },
        registerWithRouter: function (router) {
            router.get('/status', handleRoutes);
        },
        getOpenApi: function () {
            return (require('./openApi.json'));
        }
    };
    /**
     * Create a canonical plugin configuration from the user-supplied
     * JSON configuration. Global and default properties are consolidated
     * so that all properties reside within endpoint object definitions.
     *
     * Fatal errors cause an exception.
     *
     * @param options - contenf of JSON configuration file.
     * @returns - a canonical PluginConfiguration.
     */
    function makePluginConfiguration(options, defaults) {
        var retval = {
            enumerations: options.enumerations.map((option) => new Enumeration_1.Enumeration([option, options, defaults], app))
        };
        return (retval);
    }
    function handleRoutes(req, res) {
        app.debug(`handleRoutes(${req.method}, ${req.path})...`);
        var status;
        try {
            switch (req.path.slice(0, (req.path.indexOf('/', 1) == -1) ? undefined : req.path.indexOf('/', 1))) {
                case '/status':
                    var statusResponse = {};
                    pluginConfiguration.enumerations.forEach((enumeration) => {
                        statusResponse[enumeration.range] = {
                            value: app.getSelfPath(enumeration.range),
                            source: enumeration.source,
                            sourceValue: app.getSelfPath(enumeration.source)
                        };
                    });
                    expressSend(res, 200, statusResponse, req.path);
                    break;
                default:
                    break;
            }
        }
        catch (e) {
            app.debug(e.message);
            expressSend(res, ((/^\d+$/.test(e.message)) ? parseInt(e.message) : 500), null, req.path);
        }
        function expressSend(res, code, body, debugPrefix = null) {
            app.debug(`expressSend(res, ${code}, ${JSON.stringify(body)}, ${debugPrefix})...`);
            const FETCH_RESPONSES = { "200": "Ok", "201": null, "400": "bad request", "403": "forbidden", "404": "not found", "503": "service unavailable (try again later)", "500": "internal server error" };
            res.status(code).send((body) ? body : ((FETCH_RESPONSES['' + code]) ? FETCH_RESPONSES['' + code] : null));
            return (false);
        }
    }
    return (plugin);
};
