# maintain-enums

Create and maintain paths containing enumerated values.

**maintain-enums** is a
[Signal K](https://www.signalk.org/)
plugin which maps numeric values on some specified Signal K path
into string values on some other path.

## System requirements

To operate at all the plugin's JSON configuration file
`~/.signalk/plugin-configuration-data/maintain-enums.json`
must be initialised using either Signal K's plugin configuration GUI
or a text editor.

## Plugin configuration

A
[valid configuration](./src/schema.json)
must contain an 'enumerations' array of objects each of which defines
an enumeration mapping using the following properties:

*source* specifies a Signal K path which is the source of the
mapping and which must return a numeric value.

*range* specifies a Signal K path which is the range of the mapping
into which string values will be written.

*undefinedValue* specifes the string value to be used if *sourcePath*
is undefined or does not supply data.
If not supplied, the default value 'Not available' will be used.

*map* is an array of objects each of which is a pair containing a
source value *s* and a range value *r*.
If the real-time value on *sourcePath* is equal to or greater than
an *s* value then the corresponding *r* value will be written to
*rangePath*.

## Example configurations

This example maintains `navigation.maneuver` in line with the
requirement of the
[Signal K specification](https://github.com/SignalK/specification/)
by mapping the value of a switch which operates a blue board into the
required enumeration value.

```json
{
  "configuration": {
    "undefinedValue": "Not available",
    "enumerations": [
      {
        "source": "electrical.switches.bank.10.5.state",
        "range": "navigation.maneuver",
        "map": [ 
          { "s": 0, "r": "No special maneuver" },
          { "s": 1, "r": "Special maneuver" }
        ]
      }  
    ]  
  },  
  "enabled": true  
}
```

## Plugin API

A simple API is available at `/skServer/openapi/plugins/ais-reporter`.

## Author

Paul Reeve <*preeve_at_pdjr_dot_eu*>
