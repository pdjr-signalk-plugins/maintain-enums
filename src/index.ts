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

import * as _ from 'lodash';
import { PluginStatus } from 'signalk-libpluginstatus';
import { Delta } from 'signalk-libdelta';


const DEFAULT_ENUMERATION_OPTIONS: any = { undefinedValue: "Not available" };

const PLUGIN_ID: string = 'maintain-enums';
const PLUGIN_NAME: string = 'maintain-enums';
const PLUGIN_DESCRIPTION: string = 'Create and maintain paths containing enumerated values.';
import PLUGIN_SCHEMA from './schema.json';
import PLUGIN_UISCHEMA from './uischema.json';
import { Enumeration } from './Enumeration';

module.exports = function(app: any) {
  var unsubscribes: (() => void)[] = [];
  var pluginConfiguration: PluginConfiguration;
  var pluginStatus: PluginStatus;

  const plugin: SKPlugin = {
    id: PLUGIN_ID,
    name: PLUGIN_NAME,
    description: PLUGIN_DESCRIPTION,
    schema: PLUGIN_SCHEMA,
    uiSchema: PLUGIN_UISCHEMA,
  
    start: function(options: any) {
      var delta = new Delta(app, plugin.id);
      pluginStatus = new PluginStatus(app, `started`);

      try {
        pluginConfiguration = makePluginConfiguration(options, DEFAULT_ENUMERATION_OPTIONS);

        if (pluginConfiguration.enumerations.length > 0) {
          unsubscribes = pluginConfiguration.enumerations.map((enumeration) => (
            app.streambundle.getSelfStream(enumeration.source)
            .skipDuplicates()
            .onValue((n: number) => {
              var nv: string = enumeration.map.reduce((a,m) => (n >= m.s)?m.r:a, enumeration.undefinedValue);
              app.debug(`mapping ${n} on ${enumeration.source} to '${nv}' on ${enumeration.range}`);
              delta.addValue(enumeration.range, nv).commit().clear();
            })
          ));
          pluginStatus.setDefaultStatus(`Started: maintaining ${pluginConfiguration.enumerations.length} enumerations`);
        } else {
          pluginStatus.setDefaultStatus('Stopped: no configured enumerations');
        }
      } catch(e: any) {
        pluginStatus.setDefaultStatus('Stopped: configuration error');
        app.debug(`${e.lineNumber}: ${e.message}`);
      }
    },

    stop: function() {
      unsubscribes.forEach((f: any) => f());
      unsubscribes = [];
    },

    registerWithRouter: function(router) {
      router.get('/status', handleRoutes);
    },

    getOpenApi: function() {
      return(require('./openApi.json'));
    }

  }

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
  function makePluginConfiguration(options: any, defaults: any): PluginConfiguration {
    var retval: PluginConfiguration = {
      enumerations: options.enumerations.map((option: any) => new Enumeration([ option, options, defaults ], app))
    };
    return(retval);
  }

  function handleRoutes(req: any, res: any) {
    app.debug(`handleRoutes(${req.method}, ${req.path})...`);
    var status: any;
    try {
      switch (req.path.slice(0, (req.path.indexOf('/', 1) == -1)?undefined:req.path.indexOf('/', 1))) {
        case '/status':
          var statusResponse: Dictionary<Status> = { };
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
    } catch(e: any) {
      app.debug(e.message)
      expressSend(res, ((/^\d+$/.test(e.message))?parseInt(e.message):500), null, req.path)
    }

    function expressSend(res: any, code: number, body: Dictionary<Status> | null, debugPrefix: any = null) {
      app.debug(`expressSend(res, ${code}, ${JSON.stringify(body)}, ${debugPrefix})...`);
      const FETCH_RESPONSES: Dictionary<string | null> = { "200": "Ok", "201": null, "400": "bad request", "403": "forbidden", "404": "not found", "503": "service unavailable (try again later)", "500": "internal server error" }
      res.status(code).send((body)?body:((FETCH_RESPONSES['' + code])?FETCH_RESPONSES['' + code]:null))
      return(false);
    }
  }

  return(plugin);
}

interface SKPlugin {
  id: string,
  name: string,
  description: string,
  schema: object,
  uiSchema: object,

  start: (options: any) => void,
  stop: () => void,
  registerWithRouter: (router: any) => void,
  getOpenApi: () => string
}

interface PluginConfiguration {
  enumerations: Enumeration[]
}

interface Status {
  value: string,
  source: string,
  sourceValue: number
}

interface Dictionary<T> {
  [key: string]: T
}
