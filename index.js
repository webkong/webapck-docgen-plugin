const path = require("path");
const fs = require("fs");
const pluginName = "WebpackDocGenPlugin";
/**
 *@description plugin for webpack to make javascript file docgen.
 *@param options<Object> context:String, entry:Array, keys:Array
 *@class selfWebpackPlugin
 */
class WebpackDocGenPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.emit.tap(pluginName, compilation => {
      //title
      let list = "# " + (this.options.title || "Utils list") + "\n\n";
      //description
      list += this.options.description || "Function & Modules list." + "\n\n";

      let context, entry;
      // base context path
      if (!this.options.context) {
        context = compiler.options.context;
      } else if (!path.isAbsolute(this.options.context)) {
        context = path.join(compiler.options.context, this.options.context);
      } else {
        context = this.options.context;
      }
      //entry
      if (!this.options.entry) {
        entry = compiler.options.entry;
      } else {
        entry = this.options.entry;
      }
      // if options has dir
      if (!this.options.dir) {
      } else {
        const reg = /\.\S+$/;
        let pagesPath = {};
        let singleFiles = {};

        let dir = this.options.dir;
        if (!path.isAbsolute(dir)) {
          dir = path.join(compiler.options.context, dir);
        }
        const arr = dir.split("/");
        const prefix = arr[arr.length - 1];
        fs.readdirSync(dir).map(filename => {
          if (reg.test(filename)) {
            singleFiles[filename.replace(/\.\S+/, "")] =
              dir + "/" + filename;
          } else {
            const jsReg = /\.js$/;
            const pagePath = fs
              .readdirSync(path.join(dir, "./" + filename))
              .filter(filename => jsReg.test(filename));
            pagePath.map(name => {
              pagesPath[filename] = dir + "/" + filename + "/" + name;
            });
          }
        });

        entry = {
          ...singleFiles,
          ...pagesPath
        };
      }

      if (Object.prototype.toString.call(entry) === "[object Function]") {
        throw new Error("not support dynamic entry");
      }
      const typeEntry = Object.prototype.toString.call(entry);
      if (typeEntry === "[object String]") {
        entry = [entry];
      } else if (typeEntry === "[object Array]") {
        entry = entry;
      } else if (typeEntry === "[object Object]") {
        let temp = [];
        Object.keys(entry).forEach(key => {
          temp.push({
            name: key,
            path: entry[key]
          });
        });
        entry = temp;
      }
      if (entry) {
        entry.forEach(elem => {
          let filePath = "";
          let moduleName = "";
          if (typeof elem === "string") {
            filePath = path.resolve(context, elem);
            const lastName = filePath.match(/\/([a-z0-9A-z]*)\./)[1];
            if (lastName === "index") {
              moduleName = filePath.match(/([a-z0-9A-z]+)\/[a-z0-9A-z]+\./)[1];
            } else {
              moduleName = lastName;
            }
          } else {
            filePath = path.resolve(context, elem.path);
            moduleName = elem.name;
          }

          const file = fs.readFileSync(filePath, {
            encoding: "UTF-8"
          });

          // const infoArr = file.match(/@name ([\w-]+)\n \* @description ([^\f\n\r\t\v]+)/g)
          const infoArr = file.match(/\/\*(\s|.)*?\*\//g);
          if (infoArr) {
            list += "## " + moduleName + "\n\n";
            infoArr.forEach(block => {
              const arr = block.split("\n * ");
              const name = arr[1].split(" ")[1];
              const paramReg = /@param \{([\w|=]+)\} (\w+)( - )?([\S ]+)?/;
              if (arr[1].split(" ")[0] === "@name") {
                if(moduleName !== name){
                  list += "### " + name + "\n\n";
                }
                list += arr[2].replace("@description ", ">") + "\n\n";
                const params = arr.slice(3, -1);
                if (params.length > 0) {
                  list += "|params| type | required | description | \n";
                  list += "| ---- | ---- | ---- | ---- | \n";
                  list += params
                    .map((param, index) => {
                      const paramArr = paramReg.exec(param);
                      let suffix = "| \n";
                      if (index === params.length - 1) {
                        suffix = "| \n\n";
                      }
                      if (paramArr) {
                        return (
                          "|" +
                          paramArr[2] +
                          "|" +
                          paramArr[1].replace("|", "/").replace("=", "") +
                          "|" +
                          (paramArr[1].indexOf("=") > -1 ? "No" : "Yes") +
                          "|" +
                          (paramArr[4] || " ") +
                          suffix
                        );
                      }
                    })
                    .join("");
                }
                const returnStr = arr[arr.length - 1];
                list +=
                  ">" + returnStr.replace("@", "").replace(/\n[ ]+\*\//, "");
                list += "\n\n";
              }
            });
            list += "\n\n";
          }
        });
      } else {
        throw new Error("not find entry");
      }
      compilation.assets[this.options.docFile || "list.md"] = {
        source() {
          return list;
        },
        size() {
          return list.length;
        }
      };
    });
  }
}

module.exports = WebpackDocGenPlugin;
