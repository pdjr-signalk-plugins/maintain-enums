import { floor } from "lodash";

export class Enumeration {

  public app: any = undefined;
  public sourcePath: string = '';
  public enumerationPath: string = '';
  public undefinedValue: string = "Not available";
  public map: Map[] = [];

  constructor(options: any[], app: any) {
    if (!options[0].hasOwnProperty('sourcePath')) throw new Error('Required sourcePath property is missing');
    if (!options[0].hasOwnProperty('enumerationPath')) throw new Error('Required enumerationPath property is missing');
    if (!options[0].hasOwnProperty('map')) throw new Error('Required map property is missing');

    this.app = app;
    this.sourcePath = getOption(options, 'sourcePath');
    this.enumerationPath = getOption(options, 'enumerationPath');
    this.undefinedValue = getOption(options, 'undefinedValue') || 'Not available'
    this.map = getOptionArray(options, 'map');

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
  a: number,
  b: string
}
