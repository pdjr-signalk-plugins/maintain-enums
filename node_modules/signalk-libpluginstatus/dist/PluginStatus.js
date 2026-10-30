"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginStatus = void 0;
/**********************************************************************
 * Copyright 2024 Paul Reeve <preeve@pdjr.eu>
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
 *
 * PluginStatus provides a wrapper around the setPluginStatus() method
 * of the Signal K plugin API. This method allows a plugin to write a
 * message to its dashboard status display.
 *
 * This wrapper introduces the idea of default and transient status
 * messages. A default status message one which is normally displayed,
 * whilst a transient message is one which will replace the default
 * message on the dashboard for a short period of time before being
 * automatically be overwritten by the default.
 */
class PluginStatus {
    /**
     * Create a new PluginStatus instance, setting a default status
     * message and, optionally, configuring the time for which transient
     * status messages will be displayed.
     *
     * @param app - handle to Signal K app interface.
     * @param defaultStatus - plugin status default text.
     * @param revertSeconds - number of seconds to display a transient
     *        status message (overrides DEFAULT_REVERT_SECONDS).
     */
    constructor(app, defaultStatus, revertSeconds = 3) {
        this.app = undefined;
        this.defaultStatus = '';
        this.revertSeconds = 0;
        this.debug = false;
        this.revertTimeout = undefined;
        this.app = app;
        this.defaultStatus = (defaultStatus.length > 0) ? defaultStatus.charAt(0).toUpperCase() + defaultStatus.slice(1) : '';
        this.revertSeconds = revertSeconds;
        this.setPluginStatus(this.defaultStatus, true);
    }
    /**
     * Update the plugin status default text with a new value.
     *
     * @param defaultStatus - new plugin status default text.
     */
    setDefaultStatus(defaultStatus) {
        this.defaultStatus = (defaultStatus.length > 0) ? defaultStatus.charAt(0).toUpperCase() + defaultStatus.slice(1) : '';
        if (!this.revertTimeout)
            this.setPluginStatus(this.defaultStatus, true);
    }
    /**
     * Immediately display a status message which will be reverted to the
     * default in due course.
     *
     * @param transientStatus - the message to be displayed.
     */
    setStatus(transientStatus) {
        if (this.revertTimeout) {
            clearTimeout(this.revertTimeout);
            this.revertTimeout = undefined;
        }
        this.setPluginStatus((transientStatus.length > 0) ? `${transientStatus.charAt(0).toUpperCase() + transientStatus.slice(1)}` : '', true);
        this.revertTimeout = setTimeout(this.revertPluginStatus.bind(this), this.revertSeconds * 1000);
    }
    revertPluginStatus() {
        this.revertTimeout = undefined;
        this.setPluginStatus(this.defaultStatus, false);
    }
    setPluginStatus(text, debug = false) {
        if ((debug === true) && (text.length > 0))
            this.app.debug(text.charAt(0).toLowerCase() + text.slice(1));
        this.app.setPluginStatus((text.length > 0) ? `${text.charAt(0).toUpperCase() + text.slice(1)}` : '');
    }
}
exports.PluginStatus = PluginStatus;
