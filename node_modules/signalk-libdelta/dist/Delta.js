"use strict";
/**********************************************************************
 * Copyright 2020 Paul Reeve <preeve@pdjr.eu>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you
 * may not use this file except in compliance with the License. You
 * may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delta = void 0;
const _ = require("lodash");
class Delta {
    constructor(app, source) {
        this.values = [];
        this.metas = [];
        this.app = app;
        this.source = source;
    }
    clear() {
        this.values = [];
        this.metas = [];
        return (this);
    }
    addValue(path, value) {
        this.values.push({ "path": path, "value": value });
        return (this);
    }
    addValues(values) {
        if (_.isArray(values)) {
            values.forEach((v) => this.addValue(v.path, v.value));
        }
        else if (_.isObject(values)) {
            for (const [k, v] of Object.entries(values)) {
                this.addValue(k, v);
            }
        }
        else
            throw new Error('argument must be an array or an object');
        return (this);
    }
    addMeta(path, value) {
        this.metas.push({ "path": path, "value": value });
        return (this);
    }
    addMetas(values) {
        if (_.isArray(values)) {
            values.forEach((v) => this.addMeta(v.path, v.value));
        }
        else if (_.isObject(values)) {
            for (const [k, v] of Object.entries(values)) {
                this.addMeta(k, v);
            }
            ;
        }
        else
            throw new Error('argument must be an array or an object');
        return (this);
    }
    count() {
        return (this.values.length + this.metas.length);
    }
    commit(dump = 0) {
        if ((this.values.length) || (this.metas.length)) {
            var delta = { updates: [] };
            if (this.values.length) {
                delta.updates.push({ source: { type: "plugin", src: this.source }, timestamp: (new Date()).toISOString(), values: this.values });
            }
            if (this.metas.length) {
                delta.updates.push({ meta: this.metas });
            }
            this.app.handleMessage(this.source, delta);
            if (dump != 0)
                console.log(JSON.stringify(delta));
        }
        return (this);
    }
    dump() {
        this.commit(2);
    }
}
exports.Delta = Delta;
