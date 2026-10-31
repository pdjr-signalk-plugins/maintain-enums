"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enumeration = void 0;
class Enumeration {
    constructor(options, app) {
        this.app = undefined;
        this.source = '';
        this.range = '';
        this.undefinedValue = "Not available";
        this.map = [];
        if (!options[0].hasOwnProperty('source'))
            throw new Error(`required 'source' property is missing`);
        if (!options[0].hasOwnProperty('range'))
            throw new Error(`required 'range' property is missing`);
        if (!options[0].hasOwnProperty('map'))
            throw new Error(`required 'map' property is missing`);
        this.app = app;
        this.source = getOption(options, 'source');
        this.range = getOption(options, 'range');
        this.undefinedValue = getOption(options, 'undefinedValue') || 'Not available';
        this.map = getOptionArray(options, 'map');
        /**
         *
         * @param objects - an array of arbitrary objects which may contain 'name'
         * @param name - the identifier of a property that may be contained in 'objects'
         * @param fallback - the value to be returned if 'name' is not found in any object.
         * @returns
         */
        function getOption(options, name) {
            var retval = undefined;
            options.reverse().forEach((opt) => {
                if (opt.hasOwnProperty(name))
                    retval = opt[name];
            });
            return (retval);
        }
        function getOptionArray(options, name) {
            var retval = undefined;
            options.reverse().forEach((opt) => {
                if (opt.hasOwnProperty(name))
                    retval = (Array.isArray(opt[name])) ? opt[name] : [opt[name]];
            });
            return (retval);
        }
    }
}
exports.Enumeration = Enumeration;
