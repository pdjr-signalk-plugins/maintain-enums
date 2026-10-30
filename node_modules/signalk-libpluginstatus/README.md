# signalk-libpluginstatus
Plugin status message manager.

Adds a transient message wrapper around the native Signal K API method
setPluginStatus().

```
import { PluginStatus } from 'signalk-libpluginstatus';

let pluginStatus: PluginStatus = new PluginStatus(app, 'Default message', 5);

pluginStatus('Transient message');
