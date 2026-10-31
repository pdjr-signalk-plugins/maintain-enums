import { floor } from "lodash";

export class Enumeration {

  public app: any = undefined;
  public source: string = '';
  public range: string = '';
  public undefinedValue: string = "Not available";
  public map: Map[] = [];

  constructor(options: any[], app: any) {
    if (!options[0].hasOwnProperty('source')) throw new Error(`required 'source' property is missing`);
    if (!options[0].hasOwnProperty('range')) throw new Error(`required 'range' property is missing`);
    if (!options[0].hasOwnProperty('map')) throw new Error(`required 'map' property is missing`);

    this.app = app;
    this.source = getOption(options, 'source');
    this.range = getOption(options, 'range');
    this.undefinedValue = getOption(options, 'undefinedValue') || 'Not available'
    this.map = getOptionArray(options, 'map').sort((a: Map, b: Map) => (a.s - b.s));

    /**
     * 
     * @param objects - an array of arbitrary objects which may contain 'name'
     * @param name - the identifier of a property that may be contained in 'objects'
     * @param fallback - the value to be returned if 'name' is not found in any object.
     * @returns 
     */
    function getOption(options: any[], name: string): any {
      var retval: any = undefined;
      options.reverse().forEach((opt: any) => {
        if (opt.hasOwnProperty(name)) retval = opt[name];
      });
      return(retval);
    }
  
    function getOptionArray(options: any, name: string): any {
      var retval: any = undefined;
      options.reverse().forEach((opt: any) => {
        if (opt.hasOwnProperty(name)) retval = (Array.isArray(opt[name]))?opt[name]:[opt[name]];
      })
      return(retval);
    }
  }
}

interface Map {
  s: number,
  r: string
}
